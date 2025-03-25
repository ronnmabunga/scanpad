import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../contexts/DatabaseContext";
import Fuse from "fuse.js";
function SaveFileAsIntoEditorModal({ show, onHide, content }) {
    const navigate = useNavigate();
    const { documents, currentDoc, saveDocument } = useDatabase();
    const [documentName, setDocumentName] = useState("");
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

    useEffect(() => {
        if (currentDoc) {
            setDocumentName(currentDoc.name);
        } else {
            setDocumentName("Untitled Document");
        }
    }, [currentDoc, show]);

    const handleDocumentSelect = (doc) => {
        setDocumentName(doc.name);
        setShowOverwriteConfirm(true);
    };

    const calculateSimilarity = (str1, str2) => {
        const options = {
            includeScore: true,
            threshold: 1, // Allows full range of similarity
            distance: 100, // Maximum distance for fuzzy matching
            keys: ["text"],
        };

        const fuse = new Fuse([{ text: str1 }], options);
        const result = fuse.search(str2);

        return result.length > 0 ? 1 - result[0].score : 0;
    };

    const sortedDocuments = useMemo(() => {
        if (!documentName.trim()) {
            return documents;
        }

        return [...documents].sort((a, b) => {
            const similarityA = calculateSimilarity(documentName, a.name);
            const similarityB = calculateSimilarity(documentName, b.name);
            return similarityB - similarityA;
        });
    }, [documents, documentName]);

    const handleSave = async () => {
        try {
            const existingDoc = documents.find((doc) => doc.name === documentName);

            if (existingDoc) {
                if (!showOverwriteConfirm) {
                    setShowOverwriteConfirm(true);
                    return;
                }
            }
            const docToSave = {
                ...(existingDoc || {}),
                id: existingDoc?.id || crypto.randomUUID(),
                name: documentName,
                content: content || currentDoc?.content || "",
                updatedAt: new Date().toISOString(),
                createdAt: existingDoc?.createdAt || new Date().toISOString(),
            };
            const success = await saveDocument(docToSave);
            if (success) {
                onHide();
                navigate(`/edit/${docToSave.id}`);
            }
        } catch (error) {
            console.error("Error saving document:", error);
        }
    };

    const handleCancel = () => {
        setDocumentName("");
        setShowOverwriteConfirm(false);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleCancel} size="lg" className="text-white">
            <Modal.Header closeButton className="bg-dark border-secondary">
                <Modal.Title>Save As</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white">Document Name</Form.Label>
                        <Form.Control type="text" value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Enter document name" className="bg-dark border-secondary text-white" />
                    </Form.Group>
                </Form>

                <div className="mt-3">
                    <h6 className="text-white">Existing Documents</h6>
                    <ListGroup className="bg-dark">
                        {sortedDocuments.map((doc) => (
                            <ListGroup.Item key={doc.id} action onClick={() => handleDocumentSelect(doc)} className="bg-dark border-secondary text-white" style={{ cursor: "pointer" }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{doc.name}</h6>
                                        <small className="text-secondary">Last modified: {new Date(doc.updatedAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            </Modal.Body>
            <Modal.Footer className="bg-dark border-secondary">
                <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={!documentName.trim()}>
                    Save
                </Button>
            </Modal.Footer>

            {/* Overwrite Confirmation Modal */}
            <Modal show={showOverwriteConfirm} onHide={() => setShowOverwriteConfirm(false)} className="text-white">
                <Modal.Header closeButton className="bg-dark border-secondary">
                    <Modal.Title>Confirm Overwrite</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">A document with the name "{documentName}" already exists. Do you want to overwrite it?</Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => setShowOverwriteConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Overwrite
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
                .form-control {
                    background-color: #343a40;
                    border-color: #495057;
                    color: white;
                }
                .form-control:focus {
                    background-color: #343a40;
                    border-color: #495057;
                    color: white;
                    box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
                }
                .form-control::placeholder {
                    color: #adb5bd;
                }
            `}</style>
        </Modal>
    );
}

export default SaveFileAsIntoEditorModal;
