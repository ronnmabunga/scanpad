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
                break; // Stop processing after the first image is found
            }
        }

        // Allow normal text pasting if no image was found
        if (!foundImage) {
            return;
        }

        // Prevent default behavior ONLY if an image was processed
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
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log("Text copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy text to clipboard:", err);
            });
    };
    useEffect(() => {
        document.addEventListener("paste", handlePaste);
        return () => {
            document.removeEventListener("paste", handlePaste);
        };
    }, []);
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    return (
        <>
            <div className={`row w-100 bg-dark text-white ${className}`} style={{ position: "fixed", top: "0", zIndex: 10, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", ...style }} {...props}>
                <button
                    className="border border-dark bg-dark text-white d-flex flex-row align-items-center justify-content-around"
                    onClick={toggleCollapse}
                    style={{
                        cursor: "pointer",
                        fontSize: "calc(1vh + 0.57vw)",
                    }}
                >
                    {isProcessing ? <p>Processing OCR...</p> : <div>{transcribedText ? `Transcribed text is now on your clipboard! You can now paste it in one of the text fields, or paste another image with text to extract other content.` : `Paste an image with text to extract other content.`}</div>}
                    <div>{isCollapsed ? "↓ See" : "↑ Hide"} Results</div>
                </button>
                {!isCollapsed && (
                    <div className="p-4 bg-dark text-white border border-light">
                        <div>
                            {imageSrc ? (
                                <>
                                    Pasted Image:
                                    <div>
                                        <img src={imageSrc} alt="Pasted" class="img-fluid" className="p-3" style={{ border: "2px dashed #ccc" }} />
                                    </div>
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
                                    Text has been automatically sent to the clipboard!
                                    <br />
                                    By some chance you lost it, you can use the button below to copy it again.
                                    <div>
                                        <button onClick={() => copyToClipboard(transcribedText)} className="p-2">
                                            Copy Transcribed Text
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OCRImageCapture;
