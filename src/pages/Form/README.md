# Form Page

This folder contains the registration form page with all its components and styles.

## Files

- **FormPage.jsx** - Main form page component that provides the form context and layout

## Components

- **RegistrationForm.jsx** - The main A4 format registration form with all fields
  - Sporcu (Athlete) information section
  - Baba (Father) information section
  - Anne (Mother) information section
  - Yakınlar (Relatives) section for additional contacts
  - Principles and financial terms sections
  - Export to PDF/DOCX functionality
  
- **Sidebar.jsx** - Left sidebar with navigation and settings
  - Club logo upload
  - Club name, address, phone customization
  - Form title customization
  - Quick navigation to form sections
  
- **WebcamCapture.jsx** - Modal component for capturing athlete photos
  - Camera access
  - Photo capture functionality
  - Close without saving option

## Styles

- **form.css** - Main form container and A4 page styling
- **sidebar.css** - Sidebar navigation and settings styling
- **webcam.css** - Webcam modal styling
- **yakinlar.css** - Relatives/additional contacts section styling
- **datepicker.css** - React DatePicker custom styling

## Features

- A4 format registration form
- Real-time form editing
- Photo capture or upload
- Export to PDF/DOCX
- Add multiple relatives/contacts
- Customizable club information
- Date picker for birth dates
- Form data persistence

## Context

Uses `FormContext` from `src/context/FormContext.js` for state management

## Services & Utils

- Uses `FormService` from `src/services/form.js` for saving data
- Uses export utilities from `src/utils/exportUtils.js` for PDF/DOCX generation

## Route

- Path: `/form`
