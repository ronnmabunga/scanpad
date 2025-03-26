import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import PageFileNotFound from "./PageFileNotFound";
import { useDatabase } from "../contexts/DatabaseContext";
import OCRImageCapture from "../components/OCRImageCapture";
function PageEditor() {
    const { fileId } = useParams();
    const { documents, setCurrentDoc } = useDatabase();
    const [isNotFound, setIsNotFound] = useState(false);

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

    if (isNotFound) {
        return <PageFileNotFound />;
    }

    return (
        <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
            <div className="row m-0" style={{ height: "100%" }}>
                <div className="col-12 p-0" style={{ height: "100%" }}>
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

export default PageEditor;
