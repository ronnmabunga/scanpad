import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

function PageError() {
    const navigate = useNavigate();

    return (
        <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <h1 className="mb-4">Page Not Found</h1>
                <p className="mb-4">The page you're looking for doesn't exist or has been deleted.</p>
                <Button variant="primary" onClick={() => navigate("/")}>
                    Return to Home
                </Button>
            </div>
        </div>
    );
}

export default PageError;
