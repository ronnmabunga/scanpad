import DOMPurify from "dompurify";

const DisplayHTMLContent = ({ content }) => {
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
};

export default DisplayHTMLContent;
