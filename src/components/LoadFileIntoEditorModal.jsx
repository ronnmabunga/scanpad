import React, { useState, useMemo } from "react";
import { Modal, Button, ListGroup, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../contexts/DatabaseContext";
import Fuse from "fuse.js";

function LoadFileIntoEditorModal({ show, onHide, hasUnsavedChanges, onDiscardChanges, onSaveChanges }) {
    const navigate = useNavigate();
    const { documents, deleteDocument } = useDatabase();
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleDocumentSelect = (doc) => {
        setSelectedDoc(doc);
    };

    const sortedDocuments = useMemo(() => {
        if (!searchTerm.trim()) {
            return documents;
        }

        const fuse = new Fuse(documents, {
            keys: ["name"],
            threshold: 1, // Allows full range of similarity
            distance: 100, // Maximum distance for fuzzy matching
        });

        const results = fuse.search(searchTerm);
        const sorted = results.map((result) => result.item);

        // Add documents not in the search results to the end of the sorted list
        const remainingDocuments = documents.filter((doc) => !sorted.includes(doc));
        return [...sorted, ...remainingDocuments];
    }, [documents, searchTerm]);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedDoc) {
            await deleteDocument(selectedDoc.id);
            setSelectedDoc(null);
            setShowDeleteConfirm(false);
        }
    };

    const handleLoadClick = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedConfirm(true);
        } else {
            navigateToDocument();
        }
    };

    const navigateToDocument = () => {
        if (selectedDoc) {
            navigate(`/edit/${selectedDoc.id}`);
            onHide();
        }
    };

    const handleDiscardChanges = () => {
        onDiscardChanges();
        navigateToDocument();
    };

    const handleSaveChanges = async () => {
        await onSaveChanges();
        navigateToDocument();
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg" className="text-white">
                <Modal.Header closeButton className="bg-dark border-secondary">
                    <Modal.Title>Load Document</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white">Search Documents</Form.Label>
                            <Form.Control type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by document name" className="bg-dark border-secondary text-white" />
                        </Form.Group>
                    </Form>
                    <ListGroup className="bg-dark">
                        {sortedDocuments.map((doc) => (
                            <ListGroup.Item key={doc.id} active={selectedDoc?.id === doc.id} onClick={() => handleDocumentSelect(doc)} style={{ cursor: "pointer" }} className="bg-dark border-secondary text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{doc.name}</h6>
                                        <small className="text-secondary">Last modified: {new Date(doc.updatedAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="outline-danger" onClick={handleDeleteClick} disabled={!selectedDoc}>
                        Delete
                    </Button>
                    <Button variant="primary" onClick={handleLoadClick} disabled={!selectedDoc}>
                        Load
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} className="text-white">
                <Modal.Header closeButton className="bg-dark border-secondary">
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">Are you sure you want to delete "{selectedDoc?.name}"? This action cannot be undone.</Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Unsaved Changes Confirmation Modal */}
            <Modal show={showUnsavedConfirm} onHide={() => setShowUnsavedConfirm(false)} className="text-white">
                <Modal.Header closeButton className="bg-dark border-secondary">
                    <Modal.Title>Unsaved Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">You have unsaved changes. What would you like to do?</Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => setShowUnsavedConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDiscardChanges}>
                        Discard Changes
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            <style>{`
                .modal-content {
                    background-color: #212529;
                    border: 1px solid #495057;
                }
                .modal-header {
                    border-bottom-color: #495057;
                }
                .modal-footer {
                    border-top-color: #495057;
                }
                .list-group-item.active {
                    background-color: #343a40 !important;
                    border-color: #495057 !important;
                }
                .list-group-item:hover {
                    background-color: #343a40 !important;
                }
                .btn-close {
                    filter: invert(1) grayscale(100%) brightness(200%);
                }
                .text-secondary {
                    color: #adb5bd !important;
                }
            `}</style>
        </>
    );
}

export default LoadFileIntoEditorModal;
