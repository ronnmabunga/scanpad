import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const OCRImageCapture = ({ className, style, ...props }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [transcribedText, setTranscribedText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const language = "eng";

    const handlePaste = (event) => {
        const items = event.clipboardData.items;
        let foundImage = false;

        for (let item of items) {
            if (item.type.indexOf("image") !== -1) {
                foundImage = true;
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    setImageSrc(imageUrl);
                    processOCR(file);
                };
                reader.readAsDataURL(file);
                break;
            }
        }

        if (!foundImage) {
            return;
        }
        event.preventDefault();
    };

    const processOCR = (imageFile) => {
        setIsProcessing(true);
        Tesseract.recognize(imageFile, language, {
            logger: (m) => console.log(m),
        }).then(({ data: { text } }) => {
            setIsProcessing(false);
            setTranscribedText(text);
            copyToClipboard(text);
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => console.log("Text copied to clipboard!"),
            (err) => console.error("Failed to copy text to clipboard:", err)
        );
    };

    useEffect(() => {
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div
            className={`font-body-5 position-relative col-12 bg-dark text-white border border-white ${className}`}
            style={{
                position: "sticky",
                bottom: "0",
                zIndex: 10,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                ...style,
            }}
            {...props}
        >
            {/* Collapsible Content */}
            <div
                className={`p-4 bg-dark text-white border border-light ${isCollapsed ? "d-none" : "d-block"}`}
                style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "0",
                    width: "100%",
                    backgroundColor: "#222",
                    zIndex: 11,
                    boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.3)",
                }}
            >
                <div>
                    {imageSrc ? (
                        <>
                            <p>Pasted Image:</p>
                            <img
                                src={imageSrc}
                                alt="Pasted"
                                className="p-3"
                                style={{
                                    objectFit: "contain",
                                    border: "2px dashed #ccc",
                                    maxHeight: "25vh",
                                    maxWidth: "25vw",
                                }}
                            />
                        </>
                    ) : (
                        <div>No image pasted yet.</div>
                    )}
                    <div>
                        {isProcessing ? (
                            <p>Processing OCR...</p>
                        ) : (
                            <>
                                {transcribedText && "Transcribed Text:"}
                                <pre
                                    className="p-3"
                                    style={{
                                        backgroundColor: "#f0f0f0",
                                        color: "#333",
                                    }}
                                >
                                    {transcribedText}
                                </pre>
                            </>
                        )}
                    </div>
                    {transcribedText && !isProcessing && (
                        <>
                            <p>Text has been automatically sent to the clipboard! If you lost it, you can copy it again below.</p>
                            <button onClick={() => copyToClipboard(transcribedText)} className="btn btn-light font-body-5 ">
                                Copy Transcribed Text
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <div
                className="font-body-5 w-100 p-1 border border-dark bg-dark text-white d-flex flex-row align-items-center justify-content-around"
                onClick={toggleCollapse}
                style={{
                    cursor: "pointer",
                }}
            >
                {isProcessing ? <p>Processing OCR...</p> : <div>{transcribedText ? `Transcribed text is now on your clipboard! Paste it in the editor or extract another image.` : `Paste an image with text to extract content.`}</div>}
                <div>{isCollapsed ? "↓ See" : "↑ Hide"} Results</div>
            </div>
        </div>
    );
};

export default OCRImageCapture;
