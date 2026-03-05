"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Mic, Send, Plus, Settings2, X, Globe, Pencil, Paintbrush, Telescope, Lightbulb, FileAudio, StopCircle, Play, Pause, CloudUpload, FileText, Film, Image } from "lucide-react";

// --- Utility Function & Radix Primitives ---
type ClassValue = string | number | boolean | null | undefined;
function cn(...inputs: ClassValue[]): string { return inputs.filter(Boolean).join(" "); }

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (<TooltipPrimitive.Portal><TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("relative z-50 max-w-[280px] rounded-md bg-neutral-900 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 shadow-xl", className)} {...props}>{props.children}{showArrow && <TooltipPrimitive.Arrow className="-my-px fill-neutral-900" />}</TooltipPrimitive.Content></TooltipPrimitive.Portal>));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (<PopoverPrimitive.Portal><PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-64 rounded-2xl bg-white p-2 text-neutral-900 shadow-2xl border border-neutral-100 outline-none animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} /></PopoverPrimitive.Portal>));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (<DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => (<DialogPortal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className)} {...props}><div className="relative bg-white rounded-[32px] overflow-hidden shadow-2xl p-1">{children}<DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-white/80 backdrop-blur-md p-1.5 hover:bg-neutral-100 transition-all"><X className="h-5 w-5 text-neutral-500" /><span className="sr-only">Close</span></DialogPrimitive.Close></div></DialogPrimitive.Content></DialogPortal>));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const toolsList = [
    { id: 'createImage', name: 'Gerar uma imagem', shortName: 'Gerar Imagem', icon: Paintbrush },
    { id: 'searchWeb', name: 'Deep web research', shortName: 'Deep Research', icon: Globe },
    { id: 'writeCode', name: 'Escrever código', shortName: 'Código', icon: Pencil },
];

