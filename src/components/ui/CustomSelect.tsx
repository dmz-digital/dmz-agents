"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface Option {
    value: string;
    label: string | React.ReactNode;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Selecione...",
    style,
    className
}: {
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div ref={ref} className={className} style={{ position: "relative", ...style }}>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#FFFFFF", border: "1.5px solid #F0F0F0",
                    borderRadius: "9px", padding: "8px 12px", gap: "8px",
                    fontSize: "12px", color: selectedOption ? "#111827" : "#9CA3AF",
                    fontWeight: selectedOption ? 600 : 500,
                    cursor: "pointer", outline: "none", width: "100%", height: "100%"
                }}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </div>
            {open && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, marginTop: "6px", width: "100%", zIndex: 9999,
                    background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    maxHeight: "300px", overflowY: "auto", overflowX: "hidden",
                    padding: "4px"
                }}>
                    {options.map(opt => {
                        const isSelected = opt.value === value;
                        return (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                style={{
                                    padding: "10px 12px", fontSize: "12px", cursor: "pointer",
                                    borderRadius: "6px",
                                    background: isSelected ? "#F3F4F6" : "transparent",
                                    color: isSelected ? "#111827" : "#4B5563",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    fontWeight: isSelected ? 600 : 500,
                                    transition: "background 0.15s ease",
                                }}
                                onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.background = "#F9FAFB";
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <span className="truncate">{opt.label}</span>
                                {isSelected && <Check size={14} color="#111827" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
