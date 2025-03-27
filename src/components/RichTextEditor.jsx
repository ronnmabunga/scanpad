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

// Register Quill modules
const Quill = ReactQuill.Quill;
const icons = Quill.import("ui/icons");
icons["undo"] = '<i class="bi bi-arrow-counterclockwise"></i>';
icons["redo"] = '<i class="bi bi-arrow-clockwise"></i>';

function RichTextEditor({ className, style, autoPasteOCR, onAutoPasteOCRChange, showHomeLink = false, ...props }) {
    const navigate = useNavigate();
    const { saveDocument, currentDoc, setCurrentDoc } = useDatabase();
    const quillRef = useRef(null);
    const [content, setContent] = useState(currentDoc?.content || "");
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
            setContent(currentDoc.content);
            setLastSavedContent(currentDoc.content);
        }
    }, [currentDoc]);

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
