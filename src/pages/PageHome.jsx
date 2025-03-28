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
            <MetaTags ogUrl={window.location.href} canonicalUrl={window.location.href} />
            <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
                <div className={`row m-0 ${!showAds && "d-flex flex-column justify-content-center align-items-center"}`} style={{ height: "100%" }}>
                    {/* In-betweenTop Ad (Mobile Only) */}
                    {showAds && (
                        <div className="row m-0 d-lg-none bg-black text-white">
                            <div className="col-12 p-1">
                                <AdUnit
                                    id="home-between-ad"
                                    className="w-100 text-center"
                                    style={{
                                        background: "#1a1a1a",
                                        borderTop: "1px solid #333",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {/* Main Content */}
                    <div className="col-12 col-lg-5 text-center m-0 d-flex flex-column justify-content-center bg-black text-white p-1" style={{ height: "90%", maxHeight: "calc(100% - 95px)" }}>
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
                    <div className="d-none d-lg-block col-lg-7 bg-black text-white  p-1 m-0" style={{ height: "90%", maxHeight: "calc(100% - 95px)" }}>
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
