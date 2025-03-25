import OCRImageCapture from "../components/OCRImageCapture";
import RichTextEditor from "../components/RichTextEditor";

function PageEditor() {
    return (
        <div className="col-6">
            <div className="container-fluid bg-black text-white min-vh-100 d-flex flex-column">
                <OCRImageCapture style={{ height: "7vh" }} />
                <RichTextEditor style={{ height: "92vh", marginTop: "7vh", marginBottom: "1vh" }} />
            </div>
        </div>
    );
}

export default PageEditor;
