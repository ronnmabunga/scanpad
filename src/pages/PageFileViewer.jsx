import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FileViewer from "../components/FileViewer";
import PageFileNotFound from "./PageFileNotFound";
import { useDatabase } from "../contexts/DatabaseContext";

function PageFileViewer() {
    const { fileId } = useParams();
    const { documents, currentDoc, setCurrentDoc } = useDatabase();
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
        }
    }, [fileId, documents, setCurrentDoc, currentDoc]);

    if (isNotFound) {
        return <PageFileNotFound />;
    }

    return (
        <div className="container-fluid p-0" style={{ height: "100vh" }}>
            <FileViewer currentDoc={currentDoc} />
        </div>
    );
}

export default PageFileViewer;
