# Emek Spor - Project Structure

This document provides an overview of the project's organization and architecture.

## Architecture Pattern

This project follows a **feature-based architecture** where each page/feature is organized with its related components and styles in a single folder. This makes it easier to understand, maintain, and scale the application.

## Directory Structure

```
src/
├── pages/                          # All application pages (feature-based)
│   ├── Landing/                   # Landing page feature
│   │   ├── LandingPage.jsx       # Landing page component
│   │   ├── landing.css           # Landing page styles
│   │   └── README.md             # Landing page documentation
│   │
│   ├── Form/                      # Registration form feature
│   │   ├── FormPage.jsx          # Form page wrapper
│   │   ├── components/           # Form-specific components
│   │   │   ├── RegistrationForm.jsx  # Main A4 registration form
│   │   │   ├── Sidebar.jsx           # Form sidebar with settings
│   │   │   └── WebcamCapture.jsx     # Photo capture modal
│   │   ├── styles/               # Form-specific styles
│   │   │   ├── form.css          # Form container styles
│   │   │   ├── sidebar.css       # Sidebar styles
│   │   │   ├── webcam.css        # Webcam modal styles
│   │   │   ├── yakinlar.css      # Relatives section styles
│   │   │   └── datepicker.css    # Date picker styles
│   │   └── README.md             # Form page documentation
│   │
│   └── Dashboard/                 # Dashboard/Panel feature
│       ├── DashboardPage.jsx     # Main dashboard page
│       ├── GroupsPage.jsx        # Groups view page
│       ├── components/           # Dashboard-specific components
│       │   ├── DashboardNavbar.jsx    # Dashboard navigation
│       │   ├── StudentListPanel.jsx   # Students list panel
│       │   ├── StudentDetailsPanel.jsx # Student details panel
│       │   ├── GroupListPanel.jsx     # Groups list panel
│       │   └── GroupDetailsPanel.jsx  # Group details panel
│       ├── styles/               # Dashboard-specific styles
│       │   └── dashboard.css     # All dashboard styles
│       └── README.md             # Dashboard documentation
│
├── shared/                        # Shared resources across features
│   └── styles/                   # Global styles
│       ├── index.css            # Main stylesheet (imports all)
│       ├── base.css             # CSS variables, reset, typography
│       ├── layout.css           # App layout, container
│       ├── buttons.css          # Button styles
│       ├── tables.css           # Table styles
│       ├── sections.css         # Section styles
│       └── responsive.css       # Media queries, print styles
│
├── context/                       # React Context providers
│   └── FormContext.js            # Form state management
│
├── data/                          # Mock data for development
│   ├── mockStudents.js           # Student mock data
│   └── mockGroups.js             # Group mock data
│
├── services/                      # API and business logic
│   ├── api.js                    # API service layer
│   └── form.js                   # Form service (save, validate)
│
├── utils/                         # Utility functions
│   └── exportUtils.js            # PDF/DOCX export utilities
│
├── App.jsx                        # Main app component with routing
└── index.js                       # Application entry point

```

## Page Features

### 1. Landing Page (`/`)
- First page users see
- Video background with club branding
- Navigation to form or dashboard

### 2. Form Page (`/form`)
- Registration form for new athletes
- A4 format printable form
- Photo capture/upload
- Export to PDF/DOCX
- Customizable club information
- Add multiple contact persons

### 3. Dashboard Page (`/panel`)
- Student management
- Group management
- Future: Lessons, Payments, Attendance tracking

## Technology Stack

- **React** - UI library
- **React Router** - Client-side routing
- **React DatePicker** - Date selection
- **Context API** - State management
- **CSS3** - Styling
- **HTML2Canvas & JSPdf** - PDF export
- **DOCX** - Word document generation

## Key Design Decisions

### Feature-Based Organization
Each major feature (Landing, Form, Dashboard) has its own folder containing:
- Page component(s)
- Related sub-components
- Feature-specific styles
- Documentation (README.md)

**Benefits:**
- Easy to locate all code related to a feature
- Clear component ownership
- Simpler onboarding for new developers
- Better code organization for academic review

### Shared Resources
Global utilities, styles, and services are kept in dedicated folders:
- `shared/` - Shared styles and components
- `context/` - Global state management
- `services/` - API and business logic
- `utils/` - Helper functions
- `data/` - Mock data for testing

## Getting Started

1. **Navigate to a feature**: Start by exploring `src/pages/`
2. **Read the README**: Each page folder has a README explaining its purpose
3. **Check dependencies**: Look at imports to understand relationships
4. **Review shared code**: Check `shared/`, `context/`, and `services/` for reusable code

## Development Workflow

1. **Working on a feature**: Navigate to its page folder
2. **Adding a new feature**: Create a new folder in `pages/` with components and styles
3. **Shared functionality**: Add to appropriate folder (`services/`, `utils/`, etc.)
4. **Global styles**: Update files in `shared/styles/`

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Home/landing page |
| `/form` | FormPage | Registration form |
| `/panel` | DashboardPage | Management dashboard |

## Future Enhancements

- Dersler (Lessons) management
- Ödemeler (Payments) tracking
- Yoklamalar (Attendance) system
- Database integration
- Authentication system
- Backend API connection

---

**For detailed information about each feature, see the README.md file in each page folder.**
