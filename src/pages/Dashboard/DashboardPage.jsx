import React, { useState } from 'react';
import DashboardNavbar from './components/DashboardNavbar';
import StudentListPanel from './components/StudentListPanel';
import StudentDetailsPanel from './components/StudentDetailsPanel';
import GroupListPanel from './components/GroupListPanel';
import GroupDetailsPanel from './components/GroupDetailsPanel';
import LessonListPanel from './components/LessonListPanel';
import LessonDetailsPanel from './components/LessonDetailsPanel';
import PaymentListPanel from './components/PaymentListPanel';
import PaymentDetailsPanel from './components/PaymentDetailsPanel';
import AttendanceListPanel from './components/AttendanceListPanel';
import AttendanceDetailsPanel from './components/AttendanceDetailsPanel';
import { mockStudents, mockStudentDetails } from '../../data/mockStudents';
import { mockGroups, mockGroupStudents } from '../../data/mockGroups';
import { mockLessons, mockLessonDetails, mockLessonStudents } from '../../data/mockLessons';
import { mockPaymentStudents, mockPaymentDetails } from '../../data/mockPayments';
import { mockAttendanceLessons, mockAttendanceDetails, mockAttendanceStudents } from '../../data/mockAttendance';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('Öğrenciler');
  const [selectedStudentId, setSelectedStudentId] = useState('1');
  const [selectedGroupId, setSelectedGroupId] = useState('1');
  const [selectedLessonId, setSelectedLessonId] = useState('1');
  const [selectedPaymentStudentId, setSelectedPaymentStudentId] = useState('1');
  const [selectedAttendanceLessonId, setSelectedAttendanceLessonId] = useState('1');

  const selectedStudent = mockStudentDetails[selectedStudentId] || null;
  const selectedGroup = mockGroups.find(g => g.id === selectedGroupId);
  const groupStudents = mockGroupStudents[selectedGroupId] || [];
  const selectedLesson = mockLessonDetails[selectedLessonId] || null;
  const lessonStudents = mockLessonStudents[selectedLessonId] || [];
  const selectedPaymentStudent = mockPaymentDetails[selectedPaymentStudentId] || null;
  const selectedAttendanceLesson = mockAttendanceDetails[selectedAttendanceLessonId] || null;
  const attendanceStudents = mockAttendanceStudents[selectedAttendanceLessonId] || [];

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
              students={mockStudents}
              selectedId={selectedStudentId}
              onSelect={setSelectedStudentId}
            />
            <StudentDetailsPanel student={selectedStudent} />
          </>
        )}
        {activeView === 'Gruplar' && (
          <>
            <GroupListPanel
              groups={mockGroups}
              selectedId={selectedGroupId}
              onSelect={setSelectedGroupId}
            />
            <GroupDetailsPanel
              group={selectedGroup}
              students={groupStudents}
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