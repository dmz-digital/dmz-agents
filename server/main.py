from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load .env first, then .env.dmz as fallback
load_dotenv()
if not os.getenv("GEMINI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY") and not os.getenv("OPENAI_API_KEY"):
    load_dotenv(".env.dmz")

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

app = FastAPI(title="DMZ Agents API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ─── LLM Engine (self-contained) ─────────────────────────────────────────────

def get_llm_response(system_prompt: str, user_prompt: str, history: list = None) -> str:
    if history is None:
        history = []
        
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if anthropic_key:
        from anthropic import Anthropic
        client = Anthropic(api_key=anthropic_key)
        
        msgs = []
        for h in history:
            role = "user" if h.get("role") == "user" else "assistant"
            content = h.get("content", "")
            if content.strip():
                msgs.append({"role": role, "content": content})
        msgs.append({"role": "user", "content": user_prompt})
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=8192,
            system=system_prompt,
            messages=msgs
        )
        return response.content[0].text

    elif openai_key:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        
        msgs = [{"role": "system", "content": system_prompt}]
        for h in history:
            role = "user" if h.get("role") == "user" else "assistant"
            content = h.get("content", "")
            if content.strip():
                msgs.append({"role": role, "content": content})
        msgs.append({"role": "user", "content": user_prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=msgs,
            max_tokens=4096
        )
        return response.choices[0].message.content

    elif gemini_key:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        
        contents = []
        for h in history:
            role = "user" if h.get("role") == "user" else "model"
            content = h.get("content", "")
            if content.strip():
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=content)]))
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)]))
        
        chat_model = get_model("chat", "gemini-2.0-flash")
        response = client.models.generate_content(
            model=chat_model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=8192
            ),
        )
        return response.text

    else:
        raise ValueError("Nenhuma chave de LLM configurada. Por favor, configure ANTHROPIC_API_KEY, OPENAI_API_KEY ou GEMINI_API_KEY.")


def get_agent_prompt(agent_id: str) -> str:
    """Fetches agent master prompt from DB. No hardcoded fallback — prompts MUST exist in admin."""
    try:
        res = supabase.table("dmz_agents_prompts") \
            .select("content") \
            .eq("agent_id", agent_id) \
            .eq("active", True) \
            .order("version", desc=True) \
            .limit(1) \
            .execute()
        if res.data and res.data[0].get("content"):
            return res.data[0]["content"]
    except Exception as e:
        print(f"[WARN] Failed to load prompt for agent '{agent_id}': {e}")
    # No hardcoded fallback — return a minimal identity so the LLM doesn't hallucinate
    return f"Você é o agente '{agent_id}' do squad DMZ. Seu prompt ainda não foi configurado no painel admin. Responda de forma prestativa até que seu prompt seja definido."


def get_sys_prompt(p_id: str) -> str:
    """Fetches a system/tool prompt from DB. No hardcoded fallback."""
    try:
        res = supabase.table("dmz_agents_prompts") \
            .select("content") \
            .eq("agent_id", p_id) \
            .eq("active", True) \
            .limit(1) \
            .execute()
        if res.data and res.data[0].get("content"):
            return res.data[0]["content"]
    except Exception as e:
        print(f"[WARN] Failed to load sys prompt '{p_id}': {e}")
    return ""


def get_model(purpose: str, default: str = "gemini-2.0-flash") -> str:
    """Fetches the model ID for a given purpose from admin_system_models table."""
    try:
        res = supabase.table("admin_system_models") \
            .select("model_id") \
            .eq("purpose", purpose) \
            .eq("active", True) \
            .limit(1) \
            .execute()
        if res.data and res.data[0].get("model_id"):
            return res.data[0]["model_id"]
    except Exception as e:
        print(f"[WARN] Failed to load model for '{purpose}': {e}")
    return default


