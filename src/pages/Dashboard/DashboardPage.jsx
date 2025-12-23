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
import { mockAttendanceLessons, mockAttendanceDetails, mockAttendanceStudents } from '../../data/mockAttendance';
import { useGroups } from '../../context/GroupContext';
import { StudentService } from '../../services/studentService';

export default function DashboardPage() {
  const { state: groupState, actions: groupActions } = useGroups();
  const [activeView, setActiveView] = useState('Öğrenciler');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('1');
  const [selectedPaymentStudentId, setSelectedPaymentStudentId] = useState('1');
  const [selectedAttendanceLessonId, setSelectedAttendanceLessonId] = useState('1');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  
  // Students state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

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

  // Listen for student creation events (both same-tab custom event and cross-tab storage event)
  useEffect(() => {
    if (activeView === 'Öğrenciler') {
      // Custom event for same-tab communication
      const handleStudentCreated = () => {
        loadStudents();
      };
      
      // Storage event for cross-tab communication
      const handleStorageChange = (e) => {
        if (e.key === 'student_created') {
          loadStudents();
        }
      };
      
      window.addEventListener('studentCreated', handleStudentCreated);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('studentCreated', handleStudentCreated);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [activeView]);

  // Load selected student details from backend (with parents and relatives)
  useEffect(() => {
    if (activeView === 'Öğrenciler' && selectedStudentId) {
      setStudentDetailsLoading(true);
      
      // Öğrenci bilgilerini ve yakınlarını paralel olarak çek
      Promise.all([
        StudentService.getStudentById(selectedStudentId),
        StudentService.getStudentRelatives(selectedStudentId).catch(() => []) // Hata durumunda boş array döndür
      ])
        .then(([student, relatives]) => {
          // Yakınları student objesine ekle (array olarak)
          if (student) {
            student.relatives = transformRelatives(relatives);
          }
          setSelectedStudentDetails(student);
        })
        .catch(error => {
          console.error('Öğrenci detayları yüklenirken hata:', error);
          // Hata durumunda listeden bulunan öğrenciyi kullan
          const studentFromList = students.find(s => s.id === selectedStudentId);
          setSelectedStudentDetails(studentFromList || null);
        })
        .finally(() => {
          setStudentDetailsLoading(false);
        });
    } else {
      setSelectedStudentDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, selectedStudentId]);

  // Yakınları frontend formatına dönüştür
  const transformRelatives = (relatives) => {
    if (!relatives || relatives.length === 0) {
      return [];
    }

    // Tüm yakınları dönüştür
    return relatives.map(relative => ({
      relationType: relative.relationType || '-',
      name: `${relative.firstName || ''} ${relative.lastName || ''}`.trim() || '-',
      tc: relative.nationalId || '-',
      phone: relative.phoneNumber || '-',
      occupation: relative.occupation || '-'
    }));
  };

  const selectedStudent = selectedStudentDetails || students.find(s => s.id === selectedStudentId) || null;
  const selectedGroup = groupState.groups.find(g => g.id === selectedGroupId);
  const groupStudents = selectedGroupId ? (groupState.students[selectedGroupId] || []) : [];
  const selectedLesson = mockLessonDetails[selectedLessonId] || null;
  const lessonStudents = mockLessonStudents[selectedLessonId] || [];
  const selectedPaymentStudent = mockPaymentDetails[selectedPaymentStudentId] || null;
  const selectedAttendanceLesson = mockAttendanceDetails[selectedAttendanceLessonId] || null;
  const attendanceStudents = mockAttendanceStudents[selectedAttendanceLessonId] || [];

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

  // Update selectedGroupId when selected group is deleted
  useEffect(() => {
    if (activeView === 'Gruplar' && selectedGroupId) {
      const groupExists = groupState.groups.find(g => g.id === selectedGroupId);
      if (!groupExists) {
        // Silinen grup seçili grup ise, ilk grubu seç veya null yap
        if (groupState.groups.length > 0) {
          const firstGroup = groupState.groups[0];
          setSelectedGroupId(firstGroup.id);
          groupActions.selectGroup(firstGroup);
        } else {
          setSelectedGroupId(null);
        }
      }
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
            <StudentDetailsPanel student={selectedStudent} loading={studentDetailsLoading} />
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
              lessons={mockAttendanceLessons}
              selectedId={selectedAttendanceLessonId}
              onSelect={setSelectedAttendanceLessonId}
            />
            <AttendanceDetailsPanel
              lesson={selectedAttendanceLesson}
              students={attendanceStudents}
            />
          </>
        )}
      </div>
    </div>
  );
}