import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";

function FileViewer({ currentDoc }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isRootPath = location.pathname === "/";

    const modules = {
        toolbar: false, // Disable toolbar for read-only mode
    };

    const formats = ["header", "font", "size", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "indent", "link", "image", "color", "background", "align", "direction", "code-block"];

    return (
        <div className="d-flex flex-column" style={{ height: "100%" }}>
            <Navbar bg="dark" variant="dark" className="flex-shrink-0">
                <div className="d-flex w-100">
                    <Nav className="me-auto">{!isRootPath && <Nav.Link onClick={() => navigate("/")}>Home</Nav.Link>}</Nav>
                    <div className="d-flex align-items-center">
                        <span className="text-white me-3">{currentDoc?.name || "Untitled Document"}</span>
                    </div>
                </div>
            </Navbar>
            <div className="flex-grow-1" style={{ overflow: "hidden" }}>
                <ReactQuill value={currentDoc?.content || ""} modules={modules} formats={formats} readOnly={true} theme="snow" style={{ height: "100%" }} />
            </div>

            <style>{`
            .ql-container {
                height: 100% !important;
                overflow-y: auto !important;
            }
            .ql-editor {
                color: #ffffff !important;
                background-color: #000000 !important;
            }
            .ql-editor p {
                color: #ffffff !important;
            }
            .ql-editor h1,
            .ql-editor h2,
            .ql-editor h3,
            .ql-editor h4,
            .ql-editor h5,
            .ql-editor h6 {
                color: #ffffff !important;
            }
            .ql-editor a {
                color: #0d6efd !important;
            }
            .ql-editor blockquote {
                color: #adb5bd !important;
                border-left-color: #495057 !important;
            }
            .ql-editor pre {
                color: #ffffff !important;
                background-color: #212529 !important;
            }
            .ql-editor code {
                color: #ffffff !important;
                background-color: #212529 !important;
            }
            .ql-editor ul,
            .ql-editor ol {
                color: #ffffff !important;
            }
            .ql-editor li {
                color: #ffffff !important;
            }
            .ql-editor strong {
                color: #ffffff !important;
            }
            .ql-editor em {
                color: #ffffff !important;
            }
            .ql-editor u {
                color: #ffffff !important;
            }
            .ql-editor s {
                color: #ffffff !important;
            }
            .ql-editor .ql-align-center {
                text-align: center;
            }
            .ql-editor .ql-align-right {
                text-align: right;
            }
            .ql-editor .ql-align-justify {
                text-align: justify;
            }
        `}</style>
        </div>
    );
}

export default FileViewer;
