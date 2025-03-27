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
            tempDiv.childNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check for heading level
                    let headingLevel;
                    const tagName = node.tagName.toLowerCase();
                    const tagMatch = tagName.match(/^h(\d)$/i);
                    if (tagMatch) {
                        headingLevel = parseInt(tagMatch[1]);
                    } else {
                        // Check Quill's header classes
                        const classes = node.className.split(" ");
                        const headerClass = classes.find((cls) => cls.startsWith("ql-header-"));
                        if (headerClass) {
                            const level = headerClass.replace("ql-header-", "");
                            headingLevel = parseInt(level);
                        }
                    }

                    const children = [];
                    let currentText = "";
                    let currentStyle = {};

                    // Get parent node formatting
                    const parentClasses = node.className.split(" ");
                    const parentStyleAttr = node.getAttribute("style") || "";

                    // Handle parent font size
                    const parentSizeClass = parentClasses.find((cls) => cls.startsWith("ql-size-"));
                    if (parentSizeClass) {
                        const size = parentSizeClass.replace("ql-size-", "");
                        const sizeMap = {
                            small: 16,
                            normal: 24,
                            large: 36,
                            huge: 48,
                        };
                        currentStyle.size = sizeMap[size] || 24;
                    }

                    // Handle parent text color and background color
                    const parentColorMatch = parentStyleAttr.match(/(?<!background-)color:\s*([^;]+)/);
                    if (parentColorMatch) {
                        const rgbColor = parentColorMatch[1];
                        if (rgbColor !== "rgb(255, 255, 255)") {
                            currentStyle.color = rgbToHex(rgbColor);
                        }
                    }

                    const parentBgMatch = parentStyleAttr.match(/background-color:\s*([^;]+)/);
                    if (parentBgMatch) {
                        const rgbBgColor = parentBgMatch[1];
                        if (rgbBgColor !== "rgb(255, 255, 255)") {
                            currentStyle.shading = {
                                fill: rgbToHex(rgbBgColor),
                                color: rgbToHex(rgbBgColor),
                                val: "clear",
                            };
                        }
                    }

                    // Handle parent text formatting
                    if (parentClasses.includes("ql-bold")) currentStyle.bold = true;
                    if (parentClasses.includes("ql-italic")) currentStyle.italics = true;
                    if (parentClasses.includes("ql-underline")) currentStyle.underline = true;
                    if (parentClasses.includes("ql-strike")) currentStyle.strike = true;

                    // Handle parent alignment
                    let alignment;
                    const parentAlignClass = parentClasses.find((cls) => cls.startsWith("ql-align-"));
                    if (parentAlignClass) {
                        const align = parentAlignClass.replace("ql-align-", "");
                        switch (align) {
                            case "center":
                                alignment = AlignmentType.CENTER;
                                break;
                            case "right":
                                alignment = AlignmentType.RIGHT;
                                break;
                            case "justify":
                                alignment = AlignmentType.JUSTIFIED;
                                break;
                            default:
                                alignment = AlignmentType.LEFT;
                        }
                    }

                    // Process each child node
                    node.childNodes.forEach((child) => {
                        if (child.nodeType === Node.TEXT_NODE) {
                            currentText += child.textContent;
                        } else if (child.nodeType === Node.ELEMENT_NODE) {
                            // If we have accumulated text, add it with current style
                            if (currentText) {
                                children.push(
                                    new TextRun({
                                        text: currentText,
                                        ...currentStyle,
                                    })
                                );
                                currentText = "";
                            }

                            // Get style from the element's classes and attributes
                            const classes = child.className.split(" ");
                            const styleAttr = child.getAttribute("style") || "";

                            // Create a new style object for this child
                            const childStyle = { ...currentStyle };

                            // Handle font size
                            const sizeClass = classes.find((cls) => cls.startsWith("ql-size-"));
                            if (sizeClass) {
                                const size = sizeClass.replace("ql-size-", "");
                                const sizeMap = {
                                    small: 16,
                                    normal: 24,
                                    large: 36,
                                    huge: 48,
                                };
                                childStyle.size = sizeMap[size] || 24;
                            }

                            // Handle text color and background color
                            const colorMatch = styleAttr.match(/(?<!background-)color:\s*([^;]+)/);
                            if (colorMatch) {
                                const rgbColor = colorMatch[1];
                                if (rgbColor !== "rgb(255, 255, 255)") {
                                    childStyle.color = rgbToHex(rgbColor);
                                }
                            }

                            const bgMatch = styleAttr.match(/background-color:\s*([^;]+)/);
                            if (bgMatch) {
                                const rgbBgColor = bgMatch[1];
                                if (rgbBgColor !== "rgb(255, 255, 255)") {
                                    childStyle.shading = {
                                        fill: rgbToHex(rgbBgColor),
                                        color: rgbToHex(rgbBgColor),
                                        val: "clear",
                                    };
                                }
                            }

                            // Handle text formatting
                            if (classes.includes("ql-bold")) childStyle.bold = true;
                            if (classes.includes("ql-italic")) childStyle.italics = true;
                            if (classes.includes("ql-underline")) childStyle.underline = true;
                            if (classes.includes("ql-strike")) childStyle.strike = true;

                            // Handle alignment
                            const alignClass = classes.find((cls) => cls.startsWith("ql-align-"));
                            if (alignClass) {
                                const align = alignClass.replace("ql-align-", "");
                                switch (align) {
                                    case "center":
                                        alignment = AlignmentType.CENTER;
                                        break;
                                    case "right":
                                        alignment = AlignmentType.RIGHT;
                                        break;
                                    case "justify":
                                        alignment = AlignmentType.JUSTIFIED;
                                        break;
                                    default:
                                        alignment = AlignmentType.LEFT;
                                }
                            }

                            // Handle lists and indentation
                            if (classes.includes("ql-indent-1")) childStyle.indent = { left: 720 };
                            if (classes.includes("ql-indent-2")) childStyle.indent = { left: 1440 };
                            if (classes.includes("ql-indent-3")) childStyle.indent = { left: 2160 };
                            if (classes.includes("ql-indent-4")) childStyle.indent = { left: 2880 };
                            if (classes.includes("ql-indent-5")) childStyle.indent = { left: 3600 };
                            if (classes.includes("ql-indent-6")) childStyle.indent = { left: 4320 };
                            if (classes.includes("ql-indent-7")) childStyle.indent = { left: 5040 };
                            if (classes.includes("ql-indent-8")) childStyle.indent = { left: 5760 };

                            // Handle blockquote
                            if (classes.includes("ql-blockquote")) {
                                childStyle.indent = { left: 720 };
                                childStyle.style = "Quote";
                            }

                            // Handle code block
                            if (classes.includes("ql-code-block")) {
                                childStyle.style = "No Spacing";
                                childStyle.font = { name: "Courier New" };
                            }

                            // Handle sub/superscript
                            if (classes.includes("ql-script-sub")) childStyle.subScript = true;
                            if (classes.includes("ql-script-super")) childStyle.superScript = true;

                            // Add the element's text with its style
                            if (child.textContent.trim()) {
                                children.push(
                                    new TextRun({
                                        text: child.textContent,
                                        ...childStyle,
                                    })
                                );
                            }
                        }
                    });

                    // Add any remaining text
                    if (currentText) {
                        children.push(
                            new TextRun({
                                text: currentText,
                                ...currentStyle,
                            })
                        );
                    }

                    if (children.length > 0) {
                        const paragraphStyle = {
                            children,
                            spacing: {
                                after: 200,
                                line: 360,
                            },
                            alignment,
                        };

                        if (headingLevel) {
                            paragraphStyle.heading = HeadingLevel[`HEADING_${headingLevel}`];
                        }

                        paragraphs.push(new Paragraph(paragraphStyle));
                    }
                }
            });

            // Create the document
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: paragraphs,
                    },
                ],
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
