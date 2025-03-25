import OCRImageCapture from "../components/OCRImageCapture";
import RichTextEditor from "../components/RichTextEditor";
import { Navbar, Container } from "react-bootstrap";

function PageHome() {
    return (
        <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
            <div className="row m-0" style={{ height: "10%" }}>
                <Navbar bg="dark" variant="dark" expand="lg">
                    <Container>
                        <Navbar.Brand href="#">OCR-Assisted Notepad</Navbar.Brand>
                    </Container>
                </Navbar>
            </div>
            <div className="row m-0" style={{ height: "90%" }}>
                <div className="col-12 col-sm-6 col-md-7 col-lg-5 col-xl-4 text-center m-0 d-flex flex-column justify-content-center bg-black text-white" style={{ height: "100%", minHeight: "90vh" }}>
                    <p className="font-body-2">OCR-Assisted Notepad</p>
                    <p className="font-body-4">Paste an image from the clipboard onto this window, after the app transcribes the image, paste again on the editor body to get the transcribed text.</p>
                </div>
                <div className="col-12 col-sm-6 col-md-5 col-lg-7 col-xl-8 bg-black text-white py-3" style={{ height: "100%" }}>
                    <div className="d-flex flex-column h-100">
                        <div className="flex-grow-1" style={{ overflow: "auto" }}>
                            <RichTextEditor style={{ height: "100%" }} />
                        </div>
                        <div style={{ height: "10%" }}>
                            <OCRImageCapture style={{ height: "100%" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageHome;
