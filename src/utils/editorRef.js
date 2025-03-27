// Global reference to the Quill editor instance
let quillEditorInstance = null;

export const setQuillEditor = (editor) => {
    // console.log("Setting Quill editor instance:", !!editor);
    quillEditorInstance = editor;
};

export const getQuillEditor = () => {
    // console.log("Getting Quill editor instance:", !!quillEditorInstance);
    return quillEditorInstance;
};
