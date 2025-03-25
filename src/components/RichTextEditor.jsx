import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import mammoth from "mammoth"; // Convert DOCX to HTML
import { saveAs } from "file-saver"; // Handle file downloads
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Indent } from "docx"; // Generate DOCX
import SaveModal from "./SaveModal"; // Import SaveModal component
import LoadModal from "./LoadModal"; // Import LoadModal component
import { DatabaseProvider } from "../contexts/DatabaseContext"; // Import DatabaseProvider

const modules = {
    toolbar: {
        container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["blockquote", "code-block"],
            [{ script: "sub" }, { script: "super" }],
            ["link", "image", "video", "formula"],
            ["clean"], // Ensure toolbar exists
        ],
    },
};

const RichTextEditor = ({ className, style, ...props }) => {
    const [value, setValue] = useState("");
    const quillRef = useRef(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

    // Set initial test content
    useEffect(() => {
        const testContent = `
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>

                <p><span class="ql-size-small">Small text</span></p>
                <p>Normal text</p>
                <p><span class="ql-size-large">Large text</span></p>
                <p><span class="ql-size-huge">Huge text</span></p>

                <p>
                    <strong>Bold</strong>,
                    <em>Italic</em>,
                    <u>Underline</u>,
                    <s>Strikethrough</s>
                </p>

                <p>
                    <span style="color: rgb(230, 0, 0);">Red text</span>,
                    <span style="color: rgb(0, 97, 0);">Green text</span>,
                    <span style="color: rgb(0, 0, 230);">Blue text</span>
                </p>

                <p>
                    <span style="background-color: rgb(255, 255, 0);">Yellow background</span>,
                    <span style="background-color: rgb(0, 255, 0);">Green background</span>,
                    <span style="background-color: rgb(0, 255, 255);">Cyan background</span>
                </p>

                <p>
                    <span style="font-family: Arial;">Arial font</span>,
                    <span style="font-family: Times New Roman;">Times New Roman font</span>,
                    <span style="font-family: Courier New;">Courier New font</span>
                </p>

                <p class="ql-align-left">Left aligned text</p>
                <p class="ql-align-center">Center aligned text</p>
                <p class="ql-align-right">Right aligned text</p>
                <p class="ql-align-justify">Justified text that spans multiple lines to demonstrate the justification. This text should be long enough to wrap to multiple lines.</p>

                <ol>
                    <li>First ordered item</li>
                    <li>Second ordered item</li>
                    <li>Third ordered item</li>
                </ol>

                <ul>
                    <li>First unordered item</li>
                    <li>Second unordered item</li>
                    <li>Third unordered item</li>
                </ul>

                <p class="ql-indent-1">First level indent</p>
                <p class="ql-indent-2">Second level indent</p>
                <p class="ql-indent-3">Third level indent</p>

                <blockquote>This is a blockquote. It can contain multiple lines of text and is typically used for quotations.</blockquote>

                <pre class="ql-syntax">This is a code block.
    function example() {
        return "Hello, World!";
    }</pre>

                <p>Text with <sub>subscript</sub> and <sup>superscript</sup></p>

                <p><a href="https://example.com">This is a link</a></p>

                <p>Formula example: E = mc<sup>2</sup></p>

                <h2>Complex Formatting Combinations</h2>

                <p><strong><em><u><span style="color: rgb(230, 0, 0);">Bold, italic, underlined, and red</span></u></em></strong></p>

                <p class="ql-align-center">
                    <span style="font-family: Arial; background-color: rgb(255, 255, 0);">
                        <strong><span style="color: rgb(0, 0, 230);">Centered blue bold text with yellow background in Arial</span></strong>
                    </span>
                </p>

                <p class="ql-indent-2">
                    <span style="font-family: Times New Roman;">
                        <em><span style="color: rgb(128, 0, 128);">Indented purple italic text in Times New Roman with </span></em>
                        <strong><span style="color: rgb(0, 128, 0);">green bold emphasis</span></strong>
                    </span>
                </p>

                <blockquote>
                    <span style="font-family: Courier New;">
                        <strong><em><span style="color: rgb(255, 140, 0);">Orange bold italic text in Courier New as a quote</span></em></strong>
                    </span>
                </blockquote>

                <p class="ql-align-right">
                    <span style="background-color: rgb(230, 230, 250);">
                        <span class="ql-size-large"><strong>Large bold text</strong></span> with
                        <span class="ql-size-small"><em>small italic text</em></span> and
                        <span style="color: rgb(220, 20, 60);"><u>crimson underline</u></span>
                    </span>
                </p>

                <p class="ql-align-justify">
                    <span style="font-family: Arial;">
                        Text with <sup><strong><span style="color: rgb(0, 128, 128);">teal bold superscript</span></strong></sup>
                        and <sub><em><span style="color: rgb(139, 69, 19);">brown italic subscript</span></em></sub>
                        in a justified paragraph
                    </span>
                </p>

                <p class="ql-indent-1">
                    <span style="background-color: rgb(240, 230, 140);">
                        <span style="font-family: Times New Roman;">
                            <strong><em><s>Bold italic strikethrough</s></em></strong> with
                            <span style="color: rgb(75, 0, 130);"><u>indigo underline</u></span> and
                            <span class="ql-size-huge">huge size</span>
                        </span>
                    </span>
                </p>

                <ol>
                    <li>
                        <strong><span style="color: rgb(178, 34, 34);">Dark red bold list item</span></strong> with
                        <span style="background-color: rgb(152, 251, 152);"><em>light green background italic</em></span>
                    </li>
                    <li>
                        <span class="ql-size-large"><span style="color: rgb(25, 25, 112);">Large dark blue text</span></span> with
                        <sub><span style="color: rgb(219, 112, 147);">pink subscript</span></sub>
                    </li>
                </ol>

                <pre class="ql-syntax">
    <span style="color: rgb(0, 128, 0);">// Green comment in code block</span>
    <span style="color: rgb(0, 0, 255);">function</span> <span style="color: rgb(128, 0, 0);">complexFormatting</span>() {
        <span style="color: rgb(0, 0, 255);">return</span> <span style="color: rgb(163, 21, 21);">"Colored code example"</span>;
    }</pre>

                <h2>Advanced Formatting Examples</h2>

                <div class="ql-align-center">
                    <h3><span style="background-color: rgb(255, 182, 193);">🎨 Creative Text Effects 🎨</span></h3>
                </div>

                <p class="ql-align-center">
                    <span style="font-family: Arial; background-color: rgb(135, 206, 235);">
                        <span class="ql-size-huge"><strong>R</strong></span><span class="ql-size-large"><strong>A</strong></span><strong>I</strong><span class="ql-size-small"><strong>N</strong></span><span class="ql-size-small"><strong>B</strong></span><strong>O</strong><span class="ql-size-large"><strong>W</strong></span>
                    </span>
                </p>

                <p class="ql-align-justify">
                    <span style="background-color: rgb(255, 228, 196);">
                        <span style="font-family: Times New Roman;">
                            <em>Gradient-like effect: </em>
                            <span style="color: rgb(255, 0, 0);">R</span><span style="color: rgb(255, 127, 0);">a</span><span style="color: rgb(255, 255, 0);">i</span><span style="color: rgb(0, 255, 0);">n</span><span style="color: rgb(0, 0, 255);">b</span><span style="color: rgb(75, 0, 130);">o</span><span style="color: rgb(148, 0, 211);">w</span>
                        </span>
                    </span>
                </p>

                <h4>Nested Lists with Mixed Formatting</h4>

                <ul>
                    <li>
                        <strong><span style="color: rgb(186, 85, 211);">Main Topic 1</span></strong>
                        <ul>
                            <li><em><span style="color: rgb(147, 112, 219);">Subtopic with purple italic</span></em>
                                <ul>
                                    <li><u><span style="color: rgb(138, 43, 226);">Deep nested item with violet underline</span></u></li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <strong><span style="color: rgb(64, 224, 208);">Main Topic 2</span></strong>
                        <ol>
                            <li><span style="background-color: rgb(175, 238, 238);">Numbered subtopic with turquoise background</span>
                                <ul>
                                    <li><span style="font-family: Courier New;"><code>Mixed list styles with monospace</code></span></li>
                                </ul>
                            </li>
                        </ol>
                    </li>
                </ul>

                <h4>Creative Blockquotes</h4>

                <blockquote class="ql-align-center">
                    <span style="background-color: rgb(230, 230, 250);">
                        <span class="ql-size-large"><span style="font-family: Arial;">💭 </span></span>
                        <em><span style="color: rgb(123, 104, 238);">Centered quote with</span></em>
                        <span class="ql-size-large"><span style="font-family: Arial;"> 💭</span></span>
                    </span>
                </blockquote>

                <blockquote class="ql-indent-2">
                    <span style="background-color: rgb(255, 240, 245);">
                        <span style="font-family: Times New Roman;">
                            <strong><span style="color: rgb(199, 21, 133);">Indented quote with</span></strong>
                            <em><span style="color: rgb(219, 112, 147);"> elegant styling</span></em>
                        </span>
                    </span>
                </blockquote>

                <h4>Mixed Alignment Paragraph</h4>

                <p class="ql-align-left">
                    <span style="background-color: rgb(240, 255, 240);">
                        <span style="font-family: Arial;">Left aligned with</span>
                    </span>
                </p>
                <p class="ql-align-center">
                    <span style="background-color: rgb(255, 240, 245);">
                        <span class="ql-size-large"><span style="font-family: Times New Roman;">⭐ Centered highlight ⭐</span></span>
                    </span>
                </p>
                <p class="ql-align-right">
                    <span style="background-color: rgb(240, 248, 255);">
                        <span style="font-family: Courier New;">Right aligned finish</span>
                    </span>
                </p>

                <h4>Technical Formatting</h4>

                <p class="ql-align-justify">
                    <code><span style="color: rgb(46, 139, 87);">const</span> <span style="color: rgb(25, 25, 112);">formatText</span> = (<span style="color: rgb(165, 42, 42);">text</span>) => {
                        <span style="color: rgb(0, 0, 139);">return</span> <span style="color: rgb(160, 82, 45);">text.format()</span>;
                    }</code>
                </p>

                <p class="ql-indent-1">
                    <span style="font-family: Courier New;">
                        <span style="color: rgb(169, 169, 169);">// Variable examples:</span><br/>
                        <span style="color: rgb(0, 139, 139);">let</span> x = <span style="color: rgb(178, 34, 34);">42</span>;<br/>
                        <span style="color: rgb(0, 139, 139);">const</span> y = <span style="color: rgb(0, 100, 0);">"string"</span>;
                    </span>
                </p>

                <h4>Mathematical Expressions</h4>

                <p class="ql-align-center">
                    <span style="font-family: Times New Roman;">
                        <span style="color: rgb(25, 25, 112);">
                            f(x) = x<sup>2</sup> + 2x + 1
                        </span>
                    </span>
                </p>

                <p class="ql-align-center">
                    <span style="font-family: Times New Roman;">
                        <span style="color: rgb(139, 69, 19);">
                            log<sub>2</sub>(x) = <span style="background-color: rgb(255, 250, 205);">y</span>
                        </span>
                    </span>
                </p>

                <h4>Decorative Dividers</h4>

                <p class="ql-align-center">
                    <span style="color: rgb(188, 143, 143);">✧･ﾟ</span> <span style="color: rgb(205, 92, 92);">❈</span> <span style="color: rgb(188, 143, 143);">･ﾟ✧</span>
                </p>

                <p class="ql-align-center">
                    <span style="color: rgb(176, 196, 222);">════ ⋆★⋆ ════</span>
                </p>

                <p class="ql-align-center">
                    <span style="color: rgb(119, 136, 153);">──────────</span>
                </p>
            `;

        setValue(testContent);
    }, []);

    // Handle DOCX file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setValue(result.value);
        };
        reader.readAsArrayBuffer(file);
    };

    // Function to insert buttons into the toolbar
    const addCustomButtons = () => {
        const toolbar = document.querySelector(".ql-toolbar");
        if (!toolbar) return;
        let lastGroup = toolbar.querySelector(".ql-formats:last-of-type");
        if (!lastGroup) return;
        const buttonConfigs = [
            { className: "custom-load-file", label: "📂", title: "Load from file", handler: () => document.getElementById("docx-upload").click() },
            { className: "custom-save-file", label: "💾", title: "Save to file", handler: saveDocx },
            { className: "custom-load-storage", label: "🔄", title: "Load from app storage", handler: loadFromStorage },
            { className: "custom-save-storage", label: "📥", title: "Save to app storage", handler: saveToStorage },
        ];

        buttonConfigs.forEach(({ className, label, title, handler }) => {
            if (!document.querySelector(`.ql-toolbar .ql-${className}`)) {
                const button = document.createElement("button");
                button.classList.add(`ql-${className}`);
                button.innerHTML = label;
                button.title = title;
                button.onclick = handler;
                lastGroup.appendChild(button);
            }
        });
    };

    // Wait for Quill toolbar to be available and then add buttons
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (document.querySelector(".ql-toolbar")) {
                addCustomButtons();
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    // Save to IndexedDB
    const saveToStorage = async () => {
        setIsSaveModalOpen(true);
    };

    // Load from IndexedDB
    const loadFromStorage = async () => {
        setIsLoadModalOpen(true);
    };

    const handleLoad = (document) => {
        setValue(document.content);
        setIsLoadModalOpen(false);
    };

    // TO IMPROVE not all format options are saved
    const saveDocx = async () => {
        const editorContent = quillRef.current.getEditor().root.innerHTML;

        // Parse HTML content
        const parser = new DOMParser();
        const dom = parser.parseFromString(editorContent, "text/html");
        const elements = dom.body.childNodes;

        // Define numbering for ordered lists
        const numbering = {
            config: [
                {
                    reference: "default-numbering",
                    levels: [
                        {
                            level: 0,
                            format: "decimal",
                            text: "%1.",
                            alignment: AlignmentType.START,
                            style: {
                                paragraph: {
                                    indent: { left: 720, hanging: 360 },
                                },
                            },
                        },
                    ],
                },
            ],
        };

        let docParagraphs = [];

        const processTextNode = (node, baseStyle = {}) => {
            if (node.nodeType === 3) {
                // Text node
                return new TextRun({ ...baseStyle, text: node.textContent });
            }

            let style = { ...baseStyle };

            // Handle inline styles
            if (node.style) {
                if (node.style.color) style.color = node.style.color.replace("#", "");
                if (node.style.backgroundColor) style.highlight = node.style.backgroundColor.replace("#", "");
                if (node.style.fontSize) {
                    const size = parseInt(node.style.fontSize);
                    if (!isNaN(size)) style.size = size * 2; // Convert to half-points
                }
                if (node.style.fontFamily) style.font = node.style.fontFamily;
            }

            // Handle Quill classes
            if (node.classList) {
                if (node.classList.contains("ql-bold")) style.bold = true;
                if (node.classList.contains("ql-italic")) style.italics = true;
                if (node.classList.contains("ql-underline")) style.underline = true;
                if (node.classList.contains("ql-strike")) style.strike = true;
                if (node.classList.contains("ql-script-super")) style.superScript = true;
                if (node.classList.contains("ql-script-sub")) style.subScript = true;
            }

            // Handle HTML tags
            switch (node.tagName) {
                case "STRONG":
                case "B":
                    style.bold = true;
                    break;
                case "EM":
                case "I":
                    style.italics = true;
                    break;
                case "U":
                    style.underline = true;
                    break;
                case "S":
                case "DEL":
                    style.strike = true;
                    break;
                case "SUP":
                    style.superScript = true;
                    break;
                case "SUB":
                    style.subScript = true;
                    break;
            }

            // Process child nodes with accumulated style
            if (node.childNodes && node.childNodes.length > 0) {
                return Array.from(node.childNodes).map((child) => processTextNode(child, style));
            }

            return new TextRun({ ...style, text: node.textContent });
        };

        const processElement = (el) => {
            // Get alignment
            let alignment = AlignmentType.START;
            if (el.classList) {
                if (el.classList.contains("ql-align-center")) alignment = AlignmentType.CENTER;
                if (el.classList.contains("ql-align-right")) alignment = AlignmentType.RIGHT;
                if (el.classList.contains("ql-align-justify")) alignment = AlignmentType.JUSTIFIED;
            }

            // Get indentation
            let indent = { left: 0 };
            if (el.classList) {
                el.classList.forEach((cls) => {
                    if (cls.startsWith("ql-indent-")) {
                        const level = parseInt(cls.replace("ql-indent-", ""), 10) || 0;
                        indent.left = level * 720;
                    }
                });
            }

            // Handle different element types
            if (el.tagName?.match(/^H[1-6]$/)) {
                const level = parseInt(el.tagName[1]);
                return new Paragraph({
                    children: Array.from(el.childNodes)
                        .map((child) => processTextNode(child, { bold: true }))
                        .flat(),
                    heading: HeadingLevel[`HEADING_${level}`],
                    alignment,
                    indent,
                });
            }

            if (el.tagName === "BLOCKQUOTE") {
                return new Paragraph({
                    children: Array.from(el.childNodes)
                        .map((child) => processTextNode(child, { italics: true }))
                        .flat(),
                    alignment,
                    indent: { left: Math.max(indent.left + 720, 720) },
                });
            }

            if (el.tagName === "PRE") {
                return new Paragraph({
                    children: Array.from(el.childNodes)
                        .map((child) => processTextNode(child, { font: "Courier New" }))
                        .flat(),
                    alignment,
                    indent: { left: Math.max(indent.left + 720, 720) },
                });
            }

            if (el.tagName === "OL" || el.tagName === "UL") {
                return Array.from(el.childNodes)
                    .filter((node) => node.tagName === "LI")
                    .map(
                        (li) =>
                            new Paragraph({
                                children: Array.from(li.childNodes)
                                    .map((child) => processTextNode(child))
                                    .flat(),
                                numbering:
                                    el.tagName === "OL"
                                        ? {
                                              reference: "default-numbering",
                                              level: 0,
                                          }
                                        : undefined,
                                bullet: el.tagName === "UL" ? { level: 0 } : undefined,
                                alignment,
                                indent: el.tagName === "OL" ? { ...indent, hanging: 360 } : indent,
                            })
                    );
            }

            // Default paragraph handling
            return new Paragraph({
                children: Array.from(el.childNodes)
                    .map((child) => processTextNode(child))
                    .flat(),
                alignment,
                indent,
            });
        };

        // Process all elements
        elements.forEach((el) => {
            if (el.nodeType === 1) {
                // Element node
                const paragraphs = processElement(el);
                if (Array.isArray(paragraphs)) {
                    docParagraphs.push(...paragraphs);
                } else {
                    docParagraphs.push(paragraphs);
                }
            } else if (el.nodeType === 3 && el.textContent.trim()) {
                // Text node
                docParagraphs.push(
                    new Paragraph({
                        children: [processTextNode(el)],
                    })
                );
            }
        });

        // Create document with numbering
        const doc = new Document({
            numbering,
            sections: [
                {
                    properties: {},
                    children: docParagraphs,
                },
            ],
        });

        // Generate and save DOCX file
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "document.docx");
    };

    return (
        <DatabaseProvider>
            <div className={`flex-grow-1 d-flex ${className}`} style={{ ...style }} {...props}>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={value}
                        onChange={setValue}
                        modules={modules}
                        style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    />

                    <input type="file" id="docx-upload" accept=".docx" style={{ display: "none" }} onChange={handleFileUpload} />

                    <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} content={quillRef.current?.getEditor()?.root?.innerHTML || value} />
                    <LoadModal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} onLoad={handleLoad} />
                </div>
            </div>
            <style>{`
                .ql-toolbar.ql-snow {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    background: #212529;
                    border: 1px solid white;
                    border-bottom-color: white;
                }
                .ql-toolbar.ql-snow .ql-picker-label {
                    color: white;
                    border-color: white;
                }
                .ql-toolbar.ql-snow .ql-stroke {
                    stroke: white;
                }
                .ql-toolbar.ql-snow .ql-fill {
                    fill: white;
                }
                .ql-toolbar.ql-snow button:hover .ql-stroke,
                .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke {
                    stroke: #adb5bd;
                }
                .ql-toolbar.ql-snow button:hover .ql-fill,
                .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill {
                    fill: #adb5bd;
                }
                .ql-container.ql-snow {
                    border: 1px solid white;
                    flex: 1;
                    overflow: auto;
                }
                .ql-editor {
                    min-height: 100%;
                    background: #212529;
                    color: white;
                }
                .ql-picker-options {
                    background: #343a40 !important;
                    border: 1px solid white !important;
                    color: white !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                }
                .ql-picker-item {
                    color: white !important;
                }
                .ql-picker-item.ql-selected {
                    color: #adb5bd !important;
                    background-color: #495057 !important;
                }
                .ql-picker-options .ql-picker-item:hover {
                    color: #adb5bd !important;
                    background-color: #495057 !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label::before {
                    color: white !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label:hover::before {
                    color: #adb5bd !important;
                }
                .ql-toolbar.ql-snow .ql-picker {
                    color: white !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label {
                    color: white !important;
                }
                .ql-toolbar.ql-snow .ql-picker-label:hover {
                    color: #adb5bd !important;
                }
            `}</style>
        </DatabaseProvider>
    );
};

export default RichTextEditor;
