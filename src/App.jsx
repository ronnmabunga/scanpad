import { Routes, Route } from "react-router-dom";
import PageHome from "./pages/PageHome";
import PageDocument from "./pages/PageDocument";
import PageDocuments from "./pages/PageDocuments";
import PageEditor from "./pages/PageEditor";
import PageError from "./pages/PageError";
import { DatabaseProvider } from "./contexts/DatabaseContext";

function App() {
    return (
        <DatabaseProvider>
            <Routes>
                <Route path="/" element={<PageHome />} />
                <Route path="/files" element={<PageDocuments />} />
                <Route path="/files/:fileId" element={<PageDocument />} />
                <Route path="/editor" element={<PageEditor />} />
                <Route path="/editor/:fileId" element={<PageEditor />} />
                <Route path="*" element={<PageError />} />
                {/* <Route path="/login" element={<PageLogin />} />
                    <Route path="/register" element={<PageRegister />} />
                    <Route path="/logout" element={<PageLogout />} /> */}
                {/* <Route path="/test" element={<PageTest />} /> */}
            </Routes>
        </DatabaseProvider>
    );
}

export default App;