def process_artifacts(response_text: str) -> str:
    """Parses <dmz_artifact type="document">, generates binary docx, uploads, and injects url."""
    import re
    import tempfile
    import uuid
    import os

    # Look for document artifacts
    pattern = r'<dmz_artifact\s+type="document"\s+filename="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/dmz_artifact>'
    
    def replacer(match):
        filename = match.group(1)
        title = match.group(2)
        content = match.group(3).strip()
        
        try:
            from docx import Document
            doc = Document()
            for line in content.split('\n'):
                l = line.strip()
                if l.startswith('# '): doc.add_heading(l[2:], level=1)
                elif l.startswith('## '): doc.add_heading(l[3:], level=2)
                elif l.startswith('### '): doc.add_heading(l[4:], level=3)
                elif l.startswith('- ') or l.startswith('* '): doc.add_paragraph(l[2:], style='List Bullet')
                elif l: doc.add_paragraph(l)

            # Save temporarily
            fd, tmp_path = tempfile.mkstemp(suffix=".docx")
            os.close(fd)
            doc.save(tmp_path)
            
            # Upload to Supabase dmz-chat-files
            bucket_name = "dmz-chat-files"
            file_key = f"artifacts/{uuid.uuid4().hex}_{filename}"
            with open(tmp_path, "rb") as f:
                supabase.storage.from_(bucket_name).upload(file_key, f)
            os.remove(tmp_path)
            
            # Retrieve public URL
            res_url = supabase.storage.from_(bucket_name).get_public_url(file_key)
            # Reconstruct tag substituting content with URL and changing type to docx_url
            return f'<dmz_artifact type="document_url" filename="{filename}" title="{title}" url="{res_url}"></dmz_artifact>'
        except Exception as e:
            print(f"[WARN] Failed to process document artifact: {e}")
            return match.group(0) # fallback to original

    return re.sub(pattern, replacer, response_text)


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "DMZ Agents API is running", "status": "healthy", "version": "2.0"}


@app.get("/health")
async def health():
    llm_provider = "none"
    if os.getenv("ANTHROPIC_API_KEY"): llm_provider = "anthropic"
    elif os.getenv("OPENAI_API_KEY"): llm_provider = "openai"
    elif os.getenv("GEMINI_API_KEY"): llm_provider = "gemini"
    return {"status": "healthy", "llm_provider": llm_provider}


@app.get("/agents")
async def get_agents():
    try:
        response = supabase.table("dmz_agents_definitions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/projects")
async def get_projects():
    try:
        response = supabase.table("dmz_agents_projects").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    message: str
    agent_id: str = "orch"
    project_id: str = "default"
    tool: str | None = None
    file_url: str | None = None
    file_type: str | None = None
    history: list = []


