import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
    toolbar: [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ["small", false, "large", "huge"] }], ["bold", "italic", "underline", "strike"], [{ color: [] }, { background: [] }], [{ font: [] }], [{ align: [] }], [{ list: "ordered" }, { list: "bullet" }], [{ indent: "-1" }, { indent: "+1" }], ["blockquote", "code-block"], [{ script: "sub" }, { script: "super" }], ["link", "image", "video", "formula"], ["clean"]],
};

const RichTextEditor = ({ className, style, ...props }) => {
    const [value, setValue] = useState("");
    const [toolbarHeight, setToolbarHeight] = useState(42); // Default toolbar height
    const editorRef = useRef(null);

    useEffect(() => {
        const toolbar = document.querySelector(".ql-toolbar");
        if (toolbar) {
            const observer = new ResizeObserver(() => {
                setToolbarHeight(toolbar.offsetHeight);
            });

            observer.observe(toolbar);

            return () => observer.disconnect();
        }
    }, []);

    return (
        <div className={`flex-grow-1 d-flex ${className}`} style={{ ...style }} {...props}>
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <ReactQuill
                    ref={editorRef}
                    theme="snow"
                    value={value}
                    onChange={setValue}
                    modules={modules}
                    style={{
                        flex: 1, // Make it take up all available space
                        display: "flex",
                        flexDirection: "column",
                    }}
                />
                <style>
                    {`
                    .ql-container {
                        flex: 1;
                        height: calc(100% - ${toolbarHeight}px);
                    }
                    .ql-editor {
                        height: 100%;
                        overflow-y: auto;
                    }
                `}
                </style>
            </div>
        </div>
    );
};

export default RichTextEditor;
