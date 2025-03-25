import { Routes, Route } from "react-router-dom";
import PageHome from "./pages/PageHome";
import PageDocument from "./pages/PageDocument";
import PageDocuments from "./pages/PageDocuments";
import PageEditor from "./pages/PageEditor";
import PageError from "./pages/PageError";
function App() {
    return (
        <Routes>
            <Route path="/" element={<PageHome />} />
            <Route path="/files" element={<PageDocuments />} />
            <Route path="/files/:fileId" element={<PageDocument />} />
            <Route path="/files/:fileId/editor" element={<PageEditor />} />
            <Route path="*" element={<PageError />} />
            {/* <Route path="/login" element={<PageLogin />} />
                <Route path="/register" element={<PageRegister />} />
                <Route path="/logout" element={<PageLogout />} /> */}
            {/* <Route path="/test" element={<PageTest />} /> */}
        </Routes>
    );
}

export default App;
