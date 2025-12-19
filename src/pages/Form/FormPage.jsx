import React, { useRef } from 'react';
import { FormProvider } from '../../context/FormContext';
import Sidebar from './components/Sidebar.jsx';
import RegistrationForm from './components/RegistrationForm.jsx';

export default function FormPage() {
  const formRef = useRef(null);

  return (
    <FormProvider>
      <div className="app-container">
        <Sidebar formRef={formRef} />
        <main className="main-content">
          <RegistrationForm ref={formRef} />
        </main>
      </div>
    </FormProvider>
  );
}


