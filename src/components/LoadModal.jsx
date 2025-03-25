import { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";
import { Modal, Button, ListGroup, Alert } from "react-bootstrap";

const LoadModal = ({ isOpen, onClose, onLoad }) => {
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const { loadDocuments, deleteDocument, isLoading, error, isInitialized } = useDatabase();

    useEffect(() => {
        if (isOpen && isInitialized) {
            fetchDocuments();
        } else {
            setSelectedDoc(null);
        }
    }, [isOpen, isInitialized]);

    const fetchDocuments = async () => {
        const docs = await loadDocuments();
        setDocuments(docs);
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document?")) {
            return;
        }

        if (!isInitialized) {
            return;
        }

        const success = await deleteDocument(docId);
        if (success) {
            await fetchDocuments();
            setSelectedDoc(null);
        }
    };

    const handleLoadDocument = () => {
        if (!selectedDoc || !isInitialized) return;
        onLoad(selectedDoc);
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Load Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!isInitialized ? <Alert variant="danger">Database is initializing. Please wait...</Alert> : error ? <Alert variant="danger">{error}</Alert> : null}
                <div className="border rounded" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {!isInitialized ? (
                        <div className="text-center p-3 text-muted">Initializing database...</div>
                    ) : isLoading ? (
                        <div className="text-center p-3 text-muted">Loading documents...</div>
                    ) : documents.length === 0 ? (
                        <div className="text-center p-3 text-muted">No saved documents found</div>
                    ) : (
                        <ListGroup variant="flush">
                            {documents.map((doc) => (
                                <ListGroup.Item key={doc.id} onClick={() => !isLoading && isInitialized && setSelectedDoc(doc)} className={`${selectedDoc?.id === doc.id ? "active" : ""} ${isLoading || !isInitialized ? "disabled" : ""}`} style={{ cursor: isLoading || !isInitialized ? "not-allowed" : "pointer" }}>
                                    <div className="fw-medium">{doc.name}</div>
                                    <small className="text-muted">{new Date(doc.timestamp).toLocaleString()}</small>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={() => selectedDoc && handleDelete(selectedDoc.id)} disabled={!selectedDoc || isLoading || !isInitialized}>
                    Delete
                </Button>
                <div>
                    <Button variant="outline-secondary" onClick={onClose} disabled={isLoading} className="me-2">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleLoadDocument} disabled={!selectedDoc || isLoading || !isInitialized}>
                        {isLoading ? "Loading..." : "Load"}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default LoadModal;
