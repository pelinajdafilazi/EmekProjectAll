import React, { useState, useEffect } from 'react';
import DashboardNavbar from './components/DashboardNavbar';
import StudentListPanel from './components/StudentListPanel';
import StudentDetailsPanel from './components/StudentDetailsPanel';
import GroupListPanel from './components/GroupListPanel';
import GroupDetailsPanel from './components/GroupDetailsPanel';
import AddGroupModal from './components/AddGroupModal';
import LessonListPanel from './components/LessonListPanel';
import LessonDetailsPanel from './components/LessonDetailsPanel';
import PaymentListPanel from './components/PaymentListPanel';
import PaymentDetailsPanel from './components/PaymentDetailsPanel';
import AttendanceListPanel from './components/AttendanceListPanel';
import AttendanceDetailsPanel from './components/AttendanceDetailsPanel';
import { mockLessons, mockLessonDetails, mockLessonStudents } from '../../data/mockLessons';
import { mockPaymentStudents, mockPaymentDetails } from '../../data/mockPayments';
import { mockAttendanceLessonsByGroup, mockAttendanceStudentsByGroup } from '../../data/mockAttendance';
import { mockGroups } from '../../data/mockGroups';
import { useGroups } from '../../context/GroupContext';
import { StudentService } from '../../services/studentService';

export default function DashboardPage() {
  const { state: groupState, actions: groupActions } = useGroups();
  const [activeView, setActiveView] = useState('Öğrenciler');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('1');
  const [selectedPaymentStudentId, setSelectedPaymentStudentId] = useState('1');
  const [selectedAttendanceGroupId, setSelectedAttendanceGroupId] = useState('1');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  
  // Students state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  // Load students from backend
  const loadStudents = async () => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const backendStudents = await StudentService.getAllStudents();
      setStudents(backendStudents);
      // İlk öğrenciyi otomatik seç
      if (backendStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(backendStudents[0].id);
      }
    } catch (error) {
      console.error('Öğrenciler yüklenirken hata:', error);
      setStudentsError(error.message || 'Öğrenciler yüklenirken bir hata oluştu');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Load students when Öğrenciler view is active
  useEffect(() => {
    if (activeView === 'Öğrenciler') {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  // Listen for storage event to reload when form is submitted (from another tab/window)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'student_created' && activeView === 'Öğrenciler') {
        loadStudents();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeView]);

  // Check for student creation in same tab (using a custom event or polling)
  useEffect(() => {
    if (activeView === 'Öğrenciler') {
      // Listen for focus event to reload when returning to tab
      const handleFocus = () => {
        loadStudents();
      };
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [activeView]);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;
  const selectedGroup = groupState.groups.find(g => g.id === selectedGroupId);
  const groupStudents = selectedGroupId ? (groupState.students[selectedGroupId] || []) : [];
  const selectedLesson = mockLessonDetails[selectedLessonId] || null;
  const lessonStudents = mockLessonStudents[selectedLessonId] || [];
  const selectedPaymentStudent = mockPaymentDetails[selectedPaymentStudentId] || null;
  
  // Attendance data based on selected group
  const selectedAttendanceGroup = mockGroups.find(g => g.id === selectedAttendanceGroupId);
  const selectedAttendanceLesson = mockAttendanceLessonsByGroup[selectedAttendanceGroupId] || null;
  const attendanceStudents = mockAttendanceStudentsByGroup[selectedAttendanceGroupId] || [];

  // Load groups when Gruplar view is active (only once per view switch)
  useEffect(() => {
    if (activeView === 'Gruplar' && !groupsLoaded) {
      groupActions.loadGroups();
      setGroupsLoaded(true);
    } else if (activeView !== 'Gruplar') {
      setGroupsLoaded(false);
    }
  }, [activeView, groupsLoaded, groupActions]);

  // Set first group as selected when groups are loaded
  useEffect(() => {
    if (activeView === 'Gruplar' && groupState.groups.length > 0 && !selectedGroupId) {
      const firstGroup = groupState.groups[0];
      setSelectedGroupId(firstGroup.id);
      groupActions.selectGroup(firstGroup);
    }
  }, [activeView, groupState.groups, selectedGroupId, groupActions]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    const group = groupState.groups.find(g => g.id === groupId);
    if (group) {
      groupActions.selectGroup(group);
    }
  };

  const handleNavigate = (item) => {
    setActiveView(item);
  };

  return (
    <div className="dash">
      <DashboardNavbar activeItem={activeView} onNavigate={handleNavigate} />
      <div className="dash__body">
        {activeView === 'Öğrenciler' && (
          <>
            <StudentListPanel
              students={students}
              selectedId={selectedStudentId}
              onSelect={setSelectedStudentId}
              loading={studentsLoading}
            />
            <StudentDetailsPanel student={selectedStudent} />
          </>
        )}
        {activeView === 'Gruplar' && (
          <>
            <GroupListPanel
              groups={groupState.groups}
              selectedId={selectedGroupId}
              onSelect={handleSelectGroup}
              onAddClick={() => setIsAddGroupModalOpen(true)}
              loading={groupState.loading}
            />
            <GroupDetailsPanel
              group={selectedGroup}
              students={groupStudents}
            />
            <AddGroupModal
              isOpen={isAddGroupModalOpen}
              onClose={() => setIsAddGroupModalOpen(false)}
            />
          </>
        )}
        {activeView === 'Dersler' && (
          <>
            <LessonListPanel
              lessons={mockLessons}
              selectedId={selectedLessonId}
              onSelect={setSelectedLessonId}
            />
            <LessonDetailsPanel
              lesson={selectedLesson}
              students={lessonStudents}
            />
          </>
        )}
        {activeView === 'Ödemeler' && (
          <>
            <PaymentListPanel
              students={mockPaymentStudents}
              selectedId={selectedPaymentStudentId}
              onSelect={setSelectedPaymentStudentId}
            />
            <PaymentDetailsPanel student={selectedPaymentStudent} />
          </>
        )}
        {activeView === 'Yoklamalar' && (
          <>
            <AttendanceListPanel
              groups={mockGroups}
              selectedId={selectedAttendanceGroupId}
              onSelect={setSelectedAttendanceGroupId}
            />
            <AttendanceDetailsPanel
              group={selectedAttendanceGroup}
              lesson={selectedAttendanceLesson}
              students={attendanceStudents}
            />
          </>
        )}
      </div>
      <footer className="dash-footer">
        © 2023 YOUREYE Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}