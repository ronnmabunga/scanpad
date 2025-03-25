import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import LoadFileIntoEditorModal from "./LoadFileIntoEditorModal";
import { useDatabase } from "../contexts/DatabaseContext";

function RichTextEditor({ className, style, currentDoc, ...props }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { saveDocument } = useDatabase();
    const quillRef = useRef(null);
    const [content, setContent] = useState(currentDoc?.content || "");
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [lastSavedContent, setLastSavedContent] = useState(currentDoc?.content || "");

    useEffect(() => {
        if (currentDoc) {
            setContent(currentDoc.content);
            setLastSavedContent(currentDoc.content);
        }
    }, [currentDoc]);

    const modules = {
        toolbar: {
            container: [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ["small", false, "large", "huge"] }], ["bold", "italic", "underline", "strike"], [{ color: [] }, { background: [] }], [{ font: [] }], [{ align: [] }], [{ list: "ordered" }, { list: "bullet" }], [{ indent: "-1" }, { indent: "+1" }], ["blockquote", "code-block"], [{ script: "sub" }, { script: "super" }], ["link", "image", "video", "formula"], ["clean"]],
        },
    };

    const formats = ["header", "size", "bold", "italic", "underline", "strike", "color", "background", "font", "align", "list", "bullet", "indent", "blockquote", "code-block", "script", "link", "image", "video", "formula", "clean"];

    const isHomePage = location.pathname === "/";

    const normalizeContent = (str) => {
        if (!str) return "";
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

    const hasUnsavedChanges = normalizeContent(content) !== normalizeContent(lastSavedContent);

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
    };

    return (
        <div className={`flex-grow-1 d-flex ${className}`} style={{ ...style }} {...props}>
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Navbar bg="dark" variant="dark" className="px-3">
                    <div className="d-flex w-100">
                        <Nav className="me-auto">
                            {!isHomePage && (
                                <Nav.Link onClick={() => navigate("/")} className="text-white">
                                    Home
                                </Nav.Link>
                            )}
                            <NavDropdown title="File" id="file-dropdown">
                                <NavDropdown.Item>Save</NavDropdown.Item>
                                <NavDropdown.Item>Save As</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => setShowLoadModal(true)}>Load</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <div className="d-flex align-items-center position-absolute start-50 translate-middle-x">
                            <span className="text-white">{currentDoc?.name || "Untitled Document"}</span>
                        </div>
                        <div className="d-flex align-items-center ms-auto">
                            <span className="text-white">{hasUnsavedChanges ? <i className="bi bi-save text-danger"></i> : <i className="bi bi-check-circle text-success"></i>}</span>
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
                />
            </div>
            <LoadFileIntoEditorModal show={showLoadModal} onHide={() => setShowLoadModal(false)} hasUnsavedChanges={hasUnsavedChanges} onDiscardChanges={handleDiscardChanges} onSaveChanges={handleSaveChanges} />
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
            `}</style>
        </div>
    );
}

export default RichTextEditor;
