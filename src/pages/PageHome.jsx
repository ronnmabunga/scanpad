import OCRNotepad from "../components/OCRNotepad";
import { Navbar, Container } from "react-bootstrap";
import MetaTags from "../components/MetaTags";

function PageHome() {
    return (
        <>
            <MetaTags
                title="OCR-Assisted Notepad - Home"
                description="An OCR-assisted rich text editor that allows you to transcribe text from images and edit it in real-time. Simply paste an image to get started!"
                keywords="OCR, rich text editor, image to text, text transcription, document editor, text processing, assisted editing, OCR-assisted notepad, OCR transcription, OCR editor, OCR text editor, OCR text transcription, document editor, text editor, OCR-assisted"
                ogTitle="OCR Rich Text Editor - Convert Images to Text"
                ogDescription="Transform images into editable text with our OCR-powered rich text editor. Easy to use, instant transcription."
                ogImage="/icon.svg"
                ogUrl={window.location.href}
                twitterCard="summary_large_image"
                twitterTitle="OCR-Assisted Notepad - Convert Images to Text"
                twitterDescription="Transform images into editable text with our OCR-powered rich text editor. Easy to use, instant transcription."
                twitterImage="/icon.svg"
                canonicalUrl={window.location.href}
                author="R.Mabunga"
                language="English"
                themeColor="#000000"
                viewport="width=device-width, initial-scale=1.0"
                charset="utf-8"
                favicon="/icon.svg"
                appleTouchIcon="/icon.svg"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    name: "OCR-Assisted Notepad",
                    description: "An OCR-assisted rich text editor that allows you to transcribe text from images and edit it in real-time.",
                    applicationCategory: "Text Editor",
                    operatingSystem: "Web Browser",
                    offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "USD",
                    },
                }}
            />
            <div className="container-fluid bg-black text-white p-0" style={{ height: "100vh" }}>
                <div className="row m-0" style={{ height: "100%" }}>
                    <div className="col-12 col-sm-6 col-md-7 col-lg-5 col-xl-4 text-center m-0 d-flex flex-column justify-content-center bg-black text-white" style={{ height: "100%", minHeight: "90vh" }}>
                        <p className="font-body-2">OCR-Assisted Notepad</p>
                        <p className="font-body-4">Paste an image from the clipboard onto this window, after the app transcribes the image, paste again on the editor body to get the transcribed text.</p>
                    </div>
                    <div className="col-12 col-sm-6 col-md-5 col-lg-7 col-xl-8 bg-black text-white py-3" style={{ height: "100%" }}>
                        <OCRNotepad style={{ height: "100%" }} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default PageHome;
