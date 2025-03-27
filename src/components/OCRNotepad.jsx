import { useState, useEffect } from "react";
import OCRImageCapture from "./OCRImageCapture";
import RichTextEditor from "./RichTextEditor";

function OCRNotepad({ className, style, showHomeLink = false, ...props }) {
    const [autoPasteOCR, setAutoPasteOCR] = useState(() => {
        const saved = localStorage.getItem("autoPasteOCR");
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        console.log("OCRNotepad - autoPasteOCR changed:", autoPasteOCR);
        localStorage.setItem("autoPasteOCR", JSON.stringify(autoPasteOCR));
    }, [autoPasteOCR]);

    const handleAutoPasteOCRChange = (value) => {
        console.log("OCRNotepad - handleAutoPasteOCRChange called with:", value);
        setAutoPasteOCR(value);
    };

    return (
        <div className={`d-flex flex-column h-100 ${className}`} style={{ ...style }} {...props}>
            <div className="flex-grow-1" style={{ overflow: "auto" }}>
                <RichTextEditor style={{ height: "100%" }} autoPasteOCR={autoPasteOCR} onAutoPasteOCRChange={handleAutoPasteOCRChange} showHomeLink={showHomeLink} />
            </div>
            <div style={{ height: "10%" }}>
                <OCRImageCapture style={{ height: "100%" }} autoPasteOCR={autoPasteOCR} />
            </div>
        </div>
    );
}

export default OCRNotepad;
