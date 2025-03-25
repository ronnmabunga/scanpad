import { Modal, Button } from "react-bootstrap";

const AlertModal = ({ show, onClose, title, message, variant = "primary", onConfirm }) => {
    return (
        <Modal show={show} onHide={onClose} centered className="dark-modal">
            <Modal.Header closeButton className="bg-dark text-white border-secondary">
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white">{message}</Modal.Body>
            <Modal.Footer className="bg-dark border-secondary">
                <Button variant="outline-secondary" onClick={onClose} className="text-white">
                    {onConfirm ? "Cancel" : "OK"}
                </Button>
                {onConfirm && (
                    <Button variant={variant} onClick={onConfirm}>
                        Confirm
                    </Button>
                )}
            </Modal.Footer>
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
                `}
            </style>
        </Modal>
    );
};

export default AlertModal;
