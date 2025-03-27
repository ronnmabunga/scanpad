import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Modal, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import LoadFileIntoEditorModal from "./LoadFileIntoEditorModal";
import SaveFileAsIntoEditorModal from "./SaveFileAsIntoEditorModal";
import { useDatabase } from "../contexts/DatabaseContext";
import { setQuillEditor } from "../utils/editorRef";
import { FaClipboardCheck } from "react-icons/fa";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

// Register Quill modules
const Quill = ReactQuill.Quill;
const icons = Quill.import("ui/icons");
icons["undo"] = '<i class="bi bi-arrow-counterclockwise"></i>';
icons["redo"] = '<i class="bi bi-arrow-clockwise"></i>';

function RichTextEditor({ className, style, autoPasteOCR, onAutoPasteOCRChange, showHomeLink = false, ...props }) {
    const navigate = useNavigate();
    const { saveDocument, currentDoc, setCurrentDoc } = useDatabase();
    const quillRef = useRef(null);
    const [content, setContent] = useState(() => {
        // If there's a current document, try to load its specific localStorage content
        if (currentDoc?.id) {
            const savedContent = localStorage.getItem(`editorContent_${currentDoc.id}`);
            if (savedContent) {
                return savedContent;
            }
        }
        // If no document-specific content, fall back to current document
        return currentDoc?.content || "";
    });
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showSaveAsModal, setShowSaveAsModal] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
    const [lastSavedContent, setLastSavedContent] = useState(currentDoc?.content || "");

    useEffect(() => {
        console.log("RichTextEditor - autoPasteOCR prop changed:", autoPasteOCR);
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            console.log("RichTextEditor - Quill editor available:", !!quill);
        } else {
            console.log("RichTextEditor - Quill editor not available (quillRef.current is null)");
        }
    }, [autoPasteOCR]);

    useEffect(() => {
        if (currentDoc) {
            // Check document-specific localStorage first
            const savedContent = localStorage.getItem(`editorContent_${currentDoc.id}`);
            if (savedContent) {
                setContent(savedContent);
            } else {
                setContent(currentDoc.content);
            }
            setLastSavedContent(currentDoc.content);
        }
    }, [currentDoc]);

    // Save content to localStorage whenever it changes
    useEffect(() => {
        if (currentDoc?.id) {
            localStorage.setItem(`editorContent_${currentDoc.id}`, content);
        }
    }, [content, currentDoc?.id]);

    // Add effect to ensure Quill editor is initialized
    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            console.log("RichTextEditor - Setting Quill editor instance:", !!quill);
            setQuillEditor(quill);
        }
    }, [quillRef.current]);

    const modules = {
        toolbar: {
            container: [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ["small", false, "large", "huge"] }], ["bold", "italic", "underline", "strike"], [{ color: [] }, { background: [] }], [{ font: [] }], [{ align: [] }], [{ list: "ordered" }, { list: "bullet" }], [{ indent: "-1" }, { indent: "+1" }], ["blockquote", "code-block"], [{ script: "sub" }, { script: "super" }], ["link", "image", "video", "formula"], ["clean"], ["undo", "redo"]],
        },
    };

    const formats = ["header", "size", "bold", "italic", "underline", "strike", "color", "background", "font", "align", "list", "bullet", "indent", "blockquote", "code-block", "script", "link", "image", "video", "formula", "clean"];

    const normalizeContent = (str) => {
        if (!str || str.trim() === "") return "";
        // First normalize all types of line breaks
        let normalized = str.replace(/\r\n/g, "").replace(/\n/g, "");

        // Then normalize HTML attributes by sorting them and combining style attributes
        normalized = normalized.replace(/<([^>]+)>/g, (match, attributes) => {
            // Split attributes into array of [name, value] pairs
            const attrPairs = attributes.match(/\S+="[^"]*"/g) || [];
            const styleAttrs = [];
            const otherAttrs = [];

            attrPairs.forEach((attr) => {
                if (attr.startsWith("style=")) {
                    // Extract style content and split into individual properties
                    const styleContent = attr.match(/style="([^"]*)"/)[1];
                    // Split by semicolon and clean up each property
                    const properties = styleContent
                        .split(";")
                        .map((prop) => prop.trim())
                        .filter(Boolean)
                        .map((prop) => {
                            // Ensure consistent format: "property: value"
                            const [propName, ...values] = prop.split(":").map((s) => s.trim());
                            return `${propName}: ${values.join(":")}`;
                        });
                    styleAttrs.push(...properties);
                } else {
                    otherAttrs.push(attr);
                }
            });

            // Sort style properties by property name
            const sortedStyles = styleAttrs
                .sort((a, b) => {
                    const propA = a.split(":")[0].trim();
                    const propB = b.split(":")[0].trim();
                    return propA.localeCompare(propB);
                })
                .join("; ");

            const combinedAttrs = [...otherAttrs];
            if (sortedStyles) {
                combinedAttrs.push(`style="${sortedStyles}"`);
            }

            return `<${combinedAttrs.join(" ")}>`;
        });
        return normalized;
    };

    const handleDiscardChanges = () => {
        setContent(lastSavedContent);
    };

    const handleSaveChanges = async () => {
        if (currentDoc) {
            const updatedDoc = {
                ...currentDoc,
                content: content,
                updatedAt: new Date().toISOString(),
            };
            await saveDocument(updatedDoc);
            setLastSavedContent(content);
        }
        localStorage.setItem("lastOpenedDocId", currentDoc?.id);
    };

    const handleNewDocument = () => {
        if (normalizeContent(content) !== normalizeContent(lastSavedContent)) {
            setShowUnsavedConfirm(true);
        } else {
            setContent("");
            setLastSavedContent("");
            navigate("/edit");
            setCurrentDoc(null);
            localStorage.setItem("lastOpenedDocId", null);
        }
    };

    const confirmNewDocument = () => {
        setContent("");
        setLastSavedContent("");
        navigate("/edit");
        setCurrentDoc(null);
        localStorage.setItem("lastOpenedDocId", null);
        setShowUnsavedConfirm(false);
    };

    const handleExportDocx = async () => {
        try {
            // Create a temporary div to parse HTML content
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;

            // Get all text content, preserving formatting
            const paragraphs = [];
            let currentListLevel = 0;
            let currentListType = null; // 'ordered' or 'unordered'

            const processNode = (node, inheritedStyle = {}, inheritedIndent = 0) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent.trim()) {
                        return [
                            new TextRun({
                                text: node.textContent,
                                ...inheritedStyle,
                            }),
                        ];
                    }
                    return [];
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const children = [];
                    const nodeStyle = { ...inheritedStyle };
                    let indent = inheritedIndent;

                    // Get classes for the node
                    const classes = node.className.split(" ");

                    // Check for heading level
                    let headingLevel;
                    const tagName = node.tagName.toLowerCase();
                    const tagMatch = tagName.match(/^h(\d)$/i);
                    if (tagMatch) {
                        headingLevel = parseInt(tagMatch[1]);
                    } else {
                        // Check Quill's header classes
                        const headerClass = classes.find((cls) => cls.startsWith("ql-header-"));
                        if (headerClass) {
                            const level = headerClass.replace("ql-header-", "");
                            headingLevel = parseInt(level);
                        }
                    }

                    // Handle font size
                    const sizeClass = node.className.split(" ").find((cls) => cls.startsWith("ql-size-"));
                    if (sizeClass) {
                        const size = sizeClass.replace("ql-size-", "");
                        const sizeMap = {
                            small: 16,
                            normal: 24,
                            large: 36,
                            huge: 48,
                        };
                        nodeStyle.size = sizeMap[size] || 24;
                    }

                    // Handle text color and background color
                    const styleAttr = node.getAttribute("style") || "";
                    const colorMatch = styleAttr.match(/(?<!background-)color:\s*([^;]+)/);
                    if (colorMatch) {
                        const rgbColor = colorMatch[1];
                        if (rgbColor !== "rgb(255, 255, 255)") {
                            nodeStyle.color = rgbToHex(rgbColor);
                        }
                    }

                    const bgMatch = styleAttr.match(/background-color:\s*([^;]+)/);
                    if (bgMatch) {
                        const rgbBgColor = bgMatch[1];
                        if (rgbBgColor !== "rgb(255, 255, 255)") {
                            nodeStyle.shading = {
                                fill: rgbToHex(rgbBgColor),
                                color: rgbToHex(rgbBgColor),
                                val: "clear",
                            };
                        }
                    }

                    // Handle text formatting - check both HTML tags and Quill classes
                    if (classes.includes("ql-bold") || styleAttr.includes("font-weight: bold") || node.tagName.toLowerCase() === "strong") {
                        nodeStyle.bold = true;
                    }
                    if (classes.includes("ql-italic") || styleAttr.includes("font-style: italic") || node.tagName.toLowerCase() === "em") {
                        nodeStyle.italics = true;
                    }
                    if (classes.includes("ql-underline") || styleAttr.includes("text-decoration: underline") || node.tagName.toLowerCase() === "u") {
                        nodeStyle.underline = true;
                    }
                    if (classes.includes("ql-strike") || styleAttr.includes("text-decoration: line-through") || node.tagName.toLowerCase() === "s") {
                        nodeStyle.strike = true;
                    }

                    // Handle indentation
                    const indentClass = node.className.split(" ").find((cls) => cls.startsWith("ql-indent-"));
                    if (indentClass) {
                        const indentLevel = parseInt(indentClass.replace("ql-indent-", ""));
                        indent = indentLevel;
                    }

                    // Handle lists
                    if (node.tagName.toLowerCase() === "ol" || node.tagName.toLowerCase() === "ul") {
                        currentListType = node.tagName.toLowerCase() === "ol" ? "ordered" : "unordered";
                        currentListLevel = indent;
                        // Process list items
                        node.childNodes.forEach((child) => {
                            if (child.tagName.toLowerCase() === "li") {
                                const itemChildren = [];
                                child.childNodes.forEach((grandChild) => {
                                    const processed = processNode(grandChild, nodeStyle, indent);
                                    itemChildren.push(...processed);
                                });
                                if (itemChildren.length > 0) {
                                    paragraphs.push(
                                        new Paragraph({
                                            children: itemChildren,
                                            indent: { left: indent * 720 }, // 720 twips per indent level
                                            bullet:
                                                currentListType === "unordered"
                                                    ? {
                                                          level: currentListLevel,
                                                          format: "bullet",
                                                      }
                                                    : undefined,
                                            numbering:
                                                currentListType === "ordered"
                                                    ? {
                                                          reference: "default-numbering",
                                                          level: currentListLevel,
                                                      }
                                                    : undefined,
                                            spacing: {
                                                after: 200,
                                                line: 360,
                                            },
                                        })
                                    );
                                }
                            }
                        });
                        return [];
                    }

                    // Handle blockquotes
                    if (node.tagName.toLowerCase() === "blockquote") {
                        nodeStyle.italics = true;
                        nodeStyle.color = "666666";
                        indent += 1;
                    }

                    // Handle code blocks
                    if (node.tagName.toLowerCase() === "pre" && node.className.includes("ql-syntax")) {
                        nodeStyle.font = "Consolas";
                        nodeStyle.size = 20; // Slightly smaller font for code
                        nodeStyle.color = "666666";
                        nodeStyle.background = "F5F5F5";
                    }

                    // Handle superscript and subscript
                    if (node.tagName.toLowerCase() === "sup") {
                        nodeStyle.superScript = true;
                    } else if (node.tagName.toLowerCase() === "sub") {
                        nodeStyle.subScript = true;
                    }

                    // Process all child nodes with the accumulated style
                    node.childNodes.forEach((child) => {
                        const processed = processNode(child, nodeStyle, indent);
                        children.push(...processed);
                    });

                    // Check if this is an inline element
                    const isInline = node.tagName.toLowerCase().match(/^(span|strong|em|u|s|sup|sub)$/);

                    // If this is a paragraph-level element and not a list item
                    if (children.length > 0 && !node.tagName.toLowerCase().match(/^(ol|ul|li)$/) && !isInline) {
                        const paragraphStyle = {
                            children,
                            indent: { left: indent * 720 },
                            spacing: {
                                after: 200,
                                line: 360,
                            },
                        };

                        if (headingLevel) {
                            paragraphStyle.heading = HeadingLevel[`HEADING_${headingLevel}`];
                        }

                        // Handle alignment at paragraph level
                        const alignClass = node.className.split(" ").find((cls) => cls.startsWith("ql-align-"));
                        if (alignClass) {
                            const align = alignClass.replace("ql-align-", "");
                            switch (align) {
                                case "center":
                                    paragraphStyle.alignment = AlignmentType.CENTER;
                                    break;
                                case "right":
                                    paragraphStyle.alignment = AlignmentType.RIGHT;
                                    break;
                                case "justify":
                                    paragraphStyle.alignment = AlignmentType.JUSTIFIED;
                                    break;
                                default:
                                    paragraphStyle.alignment = AlignmentType.LEFT;
                            }
                        }

                        paragraphs.push(new Paragraph(paragraphStyle));
                    }

                    // For inline elements, return their children to maintain text flow
                    if (isInline) {
                        return children;
                    }

                    // Don't return children for paragraph-level elements
                    if (node.tagName.toLowerCase().match(/^(p|div|h[1-6]|blockquote|pre)$/)) {
                        return [];
                    }

                    return children;
                }
                return [];
            };

            // Process all nodes
            tempDiv.childNodes.forEach((node) => {
                processNode(node, {}, 0);
            });

            // Create the document with numbering styles
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: paragraphs,
                    },
                ],
                styles: {
                    default: {
                        document: {
                            run: {
                                font: "Calibri",
                                size: 24,
                            },
                            paragraph: {
                                spacing: {
                                    after: 200,
                                    line: 360,
                                },
                            },
                        },
                    },
                },
                numbering: {
                    config: [
                        {
                            reference: "default-numbering",
                            levels: [
                                {
                                    level: 0,
                                    format: "decimal",
                                    text: "%1.",
                                    alignment: "left",
                                    style: {
                                        paragraph: {
                                            indent: { left: 720, hanging: 360 },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            });

            // Generate the docx file
            const blob = await Packer.toBlob(doc);

            // Save the file
            const fileName = currentDoc?.name || "Untitled Document";
            saveAs(blob, `${fileName}.docx`);
        } catch (error) {
            console.error("Error exporting to DOCX:", error);
            alert("Error exporting to DOCX. Please try again.");
        }
    };

    // Add RGB to Hex conversion function
    const rgbToHex = (rgb) => {
        // Handle rgb(r, g, b) format
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }
        // If it's already hex, return it
        if (rgb.startsWith("#")) {
            return rgb.toUpperCase();
        }
        return undefined;
    };

    const handleExportPdf = () => {
        // Implementation of handleExportPdf function
    };

    return (
        <div className={`flex-grow-1 d-flex ${className}`} style={{ ...style }} {...props}>
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Navbar bg="dark" variant="dark" className="px-3" style={{ border: "1px solid white" }}>
                    <div className="d-flex w-100">
                        <Nav className="me-auto">
                            {showHomeLink && (
                                <Nav.Link onClick={() => navigate("/")} className="text-white">
                                    Home
                                </Nav.Link>
                            )}
                            <NavDropdown title="File" id="file-dropdown">
                                <NavDropdown.Item onClick={handleNewDocument}>New</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleSaveChanges} disabled={!(normalizeContent(content) !== normalizeContent(lastSavedContent)) || !currentDoc?.name}>
                                    Save
                                </NavDropdown.Item>
                                <NavDropdown.Item onClick={() => setShowSaveAsModal(true)}>Save As</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => setShowLoadModal(true)}>Load</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleExportDocx}>Export as DOCX</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleExportPdf}>Export as PDF</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <div className="d-flex align-items-center position-absolute start-50 translate-middle-x">
                            <span className="text-white">
                                <strong>{currentDoc?.name || "Untitled Document"}</strong>
                            </span>
                        </div>
                        <div className="d-flex align-items-center ms-auto">
                            <div className="form-check form-switch me-3">
                                <OverlayTrigger placement="bottom" overlay={<Tooltip id="auto-paste-tooltip">Auto-paste OCR text at cursor position</Tooltip>}>
                                    <div className="d-flex align-items-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="autoPasteOCR"
                                            checked={autoPasteOCR}
                                            onChange={(e) => {
                                                console.log("RichTextEditor - Checkbox changed:", e.target.checked);
                                                onAutoPasteOCRChange?.(e.target.checked);
                                            }}
                                        />
                                        <FaClipboardCheck className={`ms-2 ${autoPasteOCR ? "text-primary" : "text-secondary"}`} style={{ fontSize: "1.2rem" }} />
                                    </div>
                                </OverlayTrigger>
                            </div>
                            <span className="text-white">{normalizeContent(content) !== normalizeContent(lastSavedContent) ? <i className="bi bi-save text-danger"></i> : <i className="bi bi-check-circle text-success"></i>}</span>
                        </div>
                    </div>
                </Navbar>
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={(value) => {
                        setContent(value);
                    }}
                    modules={modules}
                    formats={formats}
                    style={{
                        height: "calc(100% - 56px)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                    onInit={(quill) => {
                        console.log("RichTextEditor - Quill editor initialized");
                        setQuillEditor(quill);
                    }}
                />
            </div>
            <LoadFileIntoEditorModal show={showLoadModal} onHide={() => setShowLoadModal(false)} hasUnsavedChanges={normalizeContent(content) !== normalizeContent(lastSavedContent)} onDiscardChanges={handleDiscardChanges} onSaveChanges={handleSaveChanges} />
            <SaveFileAsIntoEditorModal show={showSaveAsModal} onHide={() => setShowSaveAsModal(false)} content={content} />
            <Modal show={showUnsavedConfirm} onHide={() => setShowUnsavedConfirm(false)} className="text-white">
                <Modal.Header closeButton className="bg-dark border-secondary">
                    <Modal.Title>Unsaved Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">You have unsaved changes. What would you like to do?</Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => setShowUnsavedConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmNewDocument}>
                        Discard Changes
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            <style>{`
                .ql-toolbar.ql-snow {
                    position: sticky;
                    top: 56px;
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
                #file-nav-dropdown {
                    color: white;
                }
                .dropdown-menu {
                    background-color: #212529;
                    border: 1px solid #495057;
                }
                .dropdown-item {
                    color: white;
                }
                .dropdown-item:hover {
                    background-color: #343a40;
                    color: white;
                }
                .dropdown-item.disabled {
                    color: #adb5bd !important;
                    cursor: not-allowed;
                }
                .dropdown-item.disabled:hover {
                    color: #adb5bd !important;
                }
                .nav-link, .nav-link:focus, .nav-link:hover, .nav-link.active {
                    color: white !important;
                }
                .dropdown-toggle {
                    color: white !important;
                }
                .dropdown-toggle:hover, .dropdown-toggle:focus {
                    color: white !important;
                }
                .form-check-input {
                    background-color: #495057;
                    border-color: #6c757d;
                }
                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
                .form-check-input:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }
            `}</style>
        </div>
    );
}

export default RichTextEditor;
