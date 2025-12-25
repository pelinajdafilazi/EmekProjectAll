# Image Service - Profile Image Upload

## Overview
This service handles student profile image operations with the backend API, supporting base64 image format for storing images in JSON.

## API Endpoints

### GET Profile Image
```
GET /api/StudentPersonalInfo/{id}/profile-image
```
Returns the student's profile image as base64 JSON.

**Response:**
```json
{
  "profileImageBase64": "data:image/jpeg;base64,..."
}
```

### PUT Profile Image
```
PUT /api/StudentPersonalInfo/{id}/profile-image
```
Upload or update a student's profile image.

**Request Body:**
```json
{
  "profileImageBase64": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "message": "Profil resmi başarıyla güncellendi"
}
```

## Features Implemented

### 1. **react-dropzone Integration**
- Drag and drop images directly onto the photo area
- Visual feedback when dragging files over the drop zone
- File type validation (only images)
- File size validation (max 5MB)

### 2. **Multiple Upload Methods**
- **Drag & Drop**: Drag image files onto the photo area
- **Gallery Upload**: Click "Galeriden Seç" to choose from device
- **Webcam Capture**: Click "Fotoğraf Çek" to take a photo

### 3. **Auto-load Existing Images**
- On form mount, automatically loads existing profile image if available
- Uses TC Kimlik No as the student ID

### 4. **Auto-save on Form Submit**
- When saving the form, automatically uploads the profile image
- Image is stored as base64 in the database
- Graceful error handling (form saves even if image upload fails)

### 5. **Image Validation**
- File type check (must be image/*)
- File size limit (5MB max)
- Base64 format validation

## Usage in Code

### Import the Service
```javascript
import { ImageService } from '../../../services/imageService';
```

### Get Profile Image
```javascript
const image = await ImageService.getProfileImage(studentId);
if (image) {
  setPhoto(image); // image is base64 string
}
```

### Upload Profile Image
```javascript
const result = await ImageService.uploadProfileImage(studentId, base64Image);
console.log(result.message); // "Profil resmi başarıyla güncellendi"
```

### Convert File to Base64
```javascript
const base64 = await ImageService.fileToBase64(file);
// base64 = "data:image/jpeg;base64,..."
```

## How It Works

### Flow Diagram
```
1. User uploads image (drag/drop, gallery, or webcam)
   ↓
2. Image converted to base64 (data:image/...;base64,...)
   ↓
3. Image stored in React Context (temporary)
   ↓
4. User fills form and clicks "Verileri Kaydet"
   ↓
5. Form data saved to backend (FormService)
   ↓
6. Profile image uploaded to backend (ImageService)
   ↓
7. Success message shown to user
```

### On Form Load
```
1. Component mounts
   ↓
2. useEffect checks for TC Kimlik No
   ↓
3. If TC exists (11 digits), fetch existing image
   ↓
4. If image found, display in photo area
```

## Error Handling

- **No Image Found (404)**: Silently handled, no error shown
- **Invalid File Type**: Alert shown to user
- **File Too Large**: Alert shown to user
- **Upload Failure**: Form still saves, but image upload error is shown
- **Network Error**: Caught and displayed to user

## File Size Limits

- Maximum file size: 5MB
- Supported formats: JPEG, JPG, PNG, GIF, WebP

## Base64 Format

All images are stored as base64 data URIs:
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
```

This allows storing images directly in JSON without needing separate file storage.

## Dependencies

- `react-dropzone`: For drag-and-drop functionality
- `axios`: For API requests
- `FileReader API`: For converting files to base64

## Testing

To test the image upload:

1. Open the form page
2. Try dragging an image onto the photo area
3. Or click the photo area and select "Galeriden Seç"
4. Fill in the TC Kimlik No (required for save)
5. Click "Verileri Kaydet"
6. Check backend logs to verify image was saved

## Backend Requirements

The backend must:
- Accept base64 images in JSON format
- Store images in a column that supports large text/BLOB
- Return images in the same base64 format

## Security Notes

- File size is limited to prevent DoS attacks
- Only image MIME types are accepted
- Base64 encoding increases size by ~33% (account for this in DB)

