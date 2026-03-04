"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Mic, Send, Plus, Settings2, X, Globe, Pencil, Paintbrush, Telescope, Lightbulb, FileAudio } from "lucide-react";

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
    { id: 'createImage', name: 'Create an image', shortName: 'Image', icon: Paintbrush },
    { id: 'searchWeb', name: 'Search the web', shortName: 'Search', icon: Globe },
    { id: 'writeCode', name: 'Write or code', shortName: 'Write', icon: Pencil },
    { id: 'deepResearch', name: 'Run deep research', shortName: 'Deep Search', icon: Telescope, extra: '5 left' },
    { id: 'thinkLonger', name: 'Think for longer', shortName: 'Think', icon: Lightbulb },
];

interface PromptBoxProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onSend?: (text: string, audioFile?: File) => void;
    onStartRecording?: () => void;
    onStopRecording?: () => void;
    isRecording?: boolean;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
    ({ className, onSend, onStartRecording, onStopRecording, isRecording, ...props }, ref) => {
        const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
        const fileInputRef = React.useRef<HTMLInputElement>(null);
        const [value, setValue] = React.useState("");
        const [audioFile, setAudioFile] = React.useState<File | null>(null);
        const [selectedTool, setSelectedTool] = React.useState<string | null>(null);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isAudioPreviewOpen, setIsAudioPreviewOpen] = React.useState(false);
        const [isDragging, setIsDragging] = React.useState(false);

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
            fileInputRef.current?.click();
        };

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file && file.type.startsWith("audio/")) {
                setAudioFile(file);
            }
            event.target.value = "";
        };

        const handleRemoveAudio = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setAudioFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        const handleSubmit = () => {
            if (onSend) {
                onSend(value, audioFile || undefined);
            }
            setValue("");
            setAudioFile(null);
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
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("audio/")) {
                setAudioFile(file);
            }
        };

        const hasValue = value.trim().length > 0 || audioFile;
        const activeTool = selectedTool ? toolsList.find(t => t.id === selectedTool) : null;
        const ActiveToolIcon = activeTool?.icon;

        return (
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex flex-col rounded-[28px] p-2 shadow-sm transition-all bg-white border cursor-text",
                    isDragging ? "border-dmz-accent bg-orange-50/20" : "border-neutral-100 focus-within:border-neutral-100",
                    className
                )}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*" />

                {audioFile && (
                    <div className="flex items-center gap-3 bg-neutral-50 p-2 px-4 rounded-2xl mb-2 w-fit group">
                        <FileAudio size={18} className="text-dmz-accent" />
                        <span className="text-xs font-bold text-neutral-600 truncate max-w-[150px]">{audioFile.name}</span>
                        <button onClick={handleRemoveAudio} className="p-1 hover:bg-neutral-200 rounded-full transition-all">
                            <X size={14} className="text-neutral-400" />
                        </button>
                    </div>
                )}

                <textarea
                    ref={internalTextareaRef}
                    rows={1}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Conte sobre seu projeto ou arraste um áudio..."
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
                                        <span className="sr-only">Anexar áudio</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" showArrow={true}><p>Anexar áudio</p></TooltipContent>
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
                                                {tool.extra && <span className="ml-auto text-[10px] font-black bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-400">{tool.extra}</span>}
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
                                        <button
                                            type="button"
                                            onClick={isRecording ? onStopRecording : onStartRecording}
                                            className={cn(
                                                "flex h-9 w-9 items-center justify-center rounded-full transition-all focus-visible:outline-none",
                                                isRecording ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" : "text-neutral-400 hover:bg-neutral-100 hover:text-dmz-accent"
                                            )}
                                        >
                                            <Mic size={20} strokeWidth={2} />
                                            <span className="sr-only">Gravar voz</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" showArrow={true}><p>{isRecording ? "Parar Gravação" : "Gravar Voz"}</p></TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={!hasValue}
                                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none disabled:opacity-30 disabled:grayscale bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-900/10 active:scale-95 translate-x-1"
                                        >
                                            <Send size={18} strokeWidth={2.5} />
                                            <span className="sr-only">Enviar mensagem</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" showArrow={true}><p>Enviar</p></TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </TooltipProvider>
                </div>
            </div>
        );
    }
);
PromptBox.displayName = "PromptBox";
