import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../contexts/DatabaseContext";
import { Modal, Button, ListGroup, Alert } from "react-bootstrap";
import AlertModal from "./AlertModal";

const LoadModal = ({ isOpen, onClose, onLoad }) => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const { loadDocuments, deleteDocument, isLoading, error, isInitialized } = useDatabase();
    const [confirmConfig, setConfirmConfig] = useState({ show: false, doc: null });

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
        const doc = documents.find((d) => d.id === docId);
        if (!doc) return;

        setConfirmConfig({
            show: true,
            doc: doc,
            title: "Delete Document",
            message: "Are you sure you want to delete this document?",
            variant: "danger",
        });
    };

    const performDelete = async (docId) => {
        if (!isInitialized) return;

        const success = await deleteDocument(docId);
        if (success) {
            await fetchDocuments();
            setSelectedDoc(null);
        }
    };

    const handleLoad = async (document) => {
        if (onLoad) {
            onLoad(document);
        }
        // Navigate to the editor page with the loaded document's ID
        navigate(`/editor/${document.id}`);
    };

    return (
        <>
            <Modal show={isOpen} onHide={onClose} centered className="dark-modal">
                <Modal.Header closeButton className="bg-dark text-white border-secondary">
                    <Modal.Title>Load Document</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    {!isInitialized ? <Alert variant="danger">Database is initializing. Please wait...</Alert> : error ? <Alert variant="danger">{error}</Alert> : null}
                    <div className="border border-secondary rounded" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {!isInitialized ? (
                            <div className="text-center p-3 text-muted">Initializing database...</div>
                        ) : isLoading ? (
                            <div className="text-center p-3 text-muted">Loading documents...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center p-3 text-muted">No saved documents found</div>
                        ) : (
                            <ListGroup variant="flush" className="bg-dark">
                                {documents.map((doc) => (
                                    <ListGroup.Item key={doc.id} onClick={() => handleLoad(doc)} className="bg-dark text-white border-secondary" style={{ cursor: "pointer" }}>
                                        <div className="fw-medium">{doc.name}</div>
                                        <small className="text-muted">{new Date(doc.timestamp).toLocaleString()}</small>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="outline-danger" onClick={() => selectedDoc && handleDelete(selectedDoc.id)} disabled={!selectedDoc || isLoading || !isInitialized}>
                        Delete
                    </Button>
                    <div>
                        <Button variant="outline-secondary" onClick={onClose} disabled={isLoading} className="text-white">
                            Cancel
                        </Button>
                    </div>
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
                    performDelete(confirmConfig.doc.id);
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
                    .dark-modal .list-group-item {
                        background-color: #212529;
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

export default LoadModal;