@app.post("/chat")
async def chat_interaction(req: ChatRequest):
    try:
        # Original assigned agent
        agent_db_id = req.agent_id
        if agent_db_id == "orch":
            agent_db_id = "orchestrator"

        # Build full message early for routing 
        full_message = req.message or ""

        # --- ROUTING LOGIC ---
        # If talking to orch, check if user explicitly requested another agent
        if agent_db_id == "orchestrator" and full_message.strip():
            route_prompt = f"""O usuário está enviando uma mensagem para o Orchestrator do Squad. 
A mensagem: '{full_message}'
O usuário pediu explicitamente para falar com alguém de Design, UX, Backend, Jurídico ou outro especialista na equipe?
Responda APENAS com o handle do agente desejado se sim, ou "NOPE" se não pediu para mudar. 
Possíveis agentes e temas:
- aurora (Design: imagens, visual, design de interface)
- victoria (UX: fluxo, wireframes, usabilidade)
- ryan (Developer: backend, infra, código)
- theron (Legal: contratos, análise jurídica)
- cassandra (Copy: textos, marketing)
- lucas (PO: produto, requisitos)
- sofia (Banco de Dados)"""
            
            try:
                # Fast classification
                route_decision = get_llm_response("Você é um roteador rígido. Responda apenas com a palavra pedida.", route_prompt).strip().lower()
                valid_handles = ["aurora", "victoria", "ryan", "theron", "cassandra", "lucas", "sofia"]
                if any(h in route_decision for h in valid_handles):
                    for h in valid_handles:
                        if h in route_decision:
                            agent_db_id = "design_chief" if h == "aurora" else ("developer" if h == "ryan" else ("legal_chief" if h == "theron" else ("copy_chief" if h == "cassandra" else h)))
                            if h == "victoria": agent_db_id = "ux"
                            if h == "sofia": agent_db_id = "db_sage"
                            if h == "lucas": agent_db_id = "po"
                            # Update the returned agent_id!
                            req.agent_id = h
                            # Add context so the specialist responds directly
                            full_message = f"[CONTEXTO: Você foi chamado pelo Orchestrator para responder diretamente ao usuário. Responda como se estivesse falando diretamente com ele, sem mencionar que foi 'chamado' ou que precisa 'aguardar'. Vá direto ao assunto.]\n\n{full_message}"
                            # Clear history from orch context to avoid confusion
                            req.history = req.history[-2:] if len(req.history) > 2 else req.history
                            break
            except Exception:
                pass


        # Build system prompt from DB
        system_prompt = get_agent_prompt(agent_db_id)

        # Apply global formatting rule
        formatting = get_sys_prompt("system_formatting")
        if formatting:
            system_prompt += "\n" + formatting

        # CRITICAL: Never expose internal names, always execute tasks
        system_prompt += (
            "\n\nREGRAS ABSOLUTAS DE COMPORTAMENTO (NUNCA VIOLAR):"
            "\n- NUNCA mencione nomes internos de ferramentas, IDs, ou handles técnicos na resposta ao usuário."
            "\n- NUNCA escreva coisas como ('image_generator'), ('tool_name'), agent_id, etc."
            "\n- Se o usuário pedir para gerar imagens, GERE as imagens. Não diga que vai 'acionar um especialista'."
            "\n- Se o usuário pedir para pesquisar, PESQUISE. Não diga que vai 'chamar alguém'."
            "\n- Responda DIRETO ao pedido do usuário com a ação executada."
            "\n- Ao mencionar colegas da equipe, use apenas o @nome (ex: @aurora, @cassandra)."
        )

        # Artifacts Rendering Rules
        system_prompt += (
            "\n\nGERAÇÃO DE ARTEFATOS E ARQUIVOS (MANDATÓRIO):"
            "\nSe a sua resposta envolver criar um arquivo completo (Landing Page, Documento, Componente UI, etc), VOCÊ DEVE encapsular esse código integralmente dentro de tags XML `<dmz_artifact>` na sua resposta. NUNCA envie HTML quebrado no chat. Formato exato:"
            "\n<dmz_artifact type=\"(html|jsx|document)\" filename=\"nome-do-arquivo.ext\" title=\"Título Legível\">"
            "\n   [Todo o código aqui]"
            "\n</dmz_artifact>"
            "\n"
            "\nIMPORTANTE: NUNCA envolva a tag <dmz_artifact> em blocos de código markdown (```). Use as tags XML diretamente no seu texto."
            "\n"
            "\n## REGRAS ESTÉTICAS ABSOLUTAS PARA HTML/UI (NÍVEL PREMIUM/LUXURY):"
            "\nO usuário do DMZ abomina UIs genéricas (ex: tela branca com Inter e botões azuis simples). Você deve surpreendê-lo com design digno de prêmios (Awwwards)."
            "\n"
            "\n1. Tipografia de Alto Padrão: Sempre importe do Google Fonts fontes de impacto. Use fontes Display para títulos (Ex: 'Montserrat', 'Playfair Display', 'Clash Display', 'Outfit') (weight: 600-800) e fontes Sans limpas para textos (weight: 300-400). Jamais use Roboto, Arial ou system-ui genérica."
            "\n2. Sistema de Cores e Fundo (Luxury Dark Theming encorajado): NUNCA use #000000 ou #ffffff puro no background principal. Use cinzas dinâmicos/matizes suaves (#0A0A0F, #FAFAF7, etc). Use no máximo 1 cor vibrante como Acento (Accent) com variações de opacidade (rgba)."
            "\n3. Efeitos Atmosféricos em Dark Themes (OBRIGATÓRIO usar Tailwind ou CSS In-line):"
            "\n   - Se criar fundos escuros, obrigatoriamente gere uma textura de \"noise\" suave (pointer-events: none, opacity: 0.1) cobrindo a tela."
            "\n   - Construa um brilho ambiente (Glow) invisível rodando ao fundo usando pseudo elementos com \"radial-gradient\" sutis nas pontas (#accent rgba)."
            "\n4. Bordas Elegantes: Jamais use bordas cinzas sólidas e grossas em dark mode. Use SEMPRE rgba branco ultra suave [border: 1px solid rgba(255,255,255,0.08)]."
            "\n5. Animações Modernas e Orgânicas (CÓDIGO OBRIGATÓRIO PARA LANDING PAGES):"
            "\n   - Adicione no corpo da sua página JS um IntersectionObserver. As seções (hero, blocos de cards, textos) devem brotar suavemente no scroll (opacity 0->1, translateY 20-30px) de forma escalonada (delay)."
            "\n   - Hover obrigatório em elementos interativos com transition suave (0.3s ease-out), como glows nos cards via border-color ou shadow."
            "\n   - Só anime \"opacity\" e \"transform\". NUNCA use loops infinitos nervosos nem anime \"width/margin/left\"."
            "\n6. Arquitetura Independente: Adicione Tailwind via script CDN (<script src=\"https://cdn.tailwindcss.com\"></script>), inclua os ícones SVG via lucide-react CDN."
            "\n7. Tudo precisa funcionar auto-contido. O documento HTML que você devolver dentro de <html> até </html> não pode depender de mais nada local."
            "\n"
            "\n## ESTRUTURA E COMPLEXIDADE (LANDING PAGES COMPLETAS):"
            "\n- NUNCA crie apenas uma seção 'Hero'. Se o usuário pediu uma landing page, ele espera um fluxo de conversão completo."
            "\n- OBRIGATÓRIO ter no mínimo 5 seções distintas: 1. Hero, 2. Problema/Solução ou Features detalhadas, 3. Social Proof/Depoimentos ou Números, 4. FAQ ou Processo, 5. CTA Final e Footer."
            "\n- Use espaçamentos generosos (py-24, py-32) entre seções. Dê respiro ao design."
            "\n- Cada seção deve ter um layout visualmente diferente da anterior (ex: zig-zag de imagens/texto, grids de cards, seções full-width com background accent)."
            "\n- NÃO SEJA PREGUIÇOSO. Escreva o código completo para uma experiência de navegação rica."
        )


        # Handle tool logic
        # Auto-detect image generation from natural language (if no tool explicitly selected)
        effective_tool = req.tool
        if not effective_tool and full_message.strip():
            import re
            msg_lower = full_message.lower()
            # Remove internal transcription marker for detection
            clean_for_detection = msg_lower.replace("[transcrição interna do áudio]:", "").strip()
            # Remove routing context
            if "[contexto:" in clean_for_detection:
                clean_for_detection = clean_for_detection.split("]\n\n", 1)[-1] if "]\n\n" in clean_for_detection else clean_for_detection
            
            # Regex patterns for image generation requests
            img_patterns = [
                r'ger[ea]\s+\d*\s*imagen[s]?',       # gere/gera 3 imagens, gere imagens
                r'cri[ea]\s+\d*\s*imagen[s]?',        # crie/cria 3 imagens
                r'fa[çz][ao]\s+\d*\s*imagen[s]?',     # faça 3 imagens
                r'ger[ea]r?\s+\d*\s*imagen[s]?',      # gerar imagens
                r'ger[ea]r?\s+\d*\s*foto[s]?',        # gerar fotos
                r'cri[ea]r?\s+\d*\s*foto[s]?',        # criar fotos
                r'ger[ea]r?\s+(uma?\s+)?imagem',       # gerar uma imagem
                r'cri[ea]r?\s+(uma?\s+)?imagem',       # criar uma imagem
                r'fa[çz][ao]\s+(uma?\s+)?imagem',      # faça uma imagem
                r'ger[ea]r?\s+(um\s+)?logo',           # gerar logo
                r'cri[ea]r?\s+(uma?\s+)?arte',         # criar arte
                r'desenh[ea]r?\s',                     # desenhe/desenhar
                r'generate\s+\d*\s*image',             # generate image
                r'create\s+\d*\s*image',               # create image
                r'make\s+\d*\s*image',                 # make image
                r'draw\s',                             # draw
                r'ilustr[ea]r?\s',                     # ilustrar/ilustre
                r'ger[ea]r?\s+\d*\s*ilustra',          # gerar ilustração
            ]
            if any(re.search(p, clean_for_detection) for p in img_patterns):
                effective_tool = "createImage"
                print(f"[chat] Auto-detected image generation request: {clean_for_detection[:60]}")

        if effective_tool == "searchWeb":
            tool_prompt = get_sys_prompt("tool_search_web")
            if tool_prompt:
                system_prompt += "\n" + tool_prompt
            firecrawl_key = os.getenv("FIRECRAWL_API_KEY")
            if firecrawl_key:
                try:
                    import requests as req_lib
                    search_query_prompt = f"Usuário ordenou pesquisa web sobre: '{full_message}'. Escreva APENAS o termo de busca (sem citações)."
                    search_query = get_llm_response("Seja direto.", search_query_prompt).strip()
                    fc_resp = req_lib.post(
                        "https://api.firecrawl.dev/v1/search", 
                        json={"query": search_query, "limit": 4}, 
                        headers={"Authorization": f"Bearer {firecrawl_key}", "Content-Type": "application/json"},
                        timeout=15
                    )
                    if fc_resp.status_code == 200:
                        results = fc_resp.json().get("data", [])
                        snippets = "\n\n".join([f"[{r.get('title')}]({r.get('url')}): {r.get('description', '')}" for r in results])
                        full_message += f"\n\n[CONTEXTO RETORNADO DA WEB VIA FIRECRAWL PARA '{search_query}']:\n{snippets[:3000]}"
                    else:
                        full_message += f"\n\n[Firecrawl API falhou com status {fc_resp.status_code}]"
                except Exception as e:
                    full_message += f"\n\n[Erro ao tentar Firecrawl: {str(e)}]"
        elif effective_tool == "createImage":
            gemini_key = os.getenv("GEMINI_API_KEY")
            if gemini_key:
                from google import genai
                from google.genai import types
                import uuid
                import re as re_mod
                import base64
                
                # Clean internal markers from the message for cleaner prompt
                clean_msg = full_message.replace("[Transcrição Interna do Áudio]:", "").strip()
                if "[CONTEXTO:" in clean_msg:
                    clean_msg = clean_msg.split("]\n\n", 1)[-1] if "]\n\n" in clean_msg else clean_msg
                
                # Detect how many images requested (default 1, max 4)
                num_match = re_mod.search(r'(\d+)\s*imagen[s]?', clean_msg.lower())
                if not num_match:
                    num_match = re_mod.search(r'(\d+)\s*foto[s]?', clean_msg.lower())
                if not num_match:
                    num_match = re_mod.search(r'(\d+)\s*ilustra', clean_msg.lower())
                num_images = min(int(num_match.group(1)), 4) if num_match else 1
                
                # Get model from admin (default: gemini-3-pro-image-preview)
                image_model = get_model("image_generation", "gemini-3-pro-image-preview")
                print(f"[chat] Using image model: {image_model}, generating {num_images} image(s)")
                
                try:
                    client = genai.Client(api_key=gemini_key)
                    generated_urls = []
                    
                    for i in range(num_images):
                        # Use generate_content API (required for gemini-3-pro-image-preview)
                        img_prompt = f"Generate a high quality, photorealistic image: {clean_msg}"
                        if num_images > 1:
                            img_prompt += f" (variation {i+1} of {num_images}, make each unique)"
                        
                        response = client.models.generate_content(
                            model=image_model,
                            contents=img_prompt,
                            config=types.GenerateContentConfig(
                                response_modalities=['TEXT', 'IMAGE'],
                            ),
                        )
                        
                        # Extract image from response parts
                        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                            for part in response.candidates[0].content.parts:
                                if part.inline_data and part.inline_data.mime_type and part.inline_data.mime_type.startswith("image/"):
                                    img_bytes = part.inline_data.data
                                    ext = "png" if "png" in part.inline_data.mime_type else "jpg"
                                    file_name = f"generated/{uuid.uuid4()}.{ext}"
                                    content_type = part.inline_data.mime_type
                                    supabase.storage.from_("images").upload(file_name, img_bytes, {"content-type": content_type})
                                    img_url = supabase.storage.from_("images").get_public_url(file_name)
                                    generated_urls.append(img_url)
                                    break  # one image per iteration
                    
                    if not generated_urls:
                        raise ValueError("O modelo não retornou imagens na resposta.")
                    
                    images_md = "\n".join([f"![Imagem {i+1}]({url})" for i, url in enumerate(generated_urls)])
                    count_word = f"{len(generated_urls)} imagens" if len(generated_urls) > 1 else "a imagem"
                    msg_surround = get_llm_response(
                        system_prompt,
                        f"Você acabou de gerar {count_word} com sucesso para o usuário. "
                        f"Dê uma resposta muito breve e amigável apresentando. "
                        f"NUNCA mencione nomes técnicos de ferramentas ou IDs internos. O pedido original foi: {clean_msg}"
                    )
                    return {
                        "agent_id": req.agent_id,
                        "content": f"{msg_surround}\n\n{images_md}",
                        "status": "success"
                    }
                except Exception as e:
                    print(f"[chat] Image generation error: {e}")
                    return {
                        "agent_id": req.agent_id,
                        "content": f"Não foi possível gerar a imagem neste momento. Erro: {str(e)}",
                        "status": "error"
                    }
            else:
                system_prompt += "\nMODO GERAÇÃO DE IMAGEM: A API do Google (Gemini API_KEY) não está configurada, então apenas descreva a imagem."
        elif effective_tool == "writeCode":
            code_prompt = get_sys_prompt("tool_write_code")
            if code_prompt:
                system_prompt += "\n" + code_prompt

        # Detect attachment type
        att_type = (req.file_type or "").lower()
        file_ext = (req.file_url or "").split(".")[-1].lower() if req.file_url else ""
        is_image = "image" in att_type or file_ext in ["jpg", "jpeg", "png", "gif", "webp", "heic", "avif"]
        is_audio = "audio" in att_type or file_ext in ["mp3", "wav", "m4a", "ogg", "opus", "flac", "aac"]
        is_pdf = "pdf" in att_type or file_ext == "pdf"

        # Apply attachment-specific system prompts
        if req.file_url:
            if is_image:
                img_prompt = get_sys_prompt("attachment_image")
                if img_prompt:
                    system_prompt += "\n" + img_prompt
            elif is_audio:
                audio_prompt = get_sys_prompt("attachment_audio")
                if audio_prompt:
                    system_prompt += "\n" + audio_prompt
            elif is_pdf:
                pdf_prompt = get_sys_prompt("attachment_pdf")
                if pdf_prompt:
                    system_prompt += "\n" + pdf_prompt

        # For image attachments: use multimodal LLM if possible
        if req.file_url and is_image:
            gemini_key = os.getenv("GEMINI_API_KEY")
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")

            if gemini_key:
                from google import genai
                from google.genai import types
                import requests as req_lib
                
                client = genai.Client(api_key=gemini_key)

                # Fetch the image to bytes since Gemini API requires direct bytes or gs:// URI
                img_resp = req_lib.get(req.file_url, timeout=10)
                img_part = types.Part.from_bytes(data=img_resp.content, mime_type=req.file_type or "image/jpeg")

                # Build conversation history for memory
                contents = []
                for h in req.history:
                    role_h = "user" if h.get("role") == "user" else "model"
                    content_h = h.get("content", "")
                    if content_h.strip():
                        contents.append(types.Content(role=role_h, parts=[types.Part.from_text(text=content_h)]))
                
                # Current message prompt
                prompt_parts = [img_part]
                if full_message:
                    prompt_parts.append(types.Part.from_text(text=full_message))
                
                contents.append(types.Content(role="user", parts=prompt_parts))

                try:
                    response = client.models.generate_content(
                        model='gemini-2.0-flash',
                        contents=contents,
                        config=types.GenerateContentConfig(system_instruction=system_prompt)
                    )
                    return {"agent_id": req.agent_id, "content": response.text, "status": "success"}
                except Exception as e:
                    return {"agent_id": req.agent_id, "content": f"Erro na análise de imagem com Gemini: {str(e)}", "status": "error"}

            elif anthropic_key:
                # Anthropic: fetch image and send as base64
                import base64, requests as req_lib
                img_resp = req_lib.get(req.file_url, timeout=10)
                img_b64 = base64.standard_b64encode(img_resp.content).decode("utf-8")
                media_type = req.file_type or "image/jpeg"

                from anthropic import Anthropic
                client = Anthropic(api_key=anthropic_key)
                
                msgs = []
                for h in req.history:
                    role_h = "user" if h.get("role") == "user" else "assistant"
                    content_h = h.get("content", "")
                    if content_h.strip():
                        msgs.append({"role": role_h, "content": content_h})
                
                msgs.append({
                    "role": "user",
                    "content": [
                        {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": img_b64}},
                        {"type": "text", "text": full_message or "Analise esta imagem."}
                    ]
                })

                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4096,
                    system=system_prompt,
                    messages=msgs
                )
                return {"agent_id": req.agent_id, "content": response.content[0].text, "status": "success"}

        # For audio with transcription: include the full transcription as context
        if req.file_url and is_audio:
            if full_message.strip():
                # The message IS the transcription or user added text alongside audio
                pass
            else:
                full_message = "[O usuário enviou um arquivo de áudio. URL: " + req.file_url + "]"

        # For non-image, non-audio or fallback: append context to message text
        elif req.file_url and not is_image:
            full_message += f"\n\n[Arquivo anexado: {req.file_url} — Tipo: {req.file_type}]"

        # Call LLM (text mode)
        response_text = get_llm_response(system_prompt, full_message, req.history)
        
        # Post-process generated artifacts to native formats (Docx, etc)
        response_text = process_artifacts(response_text)

        return {
            "agent_id": req.agent_id,
            "content": response_text,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Audio Transcription Endpoint ─────────────────────────────────────────────

class TranscribeRequest(BaseModel):
    audio_url: str
    file_name: str = "audio.webm"

@app.post("/transcribe")
async def transcribe_audio(req: TranscribeRequest):
    """
    Downloads audio from URL, uploads to Gemini Files API,
    and returns full transcription. Supports files up to 2 hours.
    """
    import requests as req_lib
    import tempfile
    import time

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    try:
        # 1. Download audio from Supabase
        print(f"[transcribe] Downloading: {req.audio_url[:80]}...")
        audio_resp = req_lib.get(req.audio_url, timeout=120, stream=True)
        if audio_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to download audio: HTTP {audio_resp.status_code}")

        # Determine MIME type
        ext = req.file_name.rsplit(".", 1)[-1].lower() if "." in req.file_name else "webm"
        mime_map = {
            "mp3": "audio/mpeg", "wav": "audio/wav", "m4a": "audio/m4a",
            "ogg": "audio/ogg", "opus": "audio/opus", "flac": "audio/flac",
            "aac": "audio/aac", "webm": "audio/webm", "3gp": "audio/3gpp",
            "amr": "audio/amr",
        }
        mime_type = mime_map.get(ext, f"audio/{ext}")

        # 2. Save to temp file
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
            for chunk in audio_resp.iter_content(chunk_size=8192):
                tmp.write(chunk)
            tmp_path = tmp.name

        file_size = os.path.getsize(tmp_path)
        print(f"[transcribe] Downloaded {file_size / 1024 / 1024:.1f} MB as {mime_type}")

        # 3. Upload to Gemini Files API
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)

        print(f"[transcribe] Uploading to Gemini Files API...")
        uploaded_file = client.files.upload(
            file=tmp_path,
            config={"mime_type": mime_type, "display_name": req.file_name}
        )

        # 4. Wait for file processing (Gemini processes async for large files)
        print(f"[transcribe] File uploaded: {uploaded_file.name}, state: {uploaded_file.state}")
        max_wait = 300  # 5 minutes max wait
        waited = 0
        while uploaded_file.state.name == "PROCESSING" and waited < max_wait:
            time.sleep(5)
            waited += 5
            uploaded_file = client.files.get(name=uploaded_file.name)
            print(f"[transcribe] Waiting... state: {uploaded_file.state} ({waited}s)")

        if uploaded_file.state.name == "FAILED":
            raise HTTPException(status_code=500, detail="Gemini failed to process the audio file")

        # 5. Transcribe using Gemini — load prompt from admin DB
        print(f"[transcribe] Requesting transcription...")
        
        # Fetch transcription prompt from DB (voice_transcription)
        transcription_prompt = get_sys_prompt("voice_transcription")
        if not transcription_prompt or len(transcription_prompt) < 50:
            # Fallback with strong paragraph formatting
            transcription_prompt = (
                "Você é o módulo de transcrição de áudio do DMZ.\n"
                "Sua função é processar e transcrever áudios enviados pelo usuário com máxima fidelidade.\n\n"
                "REGRAS:\n"
                "- Mantenha a transcrição fiel ao que foi dito, preservando pausas e ênfases quando relevante.\n"  
                "- Corrija erros gramaticais óbvios de fala, mas mantenha o tom e vocabulário original.\n"
                "- Se o áudio estiver inaudível em trechos, indique [inaudível] no ponto exato.\n"
                "- Se houver múltiplos falantes, tente identificá-los como Falante 1, Falante 2, etc.\n"
                "- Após a transcrição, ofereça um resumo dos pontos principais se o áudio for longo (>2min)."
            )
        
        # Always append strong paragraph formatting instruction
        paragraph_instruction = (
            "\n\nFORMATAÇÃO OBRIGATÓRIA:\n"
            "- Você DEVE separar a transcrição em parágrafos curtos de no máximo 3-4 frases cada.\n"
            "- Use DUAS quebras de linha (\\n\\n) entre cada parágrafo.\n"
            "- Quando o assunto mudar, inicie um novo parágrafo.\n"
            "- Quando houver pausa natural na fala, inicie um novo parágrafo.\n"
            "- NUNCA retorne a transcrição como um bloco contínuo de texto.\n"
            "- O resultado deve ser fácil de ler, com parágrafos bem definidos."
        )
        
        full_transcription_prompt = transcription_prompt + paragraph_instruction
        
        transcription_model = get_model("transcription", "gemini-2.0-flash")
        response = client.models.generate_content(
            model=transcription_model,
            contents=[
                types.Part.from_uri(
                    file_uri=uploaded_file.uri,
                    mime_type=mime_type
                ),
                full_transcription_prompt
            ],
            config=types.GenerateContentConfig(
                max_output_tokens=65536,
            )
        )

        transcription = response.text
        print(f"[transcribe] Done! Transcription length: {len(transcription)} chars")

        # 6. Cleanup
        try:
            os.unlink(tmp_path)
            client.files.delete(name=uploaded_file.name)
        except Exception:
            pass

        return {
            "transcription": transcription,
            "duration_estimate": f"{file_size / 1024 / 16:.0f}s",  # rough estimate
            "char_count": len(transcription),
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[transcribe] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
