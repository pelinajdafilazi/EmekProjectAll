import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage.jsx';
import FormPage from './pages/Form/FormPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import { GroupProvider } from './context/GroupContext';

function App() {
  return (
    <GroupProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/panel" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GroupProvider>
  );
}

export default App;
