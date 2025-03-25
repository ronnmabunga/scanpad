import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import { useDatabase } from "../contexts/DatabaseContext";

function PageEditor() {
    const { fileId } = useParams();
    const { loadDocumentById, isInitialized } = useDatabase();
    const [initialContent, setInitialContent] = useState("");

    useEffect(() => {
        const loadContent = async () => {
            if (fileId) {
                // Load content from database if fileId is provided
                const doc = await loadDocumentById(fileId);
                if (doc) {
                    setInitialContent(doc.content);
                }
            } else {
                // Load content from localStorage if no fileId
                const savedContent = localStorage.getItem("editorContent");
                setInitialContent(savedContent || "");
            }
        };

        if (isInitialized) {
            loadContent();
        }
    }, [fileId, isInitialized, loadDocumentById]);

    return (
        <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
            <div className="row m-0" style={{ height: "100%" }}>
                <div className="col-12 p-0" style={{ height: "100%" }}>
                    <RichTextEditor style={{ height: "100%" }} initialValue={initialContent} />
                </div>
            </div>
        </div>
    );
}

export default PageEditor;
