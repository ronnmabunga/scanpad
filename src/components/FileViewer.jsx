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
        <div className="d-flex flex-column" style={{ height: "100vh" }}>
            <Navbar bg="dark" variant="dark" className="flex-shrink-0">
                <div className="d-flex w-100">
                    <Nav className="me-auto">{!isRootPath && <Nav.Link onClick={() => navigate("/")}>Home</Nav.Link>}</Nav>
                    <div className="d-flex align-items-center">
                        <span className="text-white me-3">{currentDoc?.name || "Untitled Document"}</span>
                    </div>
                </div>
            </Navbar>
            <div className="flex-grow-1" style={{ overflow: "auto" }}>
                <ReactQuill value={currentDoc?.content || ""} modules={modules} formats={formats} readOnly={true} theme="snow" style={{ height: "calc(100vh - 56px)" }} />
            </div>
        </div>
    );
}

export default FileViewer;
