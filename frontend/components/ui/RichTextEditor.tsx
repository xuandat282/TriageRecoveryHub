"use client";

import { useEffect, useRef, useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Enter your message...",
    className = "",
    minHeight = "150px",
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInternalChange = useRef(false);

    // Stable onChange callback
    const handleChange = useCallback((content: string) => {
        onChange(content);
    }, [onChange]);

    useEffect(() => {
        if (!editorRef.current || quillRef.current) return;

        // Initialize Quill
        const quill = new Quill(editorRef.current, {
            theme: "snow",
            placeholder,
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    ["blockquote", "code-block"],
                    ["link"],
                    ["clean"],
                ],
            },
        });

        quillRef.current = quill;

        // Listen for text changes
        quill.on("text-change", () => {
            isInternalChange.current = true;
            const html = quill.root.innerHTML;
            // Return empty string if only contains empty paragraph
            const content = html === "<p><br></p>" ? "" : html;
            handleChange(content);
            isInternalChange.current = false;
        });

        // Set initial value
        if (value) {
            quill.root.innerHTML = value;
        }

        return () => {
            quillRef.current = null;
        };
    }, [placeholder, handleChange, value]);

    // Update editor when external value changes
    useEffect(() => {
        if (quillRef.current && !isInternalChange.current) {
            const currentContent = quillRef.current.root.innerHTML;
            const normalizedCurrent = currentContent === "<p><br></p>" ? "" : currentContent;
            if (value !== normalizedCurrent) {
                quillRef.current.root.innerHTML = value || "";
            }
        }
    }, [value]);

    return (
        <div className={`rich-text-editor ${className}`}>
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    min-height: ${minHeight};
                    font-size: 1rem;
                    font-family: inherit;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    background: var(--surface-primary);
                    border-color: var(--border-default);
                }
                
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: var(--surface-secondary);
                    border-color: var(--border-default);
                }
                
                .rich-text-editor .ql-toolbar .ql-stroke {
                    stroke: var(--text-secondary);
                }
                
                .rich-text-editor .ql-toolbar .ql-fill {
                    fill: var(--text-secondary);
                }
                
                .rich-text-editor .ql-toolbar .ql-picker {
                    color: var(--text-secondary);
                }
                
                .rich-text-editor .ql-toolbar button:hover .ql-stroke,
                .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
                    stroke: var(--color-primary-600);
                }
                
                .rich-text-editor .ql-toolbar button:hover .ql-fill,
                .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
                    fill: var(--color-primary-600);
                }
                
                .rich-text-editor .ql-editor {
                    color: var(--text-primary);
                }
                
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: var(--text-tertiary);
                    font-style: normal;
                }
                
                .rich-text-editor .ql-editor:focus {
                    outline: none;
                }
                
                .rich-text-editor:focus-within .ql-container,
                .rich-text-editor:focus-within .ql-toolbar {
                    border-color: var(--color-primary-500);
                }
                
                /* Dark mode adjustments */
                :root[data-theme="dark"] .rich-text-editor .ql-toolbar {
                    background: var(--surface-tertiary);
                }
                
                :root[data-theme="dark"] .rich-text-editor .ql-picker-options {
                    background: var(--surface-primary);
                    border-color: var(--border-default);
                }
                
                :root[data-theme="dark"] .rich-text-editor .ql-picker-label::before,
                :root[data-theme="dark"] .rich-text-editor .ql-picker-item::before {
                    color: var(--text-secondary);
                }
            `}</style>
            <div ref={editorRef} />
        </div>
    );
}
