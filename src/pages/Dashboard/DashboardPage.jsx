import React, { useState, useEffect } from 'react';
import DashboardNavbar from './components/DashboardNavbar';
import StudentListPanel from './components/StudentListPanel';
import StudentDetailsPanel from './components/StudentDetailsPanel';
import GroupListPanel from './components/GroupListPanel';
import GroupDetailsPanel from './components/GroupDetailsPanel';
import AddGroupModal from './components/AddGroupModal';
import AddLessonModal from './components/AddLessonModal';
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
import { getLessons, getLessonById } from '../../services/lessonService';

export default function DashboardPage() {
  const { state: groupState, actions: groupActions } = useGroups();
  const [activeView, setActiveView] = useState('Öğrenciler');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('1');
  const [selectedPaymentStudentId, setSelectedPaymentStudentId] = useState('1');
  const [selectedAttendanceGroupId, setSelectedAttendanceGroupId] = useState('1');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  
  // Lessons state
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState(null);
  // Ders oluşturulduğunda veya güncellendiğinde gönderilen groupId'leri sakla
  const [lessonGroupIds, setLessonGroupIds] = useState({}); // { lessonId: groupId }
  // Ders öğrencileri state
  const [lessonStudents, setLessonStudents] = useState([]);
  
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
      // Grupları da yükle (kategori filtreleme için)
      if (groupState.groups.length === 0) {
        groupActions.loadGroups();
      }
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

  // Gün isimlerini Türkçe'ye çevir
  const dayMappingEnToTr = {
    'Monday': 'Pazartesi',
    'Tuesday': 'Salı',
    'Wednesday': 'Çarşamba',
    'Thursday': 'Perşembe',
    'Friday': 'Cuma',
    'Saturday': 'Cumartesi',
    'Sunday': 'Pazar'
  };

  // Backend ders verisini frontend formatına dönüştür
  const transformLesson = (backendLesson, groups, savedGroupIds = {}) => {
    // Backend'den gelen tüm alanları logla (debug için)
    console.log('Transform Lesson - Full Backend Data:', JSON.stringify(backendLesson, null, 2));
    
    // Grup ID'sini kontrol et - tüm olası alan adlarını kontrol et
    const groupId = backendLesson.groupId 
      || backendLesson.groupId 
      || backendLesson.group?.id 
      || backendLesson.groupId
      || (backendLesson.group && typeof backendLesson.group === 'string' ? backendLesson.group : null)
      || (backendLesson.group && typeof backendLesson.group === 'object' ? backendLesson.group.id : null);
    
    console.log('Transform Lesson - Extracted GroupId:', groupId);
    console.log('Transform Lesson - Available Groups:', groups?.map(g => ({ id: g.id, name: g.name })));
    
    // Grup listesinden grup bilgisini bul
    let group = null;
    let groupName = '-';
    
    if (groupId && groups && groups.length > 0) {
      // Grup ID'sini string'e çevir ve eşleştir
      const lessonGroupIdStr = String(groupId).trim();
      
      // Grup listesinde ara
      group = groups.find(g => {
        const gIdStr = String(g.id).trim();
        // Hem tam eşleşme hem de case-insensitive kontrol
        return gIdStr === lessonGroupIdStr || gIdStr.toLowerCase() === lessonGroupIdStr.toLowerCase();
      });
      
      if (group) {
        groupName = group.name;
        console.log('Transform Lesson - Found Group:', group.name);
      } else {
        // Grup bulunamadıysa backend'den gelen grup bilgisini kullan
        groupName = backendLesson.group?.name || backendLesson.groupName || 'Grup Bulunamadı';
        console.warn('Grup bulunamadı:', {
          lessonGroupId: groupId,
          lessonGroupIdType: typeof groupId,
          availableGroupIds: groups.map(g => ({ id: String(g.id), type: typeof g.id })),
          backendLessonKeys: Object.keys(backendLesson),
          backendLesson: backendLesson
        });
      }
    } else if (groupId) {
      // Grup ID var ama grup listesi yok
      groupName = backendLesson.group?.name || backendLesson.groupName || 'Grup Yükleniyor...';
      console.warn('Grup listesi yüklenmemiş:', {
        lessonGroupId: groupId,
        groupsLength: groups?.length || 0
      });
    } else {
      // Grup ID yok - backend'den gelen tüm alanları kontrol et
      console.warn('Grup ID bulunamadı - Backend response:', {
        backendLessonKeys: Object.keys(backendLesson),
        backendLesson: backendLesson,
        hasGroup: !!backendLesson.group,
        groupType: typeof backendLesson.group,
        groupValue: backendLesson.group
      });
      groupName = backendLesson.group?.name || backendLesson.groupName || '-';
    }
    
    // Saat formatını düzenle (HH:mm formatında olmalı)
    const formatTime = (time) => {
      if (!time) return '-';
      // Eğer zaten HH:mm formatındaysa olduğu gibi döndür
      if (time.match(/^\d{2}:\d{2}$/)) {
        return time;
      }
      // Eğer HH:mm:ss formatındaysa sadece HH:mm'i al
      if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return time.substring(0, 5);
      }
      // Eğer başka bir formattaysa parse et
      return time;
    };

    const transformed = {
      id: backendLesson.id || backendLesson.lessonId,
      lessonId: backendLesson.id || backendLesson.lessonId, // Backend'de lessonId olarak kullanılıyor
      name: backendLesson.lessonName || backendLesson.name || '-',
      group: groupName, // Grup adını ekle
      groupId: groupId || backendLesson.groupId, // Grup ID'sini sakla (filtreleme için)
      day: dayMappingEnToTr[backendLesson.startingDayOfWeek] || backendLesson.startingDayOfWeek || '-',
      time: formatTime(backendLesson.startingHour) || '-',
      capacity: backendLesson.capacity ? `${backendLesson.currentStudentCount || 0}/${backendLesson.capacity}` : '-',
      _backendData: backendLesson // Orijinal backend verisini sakla
    };
    
    console.log('Transform Lesson - Transformed:', transformed);
    
    return transformed;
  };

  // Load lessons from backend
  const loadLessons = async () => {
    setLessonsLoading(true);
    setLessonsError(null);
    try {
      // Önce grup listesinin yüklendiğinden emin ol
      if (groupState.groups.length === 0) {
        console.log('Load Lessons - Groups not loaded yet, loading groups first...');
        await groupActions.loadGroups();
        // Grupları yükledikten sonra state güncellenene kadar bekle
        // useEffect ile tekrar çağrılacak
        setLessonsLoading(false);
        return;
      }
      
      const backendLessons = await getLessons();
      console.log('Load Lessons - Backend Response:', backendLessons);
      console.log('Load Lessons - Backend Response (JSON):', JSON.stringify(backendLessons, null, 2));
      console.log('Load Lessons - Available Groups:', groupState.groups);
      console.log('Load Lessons - Groups Count:', groupState.groups.length);
      
      // Backend'den gelen ders listesinde groupId yok, her ders için detay çekerek groupId'yi al
      const lessonsWithDetails = await Promise.all(
        Array.isArray(backendLessons) 
          ? backendLessons.map(async (lesson) => {
              try {
                // Her ders için detay çek
                const lessonDetail = await getLessonById(lesson.id);
                console.log(`Lesson ${lesson.id} detail:`, lessonDetail);
                // Detaydan groupId'yi al ve lesson objesine ekle
                return {
                  ...lesson,
                  groupId: lessonDetail.groupId || lessonDetail.group?.id || null
                };
              } catch (error) {
                console.warn(`Lesson ${lesson.id} detail çekilemedi:`, error);
                // Hata durumunda orijinal lesson'ı döndür
                return lesson;
              }
            })
          : []
      );
      
      console.log('Load Lessons - Lessons with Details:', lessonsWithDetails);
      
      // Backend'den gelen dersleri frontend formatına dönüştür
      // Grup listesi güncel olması için groupState.groups kullan
      // Saklanan groupId'leri de kullan
      const transformedLessons = Array.isArray(lessonsWithDetails) 
        ? lessonsWithDetails.map(lesson => {
            const transformed = transformLesson(lesson, groupState.groups, lessonGroupIds);
            console.log('Transformed lesson:', {
              name: transformed.name,
              groupId: transformed.groupId,
              group: transformed.group
            });
            return transformed;
          })
        : [];
      
      console.log('Load Lessons - Transformed Lessons:', transformedLessons);
      setLessons(transformedLessons);
      
      // Mevcut seçili ders ID'sini sakla
      const currentSelectedId = selectedLessonId;
      
      // Eğer seçili ders varsa ve listede hala varsa, onu koru
      if (currentSelectedId && transformedLessons.find(l => String(l.id) === String(currentSelectedId))) {
        // Ders hala listede, seçili kalması için bir şey yapma
      } else if (transformedLessons.length > 0) {
        // Seçili ders yoksa veya listede yoksa ilk dersi seç
        setSelectedLessonId(transformedLessons[0].id);
      } else {
        // Ders yoksa seçimi temizle
        setSelectedLessonId(null);
      }
    } catch (error) {
      console.error('Dersler yüklenirken hata:', error);
      setLessonsError(error.message || 'Dersler yüklenirken bir hata oluştu');
      setLessons([]);
      // Hata durumunda mock data kullan
      setLessons(mockLessons);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Load lessons when Dersler view is active
  useEffect(() => {
    if (activeView === 'Dersler') {
      // Gruplar yüklüyse dersleri yükle
      if (groupState.groups.length > 0) {
        loadLessons();
      } else {
        // Gruplar henüz yüklenmemişse önce grupları yükle
        groupActions.loadGroups();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, groupState.groups.length]);
  
  // Gruplar yüklendikten sonra dersleri yükle
  useEffect(() => {
    if (activeView === 'Dersler' && groupState.groups.length > 0 && lessons.length === 0 && !lessonsLoading) {
      loadLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, groupState.groups.length]);

  // Gruplar yüklendiğinde ve Dersler görünümündeyse dersleri yeniden yükle (grup isimleri için)
  useEffect(() => {
    if (activeView === 'Dersler' && groupState.groups.length > 0) {
      // Gruplar yüklendiğinde dersleri yeniden yükle (grup isimleri güncellenmiş olabilir)
      if (lessons.length > 0) {
        // Mevcut dersleri grup bilgileriyle yeniden transform et
        const backendLessons = lessons.map(l => l._backendData).filter(Boolean);
        if (backendLessons.length > 0) {
          console.log('Re-transforming lessons with updated groups:', {
            lessonsCount: backendLessons.length,
            groupsCount: groupState.groups.length,
            groups: groupState.groups.map(g => ({ id: g.id, name: g.name }))
          });
          const transformedLessons = backendLessons.map(lesson => transformLesson(lesson, groupState.groups, lessonGroupIds));
          console.log('Re-transformed lessons:', transformedLessons.map(l => ({ name: l.name, group: l.group, groupId: l.groupId })));
          setLessons(transformedLessons);
        } else {
          // Eğer backend data yoksa yeniden yükle
          loadLessons();
        }
      } else {
        // Dersler henüz yüklenmemişse yükle
        loadLessons();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupState.groups, activeView]);

  // Handle lesson creation
  const handleLessonCreated = ({ lessonId, groupId }) => {
    // Ders oluşturulduğunda groupId'yi sakla
    if (lessonId && groupId) {
      setLessonGroupIds(prev => ({
        ...prev,
        [lessonId]: groupId
      }));
      console.log('Lesson created - Saved groupId:', { lessonId, groupId });
    }
    // Ders oluşturulduktan sonra listeyi yenile
    loadLessons();
  };
  
  // Handle lesson update
  const handleLessonUpdated = ({ lessonId, groupId }) => {
    // Ders güncellendiğinde groupId'yi sakla
    if (lessonId && groupId) {
      setLessonGroupIds(prev => ({
        ...prev,
        [lessonId]: groupId
      }));
      console.log('Lesson updated - Saved groupId:', { lessonId, groupId });
    }
    // Ders güncellendikten sonra listeyi yenile
    loadLessons();
  };

  const selectedStudent = selectedStudentDetails || students.find(s => s.id === selectedStudentId) || null;
  const selectedGroup = groupState.groups.find(g => g.id === selectedGroupId);
  const groupStudents = selectedGroupId ? (groupState.students[selectedGroupId] || []) : [];
  // Use loaded lessons or fallback to mock
  const lessonsToDisplay = lessons.length > 0 ? lessons : mockLessons;
  const selectedLessonData = lessonsToDisplay.find(l => l.id === selectedLessonId);
  const backendLessonData = selectedLessonData?._backendData;
  
  // Saat formatını düzenle (HH:mm formatında olmalı)
  const formatTimeForDisplay = (time) => {
    if (!time) return '-';
    // Eğer zaten HH:mm formatındaysa olduğu gibi döndür
    if (time.match(/^\d{2}:\d{2}$/)) {
      return time;
    }
    // Eğer HH:mm:ss formatındaysa sadece HH:mm'i al
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time.substring(0, 5);
    }
    return time;
  };

  // Seçili ders için grup bilgisini bul
  const lessonIdForGroup = selectedLessonData?.lessonId || selectedLessonData?.id || backendLessonData?.id || backendLessonData?.lessonId;
  const selectedLessonGroupId = selectedLessonData?.groupId 
    || backendLessonData?.groupId 
    || (lessonIdForGroup ? lessonGroupIds[lessonIdForGroup] : null);
  
  // Grup listesinden grup ismini bul
  const selectedLessonGroup = selectedLessonGroupId 
    ? groupState.groups.find(g => String(g.id) === String(selectedLessonGroupId))
    : null;
  
  const selectedLesson = selectedLessonData ? {
    id: selectedLessonData.id,
    lessonId: lessonIdForGroup,
    name: selectedLessonData.name,
    groupName: selectedLessonGroup?.name || selectedLessonData.group || backendLessonData?.group?.name || '-',
    groupId: selectedLessonGroupId,
    day: selectedLessonData.day,
    startingHour: formatTimeForDisplay(backendLessonData?.startingHour || selectedLessonData.time),
    endingHour: formatTimeForDisplay(backendLessonData?.endingHour),
    capacity: backendLessonData?.capacity || (selectedLessonData.capacity ? selectedLessonData.capacity.split('/')[1] : '-'),
    // Backend verilerini de sakla
    _backendData: backendLessonData
  } : (mockLessonDetails[selectedLessonId] || null);
  // Ders öğrencileri - state'ten al, yoksa mock data kullan
  const currentLessonStudents = lessonStudents.length > 0 ? lessonStudents : (mockLessonStudents[selectedLessonId] || []);
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
              groups={groupState.groups}
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
              lessons={lessonsToDisplay}
              selectedId={selectedLessonId}
              onSelect={setSelectedLessonId}
              onAddClick={() => setIsAddLessonModalOpen(true)}
              groups={groupState.groups}
              lessonGroupIds={lessonGroupIds}
            />
            <LessonDetailsPanel
              lesson={selectedLesson}
              students={currentLessonStudents}
              onLessonUpdated={handleLessonUpdated}
              onStudentsUpdated={setLessonStudents}
            />
            <AddLessonModal
              isOpen={isAddLessonModalOpen}
              onClose={() => setIsAddLessonModalOpen(false)}
              onLessonCreated={handleLessonCreated}
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