import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import PageFileNotFound from "./PageFileNotFound";
import { useDatabase } from "../contexts/DatabaseContext";

function PageEditor() {
    const { fileId } = useParams();
    const { documents, currentDoc, setCurrentDoc } = useDatabase();
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        if (fileId) {
            const doc = documents.find((d) => d.id === fileId);
            if (doc) {
                setCurrentDoc(doc);
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
                    <RichTextEditor style={{ height: "100%" }} currentDoc={currentDoc} />
                </div>
            </div>
        </div>
    );
}

export default PageEditor;
