"""
DMZ OS — Motor de Comunicação com LLMs
Suporta Anthropic, OpenAI e Google Gemini.
"""

import os
from typing import Optional

def get_llm_response(system_prompt: str, user_prompt: str, model_type: str = "primary") -> str:
    """
    Tenta usar o provedor configurado.
    Prioridade: Anthropic > OpenAI > Gemini.
    """
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if anthropic_key:
        return _call_anthropic(anthropic_key, system_prompt, user_prompt)
    elif openai_key:
        return _call_openai(openai_key, system_prompt, user_prompt)
    elif gemini_key:
        return _call_gemini(gemini_key, system_prompt, user_prompt)
    else:
        raise ValueError("Nenhuma chave de LLM encontrada no .env.dmz")

def _call_anthropic(api_key: str, system_prompt: str, user_prompt: str) -> str:
    from anthropic import Anthropic
    client = Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",  # Ou outro modelo configurável
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return response.content[0].text

def _call_openai(api_key: str, system_prompt: str, user_prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    return response.choices[0].message.content

def _call_gemini(api_key: str, system_prompt: str, user_prompt: str) -> str:
    from google import genai
    from google.genai import types
    
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
        ),
    )
    return response.text
