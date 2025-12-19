import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SettingsService } from '../services/form';

// Initial state for form data
const initialFormData = {
  // Sporcu (Athlete) Information
  sporcu: {
    bransi: '',
    tcKimlikNo: '',
    adiSoyadi: '',
    dogumTarihi: '',
    okulu: '',
    sinifNo: '',
    sporcuCep: '',
    evAdresi: ''
  },
  // Baba (Father) Information
  baba: {
    tcKimlikNo: '',
    adiSoyadi: '',
    meslegi: '',
    cepTel: ''
  },
  // Anne (Mother) Information
  anne: {
    tcKimlikNo: '',
    adiSoyadi: '',
    meslegi: '',
    cepTel: ''
  },
  // Yakınlar (Relatives) - Additional contacts
  yakinlar: [],
  // Photo
  photo: null,
  // Metadata
  createdAt: null,
  updatedAt: null
};

// Initial settings
const initialSettings = {
  clubName: 'EMEK SPOR KULÜBÜ',
  address: 'Yücetepe, 88. Cd. No:7 Çankaya/ANKARA',
  phone: '0 551 525 37 00',
  logo: null,
  formTitle: 'KAYIT VE SÖZLEŞME FORMU'
};

// Action types
const ACTIONS = {
  SET_FORM_DATA: 'SET_FORM_DATA',
  UPDATE_SPORCU: 'UPDATE_SPORCU',
  UPDATE_BABA: 'UPDATE_BABA',
  UPDATE_ANNE: 'UPDATE_ANNE',
  ADD_YAKIN: 'ADD_YAKIN',
  UPDATE_YAKIN: 'UPDATE_YAKIN',
  REMOVE_YAKIN: 'REMOVE_YAKIN',
  SET_PHOTO: 'SET_PHOTO',
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_FORM: 'RESET_FORM'
};

// Reducer
function formReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FORM_DATA:
      return { ...state, formData: action.payload };
    
    case ACTIONS.UPDATE_SPORCU:
      return {
        ...state,
        formData: {
          ...state.formData,
          sporcu: { ...state.formData.sporcu, ...action.payload }
        }
      };
    
    case ACTIONS.UPDATE_BABA:
      return {
        ...state,
        formData: {
          ...state.formData,
          baba: { ...state.formData.baba, ...action.payload }
        }
      };
    
    case ACTIONS.UPDATE_ANNE:
      return {
        ...state,
        formData: {
          ...state.formData,
          anne: { ...state.formData.anne, ...action.payload }
        }
      };
    
    case ACTIONS.ADD_YAKIN:
      return {
        ...state,
        formData: {
          ...state.formData,
          yakinlar: [...state.formData.yakinlar, action.payload]
        }
      };
    
    case ACTIONS.UPDATE_YAKIN:
      return {
        ...state,
        formData: {
          ...state.formData,
          yakinlar: state.formData.yakinlar.map((yakin, index) =>
            index === action.payload.index
              ? { ...yakin, ...action.payload.data }
              : yakin
          )
        }
      };
    
    case ACTIONS.REMOVE_YAKIN:
      return {
        ...state,
        formData: {
          ...state.formData,
          yakinlar: state.formData.yakinlar.filter((_, index) => index !== action.payload)
        }
      };
    
    case ACTIONS.SET_PHOTO:
      return {
        ...state,
        formData: { ...state.formData, photo: action.payload }
      };
    
    case ACTIONS.SET_SETTINGS:
      return { ...state, settings: action.payload };
    
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case ACTIONS.RESET_FORM:
      return { ...state, formData: initialFormData };
    
    default:
      return state;
  }
}

// Context
const FormContext = createContext(null);

// Provider component
export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, {
    formData: initialFormData,
    settings: initialSettings
  });

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await SettingsService.getSettings();
        dispatch({ type: ACTIONS.SET_SETTINGS, payload: settings });
      } catch (error) {
        // Settings load failed, using defaults
      }
    }
    loadSettings();
  }, []);

  // Actions
  const actions = {
    updateSporcu: (data) => dispatch({ type: ACTIONS.UPDATE_SPORCU, payload: data }),
    updateBaba: (data) => dispatch({ type: ACTIONS.UPDATE_BABA, payload: data }),
    updateAnne: (data) => dispatch({ type: ACTIONS.UPDATE_ANNE, payload: data }),
    addYakin: () => dispatch({ 
      type: ACTIONS.ADD_YAKIN, 
      payload: { yakinlikDerecesi: '', tcKimlikNo: '', adiSoyadi: '', meslegi: '', cepTel: '' } 
    }),
    updateYakin: (index, data) => dispatch({ type: ACTIONS.UPDATE_YAKIN, payload: { index, data } }),
    removeYakin: (index) => dispatch({ type: ACTIONS.REMOVE_YAKIN, payload: index }),
    setPhoto: (photo) => dispatch({ type: ACTIONS.SET_PHOTO, payload: photo }),
    updateSettings: async (settings) => {
      dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
      await SettingsService.saveSettings({ ...state.settings, ...settings });
    },
    setSettings: (settings) => dispatch({ type: ACTIONS.SET_SETTINGS, payload: settings }),
    resetForm: () => dispatch({ type: ACTIONS.RESET_FORM }),
    setFormData: (data) => dispatch({ type: ACTIONS.SET_FORM_DATA, payload: data })
  };

  return (
    <FormContext.Provider value={{ state, actions }}>
      {children}
    </FormContext.Provider>
  );
}

// Hook for using context
export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}
