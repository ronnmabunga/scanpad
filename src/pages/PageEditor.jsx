import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OCRNotepad from "../components/OCRNotepad";
import PageFileNotFound from "./PageFileNotFound";
import { useDatabase } from "../contexts/DatabaseContext";

// Ad component for better organization
const AdUnit = ({ className, style, id }) => (
    <div className={`ad-container ${className}`} style={style}>
        <div id={id} className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark" style={{ minHeight: "90px" }}>
            {/* Ad will be inserted here by your ad script */}
        </div>
    </div>
);

function PageEditor() {
    const { fileId } = useParams();
    const { documents, setCurrentDoc } = useDatabase();
    const [isNotFound, setIsNotFound] = useState(false);
    const [showAds, setShowAds] = useState(true); // Default to false, can be controlled by auth later

    useEffect(() => {
        if (fileId) {
            const doc = documents.find((d) => d.id === fileId);
            if (doc) {
                setCurrentDoc(doc);
                localStorage.setItem("lastOpenedDocId", doc?.id);
                setIsNotFound(false);
            } else {
                setIsNotFound(true);
            }
        } else {
            // If no fileId, create a new untitled document
            setCurrentDoc({
                id: null,
                name: "Untitled Document",
                content: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            localStorage.setItem("lastOpenedDocId", null);
            setIsNotFound(false);
        }
    }, [fileId, documents, setCurrentDoc]);

    // Effect to initialize ads only if ads are enabled
    useEffect(() => {
        if (showAds) {
            // Your ad initialization code here
            // Example: (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, [showAds]);

    if (isNotFound) {
        return <PageFileNotFound />;
    }

    return (
        <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
            {/* Top Ad (Mobile Only) */}
            {showAds && (
                <div className="row m-0 d-lg-none block bg-black text-white">
                    <div className="col-12 p-0">
                        <AdUnit
                            id="editor-top-ad"
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
            <div className="row m-0" style={{ height: "100%" }}>
                {/* Left Sidebar Ad (Desktop Only) */}
                {showAds && (
                    <div className="col-auto d-none d-lg-block p-0" style={{ width: "160px" }}>
                        <AdUnit
                            id="editor-left-ad"
                            className="h-100"
                            style={{
                                background: "#1a1a1a",
                                borderRight: "1px solid #333",
                            }}
                        />
                    </div>
                )}

                {/* Editor */}
                <div className={`col p-0 ${!showAds ? "col-12" : ""}`}>
                    <OCRNotepad style={{ height: "100%" }} showHomeLink={true} />
                </div>

                {/* Right Sidebar Ad (Desktop Only) */}
                {showAds && (
                    <div className="col-auto d-none d-lg-block p-0" style={{ width: "160px" }}>
                        <AdUnit
                            id="editor-right-ad"
                            className="h-100"
                            style={{
                                background: "#1a1a1a",
                                borderLeft: "1px solid #333",
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PageEditor;
