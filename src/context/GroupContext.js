import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import * as GroupService from '../services/groupService';

// Initial state
const initialState = {
  groups: [],
  selectedGroup: null,
  loading: false,
  error: null,
  students: {} // groupId -> students mapping
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_GROUPS: 'SET_GROUPS',
  ADD_GROUP: 'ADD_GROUP',
  UPDATE_GROUP: 'UPDATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  SELECT_GROUP: 'SELECT_GROUP',
  SET_GROUP_STUDENTS: 'SET_GROUP_STUDENTS',
  ADD_STUDENT_TO_GROUP: 'ADD_STUDENT_TO_GROUP',
  REMOVE_STUDENT_FROM_GROUP: 'REMOVE_STUDENT_FROM_GROUP'
};

// Reducer
function groupReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.SET_GROUPS:
      return { ...state, groups: action.payload, loading: false, error: null };

    case ACTIONS.ADD_GROUP:
      return {
        ...state,
        groups: [...state.groups, action.payload],
        loading: false,
        error: null
      };

    case ACTIONS.UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? action.payload : group
        ),
        selectedGroup: state.selectedGroup?.id === action.payload.id
          ? action.payload
          : state.selectedGroup,
        loading: false,
        error: null
      };

    case ACTIONS.DELETE_GROUP:
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
        selectedGroup: state.selectedGroup?.id === action.payload
          ? null
          : state.selectedGroup,
        loading: false,
        error: null
      };

    case ACTIONS.SELECT_GROUP:
      return {
        ...state,
        selectedGroup: action.payload
      };

    case ACTIONS.SET_GROUP_STUDENTS:
      return {
        ...state,
        students: {
          ...state.students,
          [action.payload.groupId]: action.payload.students
        }
      };

    case ACTIONS.ADD_STUDENT_TO_GROUP:
      return {
        ...state,
        students: {
          ...state.students,
          [action.payload.groupId]: [
            ...(state.students[action.payload.groupId] || []),
            action.payload.student
          ]
        }
      };

    case ACTIONS.REMOVE_STUDENT_FROM_GROUP:
      return {
        ...state,
        students: {
          ...state.students,
          [action.payload.groupId]: (state.students[action.payload.groupId] || [])
            .filter(student => student.id !== action.payload.studentId)
        }
      };

    default:
      return state;
  }
}

// Context
const GroupContext = createContext(null);

// Provider component
export function GroupProvider({ children }) {
  const [state, dispatch] = useReducer(groupReducer, initialState);

  // Load groups from backend
  const loadGroups = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const groups = await GroupService.getGroups();
      dispatch({ type: ACTIONS.SET_GROUPS, payload: groups });
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Gruplar yüklenirken bir hata oluştu'
      });
    }
  }, []);

  // Create new group
  const createGroup = useCallback(async (groupData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const newGroup = await GroupService.createGroup(groupData);
      dispatch({ type: ACTIONS.ADD_GROUP, payload: newGroup });
      return newGroup;
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Grup oluşturulurken bir hata oluştu'
      });
      throw error;
    }
  }, []);

  // Update group
  const updateGroup = useCallback(async (groupId, groupData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const updatedGroup = await GroupService.updateGroup(groupId, groupData);
      dispatch({ type: ACTIONS.UPDATE_GROUP, payload: updatedGroup });
      return updatedGroup;
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Grup güncellenirken bir hata oluştu'
      });
      throw error;
    }
  }, []);

  // Delete group
  const deleteGroup = useCallback(async (groupId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await GroupService.deleteGroup(groupId);
      dispatch({ type: ACTIONS.DELETE_GROUP, payload: groupId });
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Grup silinirken bir hata oluştu'
      });
      throw error;
    }
  }, []);

  // Load students for a group
  const loadGroupStudents = useCallback(async (groupId) => {
    try {
      const students = await GroupService.getGroupStudents(groupId);
      dispatch({
        type: ACTIONS.SET_GROUP_STUDENTS,
        payload: { groupId, students }
      });
    } catch (error) {
      console.error('Öğrenci listesi yüklenirken hata:', error);
      // Hata durumunda boş liste set et
      dispatch({
        type: ACTIONS.SET_GROUP_STUDENTS,
        payload: { groupId, students: [] }
      });
    }
  }, []);

  // Select group
  const selectGroup = useCallback((group) => {
    dispatch({ type: ACTIONS.SELECT_GROUP, payload: group });
    // Load students for selected group
    if (group?.id) {
      loadGroupStudents(group.id);
    }
  }, [loadGroupStudents]);

  // Assign student to group
  const assignStudentToGroup = useCallback(async (groupId, studentId) => {
    try {
      await GroupService.assignStudentToGroup(groupId, studentId);
      // Reload students for the group
      await loadGroupStudents(groupId);
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Öğrenci atanırken bir hata oluştu'
      });
      throw error;
    }
  }, [loadGroupStudents]);

  // Remove student from group
  const removeStudentFromGroup = useCallback(async (groupId, studentId) => {
    try {
      await GroupService.removeStudentFromGroup(groupId, studentId);
      dispatch({
        type: ACTIONS.REMOVE_STUDENT_FROM_GROUP,
        payload: { groupId, studentId }
      });
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.message || 'Öğrenci çıkarılırken bir hata oluştu'
      });
      throw error;
    }
  }, []);

  // Actions object - memoized to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    selectGroup,
    loadGroupStudents,
    assignStudentToGroup,
    removeStudentFromGroup
  }), [loadGroups, createGroup, updateGroup, deleteGroup, selectGroup, loadGroupStudents, assignStudentToGroup, removeStudentFromGroup]);

  return (
    <GroupContext.Provider value={{ state, actions }}>
      {children}
    </GroupContext.Provider>
  );
}

// Hook for using context
export function useGroups() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}

