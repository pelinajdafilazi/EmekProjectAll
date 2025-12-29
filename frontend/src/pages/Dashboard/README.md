# Dashboard Page

This folder contains the dashboard/panel pages with all related components and styles.

## Pages

- **DashboardPage.jsx** - Main dashboard with students and groups views
- **GroupsPage.jsx** - Groups-focused view (alternative dashboard view)

## Components

- **DashboardNavbar.jsx** - Top navigation bar for dashboard
  - Navigation items: Öğrenciler (Students), Gruplar (Groups), Dersler (Lessons), Ödemeler (Payments), Yoklamalar (Attendance)
  - Active item highlighting
  
- **StudentListPanel.jsx** - List panel showing all students
  - Student cards with basic info
  - Selection functionality
  - Search/filter capability
  
- **StudentDetailsPanel.jsx** - Detailed view of selected student
  - Student profile information
  - Contact details
  - Academic information
  - Export options
  
- **GroupListPanel.jsx** - List panel showing all groups
  - Group cards with basic info
  - Member count
  - Selection functionality
  
- **GroupDetailsPanel.jsx** - Detailed view of selected group
  - Group information
  - Student members list
  - Group statistics

## Styles

- **dashboard.css** - All dashboard-related styling
  - Dashboard layout
  - Navigation styling
  - Panel styling
  - Card components
  - Detail views

## Features

- Student management view
- Group management view
- Quick navigation between sections
- Detailed information panels
- Mock data for demonstration

## Data Sources

Uses mock data from:
- `src/data/mockStudents.js` - Student data
- `src/data/mockGroups.js` - Group data

## Routes

- Main dashboard: `/panel`
- Path parameter support for different views

## Future Sections

- Dersler (Lessons) - Coming soon
- Ödemeler (Payments) - Coming soon
- Yoklamalar (Attendance) - Coming soon
