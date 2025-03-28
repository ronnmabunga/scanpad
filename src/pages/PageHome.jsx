import { useEffect, useState } from "react";
import OCRNotepad from "../components/OCRNotepad";
import MetaTags from "../components/MetaTags";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Ad component for better organization
const AdUnit = ({ className, style, id }) => (
    <div className={`ad-container ${className}`} style={style}>
        <div id={id} className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark" style={{ minHeight: "90px" }}>
            {/* Ad will be inserted here by your ad script */}
        </div>
    </div>
);

function PageHome() {
    const [showAds, setShowAds] = useState(false); // Default to false, can be controlled by auth later
    const navigate = useNavigate();

    useEffect(() => {
        // Your ad initialization code here
        // Example: (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, [showAds]);

    return (
        <>
            <MetaTags
                title="ScanPad - OCR-Assisted Notepad"
                description="An OCR-assisted rich text editor that allows you to transcribe text from images and edit it in real-time. Simply paste an image to get started!"
                keywords="OCR, rich text editor, image to text, text transcription, document editor, text processing, assisted editing, ScanPad, OCR transcription, OCR editor, OCR text editor, OCR text transcription, document editor, text editor, OCR-assisted"
                ogTitle="ScanPad - Convert Images to Text"
                ogDescription="Transform images into editable text with our OCR-powered rich text editor. Easy to use, instant transcription."
                ogImage="/icon.svg"
                ogUrl={window.location.href}
                twitterCard="summary_large_image"
                twitterTitle="ScanPad - Convert Images to Text"
                twitterDescription="Transform images into editable text with our OCR-powered rich text editor. Easy to use, instant transcription."
                twitterImage="/icon.svg"
                canonicalUrl={window.location.href}
                author="R.Mabunga"
                language="English"
                themeColor="#000000"
                viewport="width=device-width, initial-scale=1.0"
                charset="utf-8"
                favicon="/icon.svg"
                appleTouchIcon="/icon.svg"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    name: "ScanPad",
                    description: "An OCR-assisted rich text editor that allows you to transcribe text from images and edit it in real-time.",
                    applicationCategory: "Text Editor",
                    operatingSystem: "Web Browser",
                    offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "USD",
                    },
                }}
            />
            <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
                <div className={`row m-0 ${!showAds && "d-flex flex-column justify-content-center align-items-center"}`} style={{ height: "100%" }}>
                    {/* Main Content */}
                    <div className="col-12 col-lg-5 text-center m-0 d-flex flex-column justify-content-center text-center bg-black text-white" style={{ height: "90%", maxHeight: "calc(100% - 95px)" }}>
                        <div className="text-center m-0">
                            <img src="/icon-dark.svg" alt="ScanPad Icon" style={{ width: "30%", height: "40%" }} />
                            <h1 className="font-body-1 mb-2">ScanPad</h1>
                            <p className="font-body-4 text-secondary mb-3">OCR-Assisted Notepad</p>
                            <p className="font-body-5 mx-5">Paste an image from the clipboard onto this window, after the app transcribes the image, paste again on the editor body to get the transcribed text.</p>
                            <Button variant="primary" className="font-body-5 mx-5 mt-3" onClick={() => navigate("/view")}>
                                View All Documents
                            </Button>
                        </div>
                    </div>
                    {/* In-between Ad (Mobile Only) */}
                    {showAds && (
                        <div className="row m-0 d-lg-none bg-black text-white">
                            <div className="col-12 p-0">
                                <AdUnit
                                    id="home-between-ad"
                                    className="w-100 text-center py-2"
                                    style={{
                                        background: "#1a1a1a",
                                        borderTop: "1px solid #333",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="col-12 col-lg-7 bg-black text-white py-3 m-0" style={{ height: "90%", maxHeight: "calc(100% - 95px)" }}>
                        <OCRNotepad style={{ height: "100%", maxHeight: "calc(100% - 5px)" }} />
                    </div>{" "}
                    {/* Bottom Bar Ad (Desktop Only) */}
                    {showAds && (
                        <div className="row m-0 d-none d-lg-block bg-black text-white" style={{ minHeight: "95px", height: "10%" }}>
                            <div className="col-12 p-0">
                                <AdUnit
                                    id="home-bottom-ad"
                                    className="w-100 text-center"
                                    style={{
                                        background: "#1a1a1a",
                                        borderTop: "1px solid #333",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default PageHome;
