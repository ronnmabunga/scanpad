import { Routes, Route } from "react-router-dom";
import PageHome from "./pages/PageHome";
import PageEditor from "./pages/PageEditor";
import PageFileViewer from "./pages/PageFileViewer";
import { DatabaseProvider } from "./contexts/DatabaseContext";

function App() {
    return (
        <DatabaseProvider>
            <Routes>
                <Route path="/" element={<PageHome />} />
                <Route path="/edit" element={<PageEditor />} />
                <Route path="/edit/:fileId" element={<PageEditor />} />
                <Route path="/view/:fileId" element={<PageFileViewer />} />
            </Routes>
        </DatabaseProvider>
    );
}

export default App;
