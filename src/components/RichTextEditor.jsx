import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import SaveModal from "./SaveModal"; // Import SaveModal component
import LoadModal from "./LoadModal"; // Import LoadModal component
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";

const modules = {
    toolbar: {
        container: [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ["small", false, "large", "huge"] }], ["bold", "italic", "underline", "strike"], [{ color: [] }, { background: [] }], [{ font: [] }], [{ align: [] }], [{ list: "ordered" }, { list: "bullet" }], [{ indent: "-1" }, { indent: "+1" }], ["blockquote", "code-block"], [{ script: "sub" }, { script: "super" }], ["link", "image", "video", "formula"], ["clean"]],
    },
};

const RichTextEditor = ({ className, style, initialValue, ...props }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(() => {
        // Use initialValue if provided, otherwise try localStorage
        if (initialValue !== undefined) {
            return initialValue;
        }
        const savedContent = localStorage.getItem("editorContent");
        return savedContent || "";
    });
    const quillRef = useRef(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

    // Update value when initialValue changes
    useEffect(() => {
        if (initialValue !== undefined) {
            setValue(initialValue);
        }
    }, [initialValue]);

    // Listen for storage changes from other components/tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "editorContent" && e.newValue !== null) {
                setValue(e.newValue);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Save content to localStorage whenever it changes
    const handleChange = (newValue) => {
        setValue(newValue);
        localStorage.setItem("editorContent", newValue);
    };

    const handleLoad = (document) => {
        setValue(document.content);
        setIsLoadModalOpen(false);
    };

    const isHomePage = location.pathname === "/";

    return (
        <div className={`flex-grow-1 d-flex ${className}`} style={{ ...style }} {...props}>
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Navbar bg="dark" variant="dark" className="px-3">
                    <Nav>
                        {!isHomePage && (
                            <Nav.Link onClick={() => navigate("/")} className="text-white">
                                Home
                            </Nav.Link>
                        )}
                        <NavDropdown title="File" id="file-nav-dropdown">
                            <NavDropdown.Item onClick={() => setIsSaveModalOpen(true)}>Save</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => setIsLoadModalOpen(true)}>Load</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar>
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={value}
                    onChange={handleChange}
                    modules={modules}
                    style={{
                        height: "calc(100% - 56px)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                />

                <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} content={quillRef.current?.getEditor()?.root?.innerHTML || value} />
                <LoadModal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} onLoad={handleLoad} />
            </div>
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
};

export default RichTextEditor;
