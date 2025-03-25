import { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";
import { Modal, Button, Form, Alert, ListGroup } from "react-bootstrap";

const SaveModal = ({ isOpen, onClose, content }) => {
    const [documentName, setDocumentName] = useState("");
    const { saveDocument, loadDocuments, isLoading, error, isInitialized } = useDatabase();
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (isOpen && isInitialized) {
            fetchDocuments();
        } else {
            setDocumentName("");
            setDocuments([]);
        }
    }, [isOpen, isInitialized]);

    const fetchDocuments = async () => {
        const docs = await loadDocuments();
        setDocuments(docs);
    };

    const handleDocumentClick = (doc) => {
        setDocumentName(doc.name);
    };

    const handleSave = async () => {
        if (!content) {
            return;
        }

        if (!isInitialized) {
            return;
        }

        // Check if document name already exists
        const existingDoc = documents.find((doc) => doc.name === documentName.trim());
        if (existingDoc) {
            if (!window.confirm(`A document with the name "${documentName}" already exists. Do you want to overwrite it?`)) {
                return;
            }
        }

        const success = await saveDocument(documentName, content);
        if (success) {
            setDocumentName("");
            onClose();
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Save Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!isInitialized ? <Alert variant="danger">Database is initializing. Please wait...</Alert> : error ? <Alert variant="danger">{error}</Alert> : null}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Document Name</Form.Label>
                        <Form.Control type="text" value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Enter document name" disabled={isLoading || !isInitialized} />
                    </Form.Group>
                </Form>
                <div className="mt-3">
                    <h6 className="mb-2">Existing Documents</h6>
                    <div className="border rounded" style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {documents.length === 0 ? (
                            <div className="text-center p-3 text-muted">No saved documents found</div>
                        ) : (
                            <ListGroup variant="flush">
                                {documents.map((doc) => (
                                    <ListGroup.Item key={doc.id} onClick={() => handleDocumentClick(doc)} className={doc.name === documentName ? "active" : ""} style={{ cursor: "pointer" }}>
                                        <div className="fw-medium">{doc.name}</div>
                                        <small className="text-muted">{new Date(doc.timestamp).toLocaleString()}</small>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={!documentName.trim() || isLoading || !isInitialized}>
                    {isLoading ? "Saving..." : "Save"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SaveModal;
