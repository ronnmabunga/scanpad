import { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import { Modal, Button } from "react-bootstrap";
import { FaCamera, FaUpload } from "react-icons/fa";

const OCRImageCapture = ({ className, style, ...props }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [transcribedText, setTranscribedText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setImageSrc(imageUrl);
                processOCR(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setImageSrc(imageUrl);
                processOCR(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const openCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");
        setImageSrc(imageUrl);
        processOCR(imageUrl);
        video.srcObject.getTracks().forEach((track) => track.stop());
        setIsCameraOpen(false);
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
        window.addEventListener("drop", handleDrop);
        window.addEventListener("dragover", (e) => e.preventDefault());
        return () => {
            document.removeEventListener("paste", handlePaste);
            window.removeEventListener("drop", handleDrop);
            window.removeEventListener("dragover", (e) => e.preventDefault());
        };
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
                            <p>Captured Image:</p>
                            <img
                                src={imageSrc}
                                alt="Captured"
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
                        <div>No image captured yet.</div>
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

            {/* Camera Modal */}
            <Modal show={isCameraOpen} onHide={() => setIsCameraOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Camera</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center">
                    <video ref={videoRef} autoPlay style={{ maxWidth: "100%" }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsCameraOpen(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={capturePhoto}>
                        Capture Photo
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Collapse Toggle */}
            <div
                className="font-body-5 w-100 p-1 border border-dark bg-dark text-white d-flex flex-row align-items-center justify-content-around"
                onClick={toggleCollapse}
                style={{
                    cursor: "pointer",
                }}
            >
                {/* Camera and Upload Options */}
                <div className="d-flex justify-content-around p-2">
                    <label className="btn btn-secondary text-white me-2">
                        <FaUpload />
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    </label>
                    <button onClick={openCamera} className="btn btn-secondary text-white">
                        <FaCamera />
                    </button>
                </div>
                {isProcessing ? <p>Processing OCR...</p> : <div>{transcribedText ? `You can now paste the transcribed text in the editor, or extract text from another image.` : `Drag-and-drop an image file, OR, Paste an image from the clipboard to extract text content.`}</div>}
                <div>{isCollapsed ? "↓ See" : "↑ Hide"} Results</div>
            </div>
        </div>
    );
};

export default OCRImageCapture;
