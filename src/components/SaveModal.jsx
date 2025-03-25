import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../contexts/DatabaseContext";
import { Modal, Button, Form, Alert, ListGroup } from "react-bootstrap";
import AlertModal from "./AlertModal";

const SaveModal = ({ isOpen, onClose, content }) => {
    const navigate = useNavigate();
    const [documentName, setDocumentName] = useState("");
    const { saveDocument, loadDocuments, isLoading, error, isInitialized } = useDatabase();
    const [documents, setDocuments] = useState([]);
    const [confirmConfig, setConfirmConfig] = useState({ show: false, doc: null });

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
        if (!content || !isInitialized) return;

        // Check if document name already exists
        const existingDoc = documents.find((doc) => doc.name === documentName.trim());
        if (existingDoc) {
            setConfirmConfig({
                show: true,
                doc: existingDoc,
                title: "Overwrite Document",
                message: `A document with the name "${documentName}" already exists. Do you want to overwrite it?`,
                variant: "warning",
            });
            return;
        }

        await performSave();
    };

    const performSave = async () => {
        const docId = await saveDocument(documentName, content);
        if (docId) {
            setDocumentName("");
            onClose();
            navigate(`/editor/${docId}`);
        }
    };

    return (
        <>
            <Modal show={isOpen} onHide={onClose} centered className="dark-modal">
                <Modal.Header closeButton className="bg-dark text-white border-secondary">
                    <Modal.Title>Save Document</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    {!isInitialized ? <Alert variant="danger">Database is initializing. Please wait...</Alert> : error ? <Alert variant="danger">{error}</Alert> : null}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Document Name</Form.Label>
                            <Form.Control type="text" value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Enter document name" disabled={isLoading || !isInitialized} className="bg-dark text-white border-secondary" />
                        </Form.Group>
                    </Form>
                    <div className="mt-3">
                        <h6 className="mb-2">Existing Documents</h6>
                        <div className="border border-secondary rounded" style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {documents.length === 0 ? (
                                <div className="text-center p-3 text-muted">No saved documents found</div>
                            ) : (
                                <ListGroup variant="flush" className="bg-dark">
                                    {documents.map((doc) => (
                                        <ListGroup.Item key={doc.id} onClick={() => handleDocumentClick(doc)} className={`${doc.name === documentName ? "active" : ""} bg-dark text-white border-secondary`} style={{ cursor: "pointer" }}>
                                            <div className="fw-medium">{doc.name}</div>
                                            <small className="text-muted">{new Date(doc.timestamp).toLocaleString()}</small>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="outline-secondary" onClick={onClose} disabled={isLoading} className="text-white">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={!documentName.trim() || isLoading || !isInitialized}>
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <AlertModal
                show={confirmConfig.show}
                onClose={() => setConfirmConfig({ show: false, doc: null })}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant={confirmConfig.variant}
                onConfirm={() => {
                    setConfirmConfig({ show: false, doc: null });
                    performSave();
                }}
            />
            <style>
                {`
                    .dark-modal .modal-content {
                        background-color: #212529;
                        border: 1px solid #495057;
                    }
                    .dark-modal .modal-header {
                        border-bottom: 1px solid #495057;
                    }
                    .dark-modal .modal-footer {
                        border-top: 1px solid #495057;
                    }
                    .dark-modal .btn-close {
                        filter: invert(1) grayscale(100%) brightness(200%);
                    }
                    .dark-modal .btn-outline-secondary {
                        color: #fff;
                        border-color: #495057;
                    }
                    .dark-modal .btn-outline-secondary:hover {
                        background-color: #343a40;
                        border-color: #495057;
                    }
                    .dark-modal .form-control {
                        background-color: #212529;
                        border-color: #495057;
                        color: #fff;
                    }
                    .dark-modal .form-control:focus {
                        background-color: #212529;
                        border-color: #495057;
                        color: #fff;
                        box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
                    }
                    .dark-modal .form-control:disabled {
                        background-color: #343a40;
                        border-color: #495057;
                        color: #adb5bd;
                    }
                    .dark-modal .list-group-item.active {
                        background-color: #343a40;
                        border-color: #495057;
                    }
                    .dark-modal .list-group-item:hover {
                        background-color: #343a40;
                    }
                    .dark-modal .text-muted {
                        color: #adb5bd !important;
                    }
                `}
            </style>
        </>
    );
};

export default SaveModal;
