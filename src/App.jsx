import OCRImageCapture from "./components/OCRImageCapture";
import RichTextEditor from "./components/RichTextEditor";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    return (
        <div className="container-fluid bg-black text-white min-vh-100 d-flex flex-column">
            <OCRImageCapture style={{ height: "7vh" }} />
            <div style={{ height: "7vh" }}></div>
            <RichTextEditor style={{ height: "92vh" }} />
            <div style={{ height: "1vh" }}></div>
        </div>
    );
}

export default App;
