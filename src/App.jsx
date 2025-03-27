import { Routes, Route } from "react-router-dom";
import PageHome from "./pages/PageHome";
import PageEditor from "./pages/PageEditor";
import PageFileViewer from "./pages/PageFileViewer";
import PageError from "./pages/PageError";
import { DatabaseProvider } from "./contexts/DatabaseContext";

function App() {
    return (
        <DatabaseProvider>
            <Routes>
                <Route path="/" element={<PageHome />} />
                <Route path="/edit" element={<PageEditor />} />
                <Route path="/edit/:fileId" element={<PageEditor />} />
                <Route path="/view" element={<PageFileViewer />} />
                <Route path="/view/:fileId" element={<PageFileViewer />} />
                <Route path="*" element={<PageError />} />
            </Routes>
        </DatabaseProvider>
    );
}

export default App;