interface PromptBoxProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onSend?: (text: string, files?: File[], toolId?: string | null) => void;
    onStartRecording?: () => void;
    onStopRecording?: () => void;
    isRecording?: boolean;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
    ({ className, onSend, onStartRecording, onStopRecording, isRecording, ...props }, ref) => {
        const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
        const fileInputRef = React.useRef<HTMLInputElement>(null);
        const audioPreviewRef = React.useRef<HTMLAudioElement>(null);
        const localMediaRecorderRef = React.useRef<MediaRecorder | null>(null);
        const localAudioChunksRef = React.useRef<Blob[]>([]);

        const [value, setValue] = React.useState("");
        const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);
        const [selectedTool, setSelectedTool] = React.useState<string | null>(null);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isDragging, setIsDragging] = React.useState(false);
        const [isLocalRecording, setIsLocalRecording] = React.useState(false);
        const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);
        const [audioPreviewUrl, setAudioPreviewUrl] = React.useState<string | null>(null);
        const [audioPlaying, setAudioPlaying] = React.useState(false);
        const [recordingSeconds, setRecordingSeconds] = React.useState(0);
        const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
        const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
        const [modalDragging, setModalDragging] = React.useState(false);

        React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);

        React.useLayoutEffect(() => {
            const textarea = internalTextareaRef.current;
            if (textarea) {
                textarea.style.height = "auto";
                const newHeight = Math.min(textarea.scrollHeight, 200);
                textarea.style.height = `${newHeight}px`;
            }
        }, [value]);

        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setValue(e.target.value);
            if (props.onChange) props.onChange(e);
        };

        const handlePlusClick = () => {
            setIsUploadModalOpen(true);
        };

        // ── Internal audio recording (self-contained, gives preview) ──────────
        const startLocalRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                localMediaRecorderRef.current = recorder;
                localAudioChunksRef.current = [];
                recorder.ondataavailable = (ev) => localAudioChunksRef.current.push(ev.data);
                recorder.onstop = () => {
                    const blob = new Blob(localAudioChunksRef.current, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    setRecordedBlob(blob);
                    setAudioPreviewUrl(url);
                    setIsLocalRecording(false);
                    stream.getTracks().forEach(t => t.stop());
                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                };
                recorder.start();
                setIsLocalRecording(true);
                setRecordingSeconds(0);
                recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
                onStartRecording?.();
            } catch {
                alert('Não foi possível acessar o microfone.');
            }
        };

        const stopLocalRecording = () => {
            if (localMediaRecorderRef.current && isLocalRecording) {
                localMediaRecorderRef.current.stop();
                onStopRecording?.();
            }
        };

        const discardRecording = () => {
            if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
            setRecordedBlob(null);
            setAudioPreviewUrl(null);
            setAudioPlaying(false);
        };

        const toggleAudioPlay = () => {
            const el = audioPreviewRef.current;
            if (!el) return;
            if (audioPlaying) { el.pause(); setAudioPlaying(false); }
            else { el.play(); setAudioPlaying(true); }
        };

        const formatSeconds = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

        // ── File handlers ────────────────────────────────────────────────────
        const ACCEPTED_EXTENSIONS = [
            // Audio
            'mp3', 'wav', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac', 'wma', '3gp', '3gpp', 'amr', 'caf', 'webm',
            // Image
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif', 'avif', 'tiff', 'ico',
            // Document
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'md', 'rtf', 'ppt', 'pptx',
            // Video
            'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', '3gp', 'm4v', 'ogv',
        ];

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                const validFiles: File[] = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    if (ACCEPTED_EXTENSIONS.includes(ext) || file.type.startsWith('audio/') || file.type.startsWith('image/') || file.type.startsWith('video/')) {
                        validFiles.push(file);
                    }
                }
                if (validFiles.length > 0) {
                    setAttachedFiles(prev => [...prev, ...validFiles]);
                    setIsUploadModalOpen(false);
                }
            }
            event.target.value = "";
        };

        const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
            e.stopPropagation();
            setAttachedFiles(prev => prev.filter((_, i) => i !== index));
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        const handleSubmit = () => {
            if (recordedBlob) {
                const audioFile = new File([recordedBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
                onSend?.(value, [audioFile], selectedTool);
                setValue("");
                discardRecording();
                return;
            }
            onSend?.(value, attachedFiles.length > 0 ? attachedFiles : undefined, selectedTool);
            setValue("");
            setAttachedFiles([]);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = () => {
            setIsDragging(false);
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const validFiles: File[] = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    if (ACCEPTED_EXTENSIONS.includes(ext) || file.type.startsWith('audio/') || file.type.startsWith('image/') || file.type.startsWith('video/')) {
                        validFiles.push(file);
                    }
                }
                if (validFiles.length > 0) {
                    setAttachedFiles(prev => [...prev, ...validFiles]);
                    setIsUploadModalOpen(false);
                } else {
                    setIsUploadModalOpen(true);
                }
            }
        };

        const handleModalDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setModalDragging(false);
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const validFiles: File[] = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    if (ACCEPTED_EXTENSIONS.includes(ext) || file.type.startsWith('audio/') || file.type.startsWith('image/') || file.type.startsWith('video/')) {
                        validFiles.push(file);
                    }
                }
                if (validFiles.length > 0) {
                    setAttachedFiles(prev => [...prev, ...validFiles]);
                    setIsUploadModalOpen(false);
                }
            }
        };

        const getFileIcon = (file: File) => {
            if (file.type.startsWith('image/')) return <Image size={20} className="text-pink-500" />;
            if (file.type.startsWith('audio/')) return <FileAudio size={20} className="text-blue-500" />;
            if (file.type.startsWith('video/')) return <Film size={20} className="text-purple-500" />;
            return <FileText size={20} className="text-dmz-accent" />;
        };

        const hasValue = value.trim().length > 0 || attachedFiles.length > 0 || !!recordedBlob;
        const hasAnything = hasValue;
        const canSend = hasAnything && !isLocalRecording;
        const activeTool = selectedTool ? toolsList.find(t => t.id === selectedTool) : null;
        const ActiveToolIcon = activeTool?.icon;

        return (<>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex flex-col rounded-[28px] p-2 transition-all bg-white border border-neutral-200 cursor-text",
                    isDragging ? "border-dmz-accent bg-orange-50/20" : "",
                    className
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="audio/*,image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.rtf,.ppt,.pptx,.m4a,.ogg,.opus,.flac,.3gp,.amr,.caf,.heic,.heif,.avif,.mkv"
                />

                {/* Recorded audio preview */}
                {audioPreviewUrl && (
                    <div className="flex items-center gap-3 bg-neutral-900 text-white p-2 px-4 rounded-2xl mb-2 group">
                        <button
                            type="button"
                            onClick={toggleAudioPlay}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
                        >
                            {audioPlaying
                                ? <Pause size={13} className="text-white" fill="white" />
                                : <Play size={13} className="text-white ml-0.5" fill="white" />}
                        </button>
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/70 rounded-full w-full" style={{ animation: audioPlaying ? 'none' : undefined }} />
                        </div>
                        <span className="text-[10px] font-bold text-white/60 shrink-0">{formatSeconds(recordingSeconds)}</span>
                        <button onClick={discardRecording} className="p-1 hover:bg-white/20 rounded-full transition-all shrink-0">
                            <X size={13} className="text-white/60" />
                        </button>
                        <audio ref={audioPreviewRef} src={audioPreviewUrl} onEnded={() => setAudioPlaying(false)} className="hidden" />
                    </div>
                )}

                {/* Recording indicator */}
                {isLocalRecording && (
                    <div className="flex items-center gap-3 bg-red-50 p-2 px-4 rounded-2xl mb-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                        <span className="text-xs font-bold text-red-600">Gravando... {formatSeconds(recordingSeconds)}</span>
                        <span className="text-xs text-red-400 ml-auto">Clique em parar para finalizar</span>
                    </div>
                )}

                {/* File attachments */}
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 px-1">
                        {attachedFiles.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="flex items-center gap-2 bg-neutral-50 p-2 px-3 rounded-2xl group">
                                <CloudUpload size={15} className="text-dmz-accent shrink-0" />
                                <span className="text-xs font-bold text-neutral-600 truncate max-w-[140px]">{file.name}</span>
                                <span className="text-[9px] text-neutral-400 font-medium shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                                <button onClick={(e) => handleRemoveFile(e, idx)} className="p-0.5 hover:bg-neutral-200 rounded-full transition-all shrink-0">
                                    <X size={12} className="text-neutral-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <textarea
                    ref={internalTextareaRef}
                    rows={1}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="O que vamos construir hoje?"
                    className="w-full resize-none border-0 bg-transparent p-3 text-neutral-800 placeholder:text-neutral-400 focus:ring-0 focus-visible:outline-none min-h-12 text-sm leading-relaxed"
                    {...props}
                />

                <div className="mt-0.5 p-1 pt-0">
                    <TooltipProvider delayDuration={100}>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" onClick={handlePlusClick} className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-dmz-accent focus-visible:outline-none">
                                        <Plus size={22} strokeWidth={2.5} />
                                        <span className="sr-only">Anexar arquivo</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" showArrow={true}><p>Anexar arquivo (PDF, Imagem, Áudio)</p></TooltipContent>
                            </Tooltip>

                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <button type="button" className="flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-black uppercase tracking-widest text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none">
                                                <Settings2 size={16} />
                                                {!selectedTool && 'Ferramentas'}
                                            </button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" showArrow={true}><p>Explorar Ferramentas</p></TooltipContent>
                                </Tooltip>
                                <PopoverContent side="top" align="start">
                                    <div className="flex flex-col gap-1">
                                        {toolsList.map(tool => (
                                            <button key={tool.id} onClick={() => { setSelectedTool(tool.id); setIsPopoverOpen(false); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-bold hover:bg-neutral-50 transition-colors text-neutral-600 hover:text-dmz-accent">
                                                <tool.icon size={18} strokeWidth={2} />
                                                <span>{tool.name}</span>
                                                {(tool as any).extra && <span className="ml-auto text-[10px] font-black bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-400">{(tool as any).extra}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {activeTool && (
                                <>
                                    <div className="h-4 w-px bg-neutral-100 mx-1" />
                                    <button onClick={() => setSelectedTool(null)} className="flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold bg-orange-50 text-dmz-accent hover:bg-orange-100 transition-colors">
                                        {ActiveToolIcon && <ActiveToolIcon size={14} strokeWidth={2.5} />}
                                        {activeTool.shortName}
                                        <X size={14} />
                                    </button>
                                </>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {/* RECORDING: stop button */}
                                        {isLocalRecording ? (
                                            <button
                                                type="button"
                                                onClick={stopLocalRecording}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white animate-pulse shadow-xl shadow-red-500/30 active:scale-95 transition-all focus-visible:outline-none"
                                            >
                                                <StopCircle size={20} strokeWidth={2.5} />
                                                <span className="sr-only">Parar Gravação</span>
                                            </button>
                                        ) : canSend ? (
                                            /* HAS CONTENT / RECORDED AUDIO: send button */
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-900/10 active:scale-95 transition-all focus-visible:outline-none translate-x-1"
                                            >
                                                <Send size={18} strokeWidth={2.5} />
                                                <span className="sr-only">Enviar</span>
                                            </button>
                                        ) : (
                                            /* IDLE: mic button */
                                            <button
                                                type="button"
                                                onClick={startLocalRecording}
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-dmz-accent transition-all focus-visible:outline-none"
                                            >
                                                <Mic size={20} strokeWidth={2} />
                                                <span className="sr-only">Gravar Voz</span>
                                            </button>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent side="top" showArrow={true}>
                                        <p>{isLocalRecording ? "Parar Gravação" : canSend ? "Enviar Mensagem" : "Gravar Voz"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            {/* Upload Modal */}
            {
                isUploadModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setIsUploadModalOpen(false)}>
                        <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" />
                        <div
                            className={cn(
                                "relative z-10 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl border overflow-hidden transition-all",
                                modalDragging ? "border-dmz-accent scale-[1.02] shadow-orange-100" : "border-neutral-100"
                            )}
                            onClick={(e) => e.stopPropagation()}
                            onDragOver={(e) => { e.preventDefault(); setModalDragging(true); }}
                            onDragLeave={() => setModalDragging(false)}
                            onDrop={handleModalDrop}
                        >
                            <div className="p-6 pb-4 flex items-center justify-between">
                                <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider">Enviar Arquivo</h3>
                                <button onClick={() => setIsUploadModalOpen(false)} className="p-1.5 rounded-full hover:bg-neutral-100 transition-all">
                                    <X size={16} className="text-neutral-400" />
                                </button>
                            </div>
                            <div className="px-6 pb-6">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "w-full flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
                                        modalDragging
                                            ? "border-dmz-accent bg-orange-50/50"
                                            : "border-neutral-200 hover:border-dmz-accent/40 hover:bg-neutral-50/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                        modalDragging ? "bg-dmz-accent/10" : "bg-neutral-100 group-hover:bg-dmz-accent/10"
                                    )}>
                                        <CloudUpload size={26} className={cn(
                                            "transition-colors",
                                            modalDragging ? "text-dmz-accent" : "text-neutral-400 group-hover:text-dmz-accent"
                                        )} />
                                    </div>
                                    <p className="text-sm font-bold text-neutral-700 mb-1">
                                        {modalDragging ? "Solte o arquivo aqui" : "Clique para selecionar"}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 font-medium text-center leading-relaxed max-w-[280px]">
                                        Ou arraste um arquivo aqui. Formatos: imagens, áudios, vídeos, PDF, DOC, XLS, CSV, TXT, MD
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>);
    }
);
PromptBox.displayName = "PromptBox";
