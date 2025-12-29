# Emek Spor - 

Welcome! This guide will help you quickly understand and review the project structure.

## Quick Start

### 1. Start with the Project Overview
👉 **Read first**: `src/PROJECT_STRUCTURE.md`

This file provides a complete overview of the project architecture, technology stack, and design decisions.

### 2. Understanding the Application

The application has **3 main features**:

#### 🏠 Landing Page
**Location**: `src/pages/Landing/`
- Entry point of the application
- Simple video background with navigation buttons
- **Files**: 1 component + 1 CSS file + README

#### 📝 Registration Form
**Location**: `src/pages/Form/`
- The most complex feature
- A4 format registration form with photo capture
- **Files**: 1 page + 3 components + 5 CSS files + README

#### 📊 Dashboard
**Location**: `src/pages/Dashboard/`
- Student and group management interface
- **Files**: 2 pages + 5 components + 1 CSS file + README

### 3. Review Flow

**For a complete review, follow this order:**

```
1. src/PROJECT_STRUCTURE.md         ← Overall architecture
2. src/pages/Landing/README.md      ← Landing page details
3. src/pages/Form/README.md         ← Form feature details  
4. src/pages/Dashboard/README.md    ← Dashboard feature details
```

## Feature-Based Organization

Each page is self-contained with:
- ✅ Main page component
- ✅ Related sub-components (in `components/` subfolder)
- ✅ Feature-specific styles (in `styles/` subfolder)
- ✅ Documentation (README.md)

**Benefits**:
- Easy to find all related code
- Clear feature boundaries
- Simple to understand relationships
- Good for team collaboration

## Project Structure at a Glance

```
src/
├── pages/                    # 👈 START HERE - All features
│   ├── Landing/             # Landing page feature
│   ├── Form/                # Registration form feature
│   └── Dashboard/           # Dashboard feature
│
├── shared/                  # Global styles used everywhere
├── context/                 # React state management
├── services/                # Business logic & API
├── utils/                   # Helper functions
└── data/                    # Mock data for testing
```

## Key Files to Review

### Core Application Files
- **src/App.jsx** - Main app with routing
- **src/index.js** - Application entry point
- **src/shared/styles/index.css** - Central stylesheet that imports all CSS

### Landing Page
- **src/pages/Landing/LandingPage.jsx** - Landing page component

### Form Feature
- **src/pages/Form/FormPage.jsx** - Form page wrapper
- **src/pages/Form/components/RegistrationForm.jsx** - Main form (largest file ~680 lines)
- **src/pages/Form/components/Sidebar.jsx** - Form sidebar/settings
- **src/pages/Form/components/WebcamCapture.jsx** - Photo capture

### Dashboard Feature
- **src/pages/Dashboard/DashboardPage.jsx** - Main dashboard
- **src/pages/Dashboard/components/DashboardNavbar.jsx** - Navigation
- **src/pages/Dashboard/components/StudentListPanel.jsx** - Student list
- **src/pages/Dashboard/components/StudentDetailsPanel.jsx** - Student details
- **src/pages/Dashboard/components/GroupListPanel.jsx** - Group list
- **src/pages/Dashboard/components/GroupDetailsPanel.jsx** - Group details

## Understanding Component Relationships

### Landing Page (Independent)
```
LandingPage.jsx
└── No sub-components
```

### Form Page (Complex)
```
FormPage.jsx
├── Sidebar.jsx
└── RegistrationForm.jsx
    └── WebcamCapture.jsx
```

### Dashboard Page (Modular)
```
DashboardPage.jsx
├── DashboardNavbar.jsx
├── StudentListPanel.jsx
├── StudentDetailsPanel.jsx
├── GroupListPanel.jsx
└── GroupDetailsPanel.jsx
```

## Code Quality Highlights

✅ **Clean Architecture**: Feature-based organization  
✅ **No Linter Errors**: All code passes linting  
✅ **Documented**: Each feature has detailed README  
✅ **Modern React**: Uses Hooks, Context API, functional components  
✅ **Responsive Design**: Mobile-friendly layouts  
✅ **Export Features**: PDF and DOCX generation  

## Technology Stack

- **React 18** - Modern UI library
- **React Router v6** - Routing
- **React Context API** - State management
- **React DatePicker** - Date inputs
- **HTML2Canvas + jsPDF** - PDF export
- **DOCX.js** - Word document generation
- **CSS3** - Modern styling with CSS variables

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

Application runs on: http://localhost:3000

## Routes

| URL | Feature | Description |
|-----|---------|-------------|
| `/` | Landing | Home page with navigation |
| `/form` | Form | Registration form |
| `/panel` | Dashboard | Student/group management |

## State Management

- **FormContext** (`src/context/FormContext.js`)
  - Manages form data state
  - Provides form actions (update, save, etc.)
  - Used by Form feature components

## Services & Utilities

- **services/api.js** - API integration layer
- **services/form.js** - Form save/validate logic
- **utils/exportUtils.js** - PDF/DOCX export helpers

## Mock Data

For demonstration purposes:
- **data/mockStudents.js** - Student data
- **data/mockGroups.js** - Group data

## Review Checklist

- [ ] Read PROJECT_STRUCTURE.md
- [ ] Review Landing page (simplest feature)
- [ ] Review Form page (most complex feature)
- [ ] Review Dashboard page (data-driven feature)
- [ ] Check component organization
- [ ] Verify import paths
- [ ] Review styling approach
- [ ] Understand state management

## Questions to Consider

1. **Architecture**: Is the feature-based organization clear?
2. **Code Quality**: Are components well-structured?
3. **Maintainability**: Is it easy to add new features?
4. **Documentation**: Are READMEs helpful?
5. **Scalability**: Can this structure grow?

## Contact

For questions about the implementation:
- Check the README.md in each feature folder
- Review the PROJECT_STRUCTURE.md
- Each component has inline comments

---

**Recommendation**: Start by reading the PROJECT_STRUCTURE.md, then explore one feature folder at a time, beginning with Landing (simplest) and ending with Form (most complex).
