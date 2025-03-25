import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import mammoth from "mammoth"; // Convert DOCX to HTML
import { saveAs } from "file-saver"; // Handle file downloads
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Indent } from "docx"; // Generate DOCX
import SaveModal from "./SaveModal"; // Import SaveModal component
import LoadModal from "./LoadModal"; // Import LoadModal component
import { DatabaseProvider } from "../contexts/DatabaseContext"; // Import DatabaseProvider

const modules = {
    toolbar: {
        container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["blockquote", "code-block"],
            [{ script: "sub" }, { script: "super" }],
            ["link", "image", "video", "formula"],
            ["clean"], // Ensure toolbar exists
        ],
    },
};

const RichTextEditor = ({ className, style, ...props }) => {
    const [value, setValue] = useState(() => {
        // Initialize value from localStorage if available
        const savedContent = localStorage.getItem("editorContent");
        return savedContent || "";
    });
    const quillRef = useRef(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

    // Save content to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("editorContent", value);
    }, [value]);

    // Handle DOCX file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setValue(result.value);
        };
        reader.readAsArrayBuffer(file);
    };

    // Function to insert buttons into the toolbar
    const addCustomButtons = () => {
        const toolbar = document.querySelector(".ql-toolbar");
        if (!toolbar) return;
        let lastGroup = toolbar.querySelector(".ql-formats:last-of-type");
        if (!lastGroup) return;
        const buttonConfigs = [
            { className: "custom-load-file", label: "📂", title: "Load from file", handler: () => document.getElementById("docx-upload").click() },
            { className: "custom-save-file", label: "💾", title: "Save to file", handler: saveDocx },
            { className: "custom-load-storage", label: "🔄", title: "Load from app storage", handler: loadFromStorage },
            { className: "custom-save-storage", label: "📥", title: "Save to app storage", handler: saveToStorage },
        ];

        buttonConfigs.forEach(({ className, label, title, handler }) => {
            if (!document.querySelector(`.ql-toolbar .ql-${className}`)) {
                const button = document.createElement("button");
                button.classList.add(`ql-${className}`);
                button.innerHTML = label;
                button.title = title;
                button.onclick = handler;
                lastGroup.appendChild(button);
            }
        });
    };

    // Wait for Quill toolbar to be available and then add buttons
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (document.querySelector(".ql-toolbar")) {
                addCustomButtons();
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    // Save to IndexedDB
    const saveToStorage = async () => {
        setIsSaveModalOpen(true);
    };

    // Load from IndexedDB
    const loadFromStorage = async () => {
        setIsLoadModalOpen(true);
    };

    const handleLoad = (document) => {
        setValue(document.content);
        setIsLoadModalOpen(false);
    };

    // TO IMPROVE not all format options are saved
    const saveDocx = async () => {
        const editorContent = quillRef.current.getEditor().root.innerHTML;

        // Parse HTML content
        const parser = new DOMParser();
        const dom = parser.parseFromString(editorContent, "text/html");
        const elements = dom.body.childNodes;

        // Define numbering for ordered lists
        const numbering = {
            config: [
                {
                    reference: "default-numbering",
                    levels: [
                        {
                            level: 0,
                            format: "decimal",
                            text: "%1.",
                            alignment: AlignmentType.START,
                            style: {
                                paragraph: {
                                    indent: { left: 720, hanging: 360 },
                                },
                            },
                        },
                    ],
                },
            ],
        };

        let docParagraphs = [];

        const processTextNode = (node, baseStyle = {}) => {
            if (node.nodeType === 3) {
                // Text node
                return new TextRun({ ...baseStyle, text: node.textContent });
            }

            let style = { ...baseStyle };

            // Handle inline styles
            if (node.style) {
                if (node.style.color) style.color = node.style.color.replace("#", "");
                if (node.style.backgroundColor) style.highlight = node.style.backgroundColor.replace("#", "");
                if (node.style.fontSize) {
                    const size = parseInt(node.style.fontSize);
                    if (!isNaN(size)) style.size = size * 2; // Convert to half-points
                }
                if (node.style.fontFamily) style.font = node.style.fontFamily;
            }

            // Handle Quill classes
            if (node.classList) {
                if (node.classList.contains("ql-bold")) style.bold = true;
                if (node.classList.contains("ql-italic")) style.italics = true;
                if (node.classList.contains("ql-underline")) style.underline = true;
                if (node.classList.contains("ql-strike")) style.strike = true;
                if (node.classList.contains("ql-script-super")) style.superScript = true;
                if (node.classList.contains("ql-script-sub")) style.subScript = true;
            }

            // Handle HTML tags
            switch (node.tagName) {
                case "STRONG":
                case "B":
                    style.bold = true;
                    break;
                case "EM":
                case "I":
                    style.italics = true;
                    break;
                case "U":
                    style.underline = true;
                    break;
                case "S":
                case "DEL":
                    style.strike = true;
                    break;
                case "SUP":
                    style.superScript = true;
                    break;
                case "SUB":
                    style.subScript = true;
                    break;
            }

            // Process child nodes with accumulated style
            if (node.childNodes && node.childNodes.length > 0) {
                return Array.from(node.childNodes).map((child) => processTextNode(child, style));
            }

            return new TextRun({ ...style, text: node.textContent });
        };

        const processElement = (el) => {
            // Get alignment
            let alignment = AlignmentType.START;
            if (el.classList) {
                if (el.classList.contains("ql-align-center")) alignment = AlignmentType.CENTER;
                if (el.classList.contains("ql-align-right")) alignment = AlignmentType.RIGHT;
                if (el.classList.contains("ql-align-justify")) alignment = AlignmentType.JUSTIFIED;
            }

            // Get indentation
            let indent = { left: 0 };
            if (el.classList) {
                el.classList.forEach((cls) => {
                    if (cls.startsWith("ql-indent-")) {
                        const level = parseInt(cls.replace("ql-indent-", ""), 10) || 0;
                        indent.left = level * 720;
                    }
                });
            }

            // Handle different element types
            if (el.tagName?.match(/^H[1-6]$/)) {
                const level = parseInt(el.tagName[1]);
                return new Paragraph({
                    children: Array.from(el.childNodes)
                        .map((child) => processTextNode(child, { bold: true }))
                        .flat(),
                    heading: HeadingLevel[`HEADING_${level}`],
                    alignment,
                    indent,
                });
            }

            if (el.tagName === "BLOCKQUOTE") {
                return new Paragraph({
                    children: Array.from(el.childNodes)
                        .map((child) => processTextNode(child, { italics: true }))
                        .flat(),
                    alignment,
                    indent: { left: Math.max(indent.left + 720, 720) },
                });
            }

            if (el.tagName === "PRE") {
                return new Paragraph({
                    children: Array.from(el.childNodes)
                        .map((child) => processTextNode(child, { font: "Courier New" }))
                        .flat(),
                    alignment,
                    indent: { left: Math.max(indent.left + 720, 720) },
                });
            }

            if (el.tagName === "OL" || el.tagName === "UL") {
                return Array.from(el.childNodes)
                    .filter((node) => node.tagName === "LI")
                    .map(
                        (li) =>
                            new Paragraph({
                                children: Array.from(li.childNodes)
                                    .map((child) => processTextNode(child))
                                    .flat(),
                                numbering:
                                    el.tagName === "OL"
                                        ? {
                                              reference: "default-numbering",
                                              level: 0,
                                          }
                                        : undefined,
                                bullet: el.tagName === "UL" ? { level: 0 } : undefined,
                                alignment,
                                indent: el.tagName === "OL" ? { ...indent, hanging: 360 } : indent,
                            })
                    );
            }

            // Default paragraph handling
            return new Paragraph({
                children: Array.from(el.childNodes)
                    .map((child) => processTextNode(child))
                    .flat(),
                alignment,
                indent,
            });
        };

        // Process all elements
        elements.forEach((el) => {
            if (el.nodeType === 1) {
                // Element node
                const paragraphs = processElement(el);
                if (Array.isArray(paragraphs)) {
                    docParagraphs.push(...paragraphs);
                } else {
                    docParagraphs.push(paragraphs);
                }
            } else if (el.nodeType === 3 && el.textContent.trim()) {
                // Text node
                docParagraphs.push(
                    new Paragraph({
                        children: [processTextNode(el)],
                    })
                );
            }
        });

        // Create document with numbering
        const doc = new Document({
            numbering,
            sections: [
                {
                    properties: {},
                    children: docParagraphs,
                },
            ],
        });

        // Generate and save DOCX file
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "document.docx");
    };

    return (
        <DatabaseProvider>
            <div className={`flex-grow-1 d-flex ${className}`} style={{ ...style }} {...props}>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={value}
                        onChange={setValue}
                        modules={modules}
                        style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    />

                    <input type="file" id="docx-upload" accept=".docx" style={{ display: "none" }} onChange={handleFileUpload} />

                    <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} content={quillRef.current?.getEditor()?.root?.innerHTML || value} />
                    <LoadModal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} onLoad={handleLoad} />
                </div>
            </div>
            <style>{`
                .ql-toolbar.ql-snow {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    background: #212529;
                    border: 1px solid white;
                    border-bottom-color: white;
                }
                .ql-toolbar.ql-snow .ql-picker-label {
                    color: white;
                    border-color: white;
                }
                .ql-toolbar.ql-snow .ql-stroke {
                    stroke: white;
                }
                .ql-toolbar.ql-snow .ql-fill {
                    fill: white;
                }
                .ql-toolbar.ql-snow button:hover .ql-stroke,
                .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke {
                    stroke: #adb5bd;
                }
                .ql-toolbar.ql-snow button:hover .ql-fill,
                .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill {
                    fill: #adb5bd;
                }
                .ql-container.ql-snow {
                    border: 1px solid white;
                    flex: 1;
                    overflow: auto;
                }
                .ql-editor {
                    min-height: 100%;
                    background: #212529;
                    color: white;
                }
                .ql-picker-options {
                    background: #343a40 !important;
                    border: 1px solid white !important;
                    color: white !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                }
                .ql-picker-item {
                    color: white !important;
                }
                .ql-picker-item.ql-selected {
                    color: #adb5bd !important;
                    background-color: #495057 !important;
                }
                .ql-picker-options .ql-picker-item:hover {
                    color: #adb5bd !important;
                    background-color: #495057 !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label::before {
                    color: white !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label:hover::before {
                    color: #adb5bd !important;
                }
                .ql-toolbar.ql-snow .ql-picker {
                    color: white !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label {
                    color: white !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label:hover {
                    color: #adb5bd !important;
                }
            `}</style>
        </DatabaseProvider>
    );
};

export default RichTextEditor;
