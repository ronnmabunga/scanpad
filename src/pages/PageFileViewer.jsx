import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileViewer from "../components/FileViewer";
import PageFileNotFound from "./PageFileNotFound";
import { useDatabase } from "../contexts/DatabaseContext";
import Fuse from "fuse.js";
import { Button, Form, ListGroup, Modal } from "react-bootstrap";

// Ad component for better organization
const AdUnit = ({ className, style, id }) => (
    <div className={`ad-container ${className}`} style={style}>
        <div id={id} className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark" style={{ minHeight: "90px" }}>
            {/* Ad will be inserted here by your ad script */}
        </div>
    </div>
);

function PageFileViewer() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const { documents, setCurrentDoc, deleteDocument } = useDatabase();
    const [isNotFound, setIsNotFound] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAds, setShowAds] = useState(false); // Default to false, can be controlled by auth later

    useEffect(() => {
        if (fileId) {
            const doc = documents.find((d) => d.id === fileId);
            if (doc) {
                setCurrentDoc(doc);
                setSelectedDoc(doc);
                localStorage.setItem("lastOpenedDocId", doc?.id);
                setIsNotFound(false);
            } else {
                setIsNotFound(true);
            }
        }
    }, [fileId, documents, setCurrentDoc]);

    // Effect to initialize ads only if ads are enabled
    useEffect(() => {
        if (showAds) {
            // Your ad initialization code here
            // Example: (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, [showAds]);

    const sortedDocuments = useMemo(() => {
        if (!searchTerm.trim()) {
            return documents;
        }

        const fuse = new Fuse(documents, {
            keys: ["name"],
            threshold: 1,
            distance: 100,
        });

        const results = fuse.search(searchTerm);
        const sorted = results.map((result) => result.item);

        const remainingDocuments = documents.filter((doc) => !sorted.includes(doc));
        return [...sorted, ...remainingDocuments];
    }, [documents, searchTerm]);

    const handleDocumentSelect = (doc) => {
        setSelectedDoc(doc);
        setCurrentDoc(doc);
        navigate(`/view/${doc.id}`);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedDoc) {
            await deleteDocument(selectedDoc.id);
            setSelectedDoc(null);
            setShowDeleteConfirm(false);
            navigate("/view");
        }
    };

    const handleEditClick = () => {
        if (selectedDoc) {
            navigate(`/edit/${selectedDoc.id}`);
        }
    };

    const handleNewClick = () => {
        navigate("/edit");
    };

    if (isNotFound) {
        return <PageFileNotFound />;
    }

    return (
        <div className="container-fluid bg-dark text-white p-0" style={{ height: "100vh" }}>
            <div className={`row m-0 ${!showAds && "d-flex flex-column justify-content-center align-items-center"}`} style={{ height: "100%" }}>
                {/* Top Ad (Mobile Only) */}
                {showAds && (
                    <div className="row m-0 d-lg-none bg-dark text-white" style={{ height: "10%" }}>
                        <div className="col-12 p-0">
                            <AdUnit
                                id="viewer-top-ad"
                                className="w-100 text-center"
                                style={{
                                    background: "#1a1a1a",
                                    borderTop: "1px solid #333",
                                }}
                            />
                        </div>
                    </div>
                )}
                {/* Left Side - Document List */}
                <div className="col-12 col-lg-4 bg-dark p-3" style={{ height: "90%", overflowY: "auto" }}>
                    <div className="mb-3">
                        <Form.Control type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search documents..." className="bg-dark border-secondary text-white" />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <img src="/icon-dark.svg" alt="OCR Icon" style={{ width: "24px", height: "24px", marginRight: "8px" }} />
                            <h5 className="mb-0">Documents</h5>
                        </div>
                        <div>
                            <Button variant="outline-success" size="sm" onClick={handleNewClick} className="me-2">
                                New
                            </Button>
                            <Button variant="outline-primary" size="sm" onClick={handleEditClick} disabled={!selectedDoc} className="me-2">
                                Edit
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={handleDeleteClick} disabled={!selectedDoc}>
                                Delete
                            </Button>
                        </div>
                    </div>
                    <ListGroup className="bg-dark">
                        {sortedDocuments.map((doc) => (
                            <ListGroup.Item key={doc.id} active={selectedDoc?.id === doc.id} onClick={() => handleDocumentSelect(doc)} style={{ cursor: "pointer" }} className="bg-dark border-secondary text-white">
                                <div>
                                    <h6 className="mb-0">{doc.name}</h6>
                                    <small className="text-secondary">Last modified: {new Date(doc.updatedAt).toLocaleString()}</small>
                                    <br />
                                    <small className="text-secondary">Created: {new Date(doc.createdAt).toLocaleString()}</small>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
                {/* Right Side - Preview */}
                <div className="d-none d-lg-block col-12 col-lg-8 bg-black p-0" style={{ height: "90%" }}>
                    {selectedDoc ? (
                        <FileViewer currentDoc={selectedDoc} />
                    ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center">
                            <p className="text-muted">No document selected</p>
                        </div>
                    )}
                </div>{" "}
                {/* Bottom Ad (Desktop Only) */}
                {showAds && (
                    <div className="row m-0 d-none d-lg-block bg-dark text-white" style={{ height: "10%" }}>
                        <div className="col-12 p-0">
                            <AdUnit
                                id="viewer-bottom-ad"
                                className="w-100 text-center"
                                style={{
                                    background: "#1a1a1a",
                                    borderTop: "1px solid #333",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

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
                .form-control::placeholder {
                    color: #adb5bd;
                }
            `}</style>
        </div>
    );
}

export default PageFileViewer;
