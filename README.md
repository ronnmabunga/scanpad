# ScanPad - OCR-Assisted Notepad

ScanPad is a web application that combines OCR (Optical Character Recognition) with a rich text editor. It also has document management and exporting features. It allows you to easily convert images containing text into editable content, making it perfect for digitizing documents, notes, or any text-containing images.

## Features

-   **OCR Text Recognition**: Convert text from images using advanced OCR technology
-   **Rich Text Editor**: Full-featured text editor with formatting options
-   **Multiple Input Methods**:
    -   Paste images directly from clipboard
    -   Drag and drop image files
    -   Upload images from your device
    -   Capture images using your device's camera
-   **Document Management**:
    -   Create, edit, and organize multiple documents
    -   Search through your documents
    -   Export documents in various formats (DOCX, PDF)
-   **Dark Theme**: Modern, eye-friendly dark interface
-   **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Deployment

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn package manager
-   Modern web browser with camera access (for OCR capture feature)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ronnmabunga/scanpad.git
cd scanpad
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Creating a New Document**:

    - Click "New" to start a fresh document
    - Or use the home page to begin editing immediately (non-mobile screen)

2. **Using OCR**:

    - Paste an image from your clipboard
    - Or drag and drop an image file
    - Or use the camera to capture text
    - The text will be automatically transcribed and inserted into the editor

3. **Managing Documents**:

    - Use the document viewer to see all your documents
    - Search through your documents using the search bar
    - Edit, delete, or create new documents as needed

4. **Exporting Documents**:
    - Use the File menu to export your documents
    - Available formats: DOCX, PDF

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Libraries

-   [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR capabilities
-   [React-Quill](https://github.com/zenoamaro/react-quill) for the rich text editor
-   [Bootstrap](https://getbootstrap.com/) for the UI components
-   [Dexie.js](https://dexie.org/) for IndexedDB wrapper

## Author

Ronn Mabunga

## Support

If you find this project helpful, please consider giving it a star ⭐️!
