import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from '../../context/FormContext';
import Sidebar from './components/Sidebar.jsx';
import RegistrationForm from './components/RegistrationForm.jsx';

export default function FormPage() {
  const formRef = useRef(null);
  const navigate = useNavigate();

  return (
    <FormProvider>
      <div className="app-container">
        <Sidebar formRef={formRef} />
        <main className="main-content">
          <div className="form-page-header">
            <button 
              className="form-page-back-button"
              onClick={() => navigate('/panel')}
            >
              Panele Dön
            </button>
          </div>
          <RegistrationForm ref={formRef} />
        </main>
      </div>
    </FormProvider>
  );
}


