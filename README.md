# EMEK SPOR KULÜBÜ - Kayıt ve Sözleşme Formu

A React.js web application for EMEK Sports Club registration and contract form management.

## Features

- 📝 **Interactive Registration Form** - Fill out athlete and parent information
- 📷 **Webcam Photo Capture** - Take athlete photos directly from the browser
- ⚙️ **Customizable Settings** - Edit club name, address, phone, logo, and form title via sidebar
- 📄 **PDF Export** - Download the form as a PDF in A4 format
- 📑 **DOCX Export** - Download the form as a Word document
- 💾 **Data Persistence** - Form settings are saved to localStorage (ready for database integration)

## Project Structure

```
src/
├── components/
│   ├── RegistrationForm.jsx  # Main registration form component
│   ├── Sidebar.jsx           # Settings sidebar component
│   └── WebcamCapture.jsx     # Webcam capture modal component
├── context/
│   └── FormContext.js        # React context for state management
├── services/
│   └── api.js                # API service layer (ready for DB connection)
├── styles/
│   └── index.css             # Global styles
├── utils/
│   └── exportUtils.js        # PDF and DOCX export utilities
├── App.jsx                   # Main application component
└── index.js                  # Application entry point
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Database Integration

The project is designed for easy database integration. The `src/services/api.js` file contains a service layer that currently uses localStorage for development. To connect to a real database:

1. Set up your backend API server
2. Update the `API_BASE_URL` in `src/services/api.js`
3. Uncomment the fetch calls in the service methods
4. Remove the localStorage fallback code

### Example API Endpoints

```javascript
// Forms
POST   /api/forms     - Create new form
GET    /api/forms     - Get all forms
GET    /api/forms/:id - Get form by ID
DELETE /api/forms/:id - Delete form

// Settings
GET    /api/settings  - Get form settings
PUT    /api/settings  - Update settings
```

## Technologies Used

- **React 18** - UI framework
- **react-webcam** - Webcam integration
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion for PDF
- **docx** - Word document generation
- **file-saver** - File download utility

## Usage

### Editing Form Settings

Use the sidebar on the left to:
- Change club name
- Update address and phone
- Upload a custom logo
- Modify form title

### Taking Photos

Click the camera icon in the top-right corner of the form to:
1. Open the webcam modal
2. Position the athlete
3. Click "Fotoğraf Çek" to capture
4. The photo will appear in the form

### Exporting

Use the export buttons at the bottom of the sidebar:
- **PDF Olarak İndir** - Download as PDF
- **DOCX Olarak İndir** - Download as Word document

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for your sports club!
