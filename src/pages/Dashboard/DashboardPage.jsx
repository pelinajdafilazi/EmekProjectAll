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
import { mockAttendanceLessonsByGroup } from '../../data/mockAttendance';
import { mockGroups } from '../../data/mockGroups';
import { useGroups } from '../../context/GroupContext';
import { StudentService } from '../../services/studentService';
import { getLessons, getLessonById } from '../../services/lessonService';
import { PaymentService } from '../../services/paymentService';
import * as GroupService from '../../services/groupService';

export default function DashboardPage() {
  const { state: groupState, actions: groupActions } = useGroups();
  const [activeView, setActiveView] = useState('Öğrenciler');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('1');
  const [selectedPaymentStudentId, setSelectedPaymentStudentId] = useState('1');
  const [selectedAttendanceGroupId, setSelectedAttendanceGroupId] = useState('1');
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceStudentsLoading, setAttendanceStudentsLoading] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  
  // Lessons state
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState(null);
  // Ders oluşturulduğunda veya güncellendiğinde gönderilen groupId'leri sakla
  // localStorage'dan yükle
  const loadLessonGroupIdsFromStorage = () => {
    try {
      const stored = localStorage.getItem('lessonGroupIds');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('lessonGroupIds localStorage\'dan yüklenirken hata:', error);
    }
    return {};
  };
  const [lessonGroupIds, setLessonGroupIds] = useState(() => loadLessonGroupIdsFromStorage()); // { lessonId: groupId }
  // Ders öğrencileri state
  const [lessonStudents, setLessonStudents] = useState([]);
  
  // lessonGroupIds değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('lessonGroupIds', JSON.stringify(lessonGroupIds));
      console.log('lessonGroupIds localStorage\'a kaydedildi:', lessonGroupIds);
    } catch (error) {
      console.error('lessonGroupIds localStorage\'a kaydedilirken hata:', error);
    }
  }, [lessonGroupIds]);
  
  // Students state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

  // Payment students state
  const [paymentStudents, setPaymentStudents] = useState([]);
  const [paymentStudentsLoading, setPaymentStudentsLoading] = useState(false);
  const [paymentStudentsError, setPaymentStudentsError] = useState(null);

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

  // Seçilen grup ve tarih için borç bilgilerini yükle
  const [selectedPaymentGroupId, setSelectedPaymentGroupId] = useState(null);
  const [selectedPaymentDate, setSelectedPaymentDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [isDateFilterActive, setIsDateFilterActive] = useState(false); // Tarih filtresi aktif mi?

  const loadGroupPeriodDebts = async (groupId, year, month) => {
    // Ay ve yıl değerlerini sayıya çevir (güvenlik için)
    const yearNumber = typeof year === 'string' ? parseInt(year, 10) : Number(year);
    const monthNumber = typeof month === 'string' ? parseInt(month, 10) : Number(month);
    
    setPaymentStudentsLoading(true);
    setPaymentStudentsError(null);
    try {
      // Backend'den grup ve tarih aralığına göre borç bilgilerini çek
      // groupId null ise tüm gruplar için veri çekilecek
      // Ay ve yıl sayı olarak gönderiliyor (1-12 arası ay, yıl tam sayı)
      const debts = await PaymentService.getGroupPeriodDebts(groupId, yearNumber, monthNumber);
      
      // Backend'den tüm öğrencileri çek (detay bilgileri için)
      const backendStudents = await StudentService.getAllStudents();
      const studentMap = new Map();
      backendStudents.forEach(student => {
        studentMap.set(student.id, student);
      });
      
      // Borç bilgilerini map'e al (hızlı erişim için)
      const debtMap = new Map();
      debts.forEach(debt => {
        if (debt.studentId) {
          debtMap.set(debt.studentId, debt);
        }
      });
      
      // Grup filtresi varsa grup öğrencilerini al
      let studentsToProcess = backendStudents;
      if (groupId) {
        const groupStudents = await GroupService.getGroupStudents(groupId);
        const groupStudentIds = new Set();
        groupStudents.forEach(gs => {
          groupStudentIds.add(gs.id || gs._backendData?.id);
        });
        studentsToProcess = backendStudents.filter(student => 
          groupStudentIds.has(student.id)
        );
      }
      
      // Backend'den gelen borç bilgilerini öğrenci formatına dönüştür
      const studentsWithDebts = studentsToProcess.map((student) => {
        const debt = debtMap.get(student.id);
        
        // Seçilen ay için borç kontrolü
        // hasDebtMonth true ise veya debtAmountForFilteredMonth > 0 ise ödenmedi
        // hasDebtMonth null geliyorsa debtAmountForFilteredMonth kontrolü yapılmalı
        const debtAmount = debt?.debtAmountForFilteredMonth;
        const hasDebtForSelectedMonth = debt?.hasDebtMonth === true || 
          (debtAmount !== null && 
           debtAmount !== undefined && 
           !isNaN(debtAmount) &&
           debtAmount > 0);
        const paymentStatus = hasDebtForSelectedMonth ? 'unpaid' : 'paid';
        
        // Backend'den gelen öğrenci bilgilerini kullan, yoksa backend'den gelen bilgileri kullan
        return {
          ...student,
          paymentStatus,
          totalDebt: debtAmount || 0,
          debtInfo: {
            hasDebtTotal: debt?.hasDebtTotal || false,
            hasDebtMonth: debt?.hasDebtMonth || false,
            debtAmountForFilteredMonth: debtAmount || 0,
            dueDateForFilteredMonth: debt?.dueDateForFilteredMonth || null
          },
          payments: [] // Backend'den gelen borç bilgileri kullanılacak
        };
      });
      
      setPaymentStudents(studentsWithDebts);
      
      // İlk öğrenciyi otomatik seç
      if (studentsWithDebts.length > 0 && !selectedPaymentStudentId) {
        setSelectedPaymentStudentId(studentsWithDebts[0].id);
      }
    } catch (error) {
      console.error('Grup ve tarih aralığı borç bilgileri yüklenirken hata:', error);
      setPaymentStudentsError(error.message || 'Borç bilgileri yüklenirken bir hata oluştu');
      setPaymentStudents([]);
    } finally {
      setPaymentStudentsLoading(false);
    }
  };

  // Load payment students from backend
  const loadPaymentStudents = async (forceGeneralView = false) => {
    setPaymentStudentsLoading(true);
    setPaymentStudentsError(null);
    try {
      // Backend'den tüm öğrencileri çek
      const backendStudents = await StudentService.getAllStudents();
      
      let studentsWithPayments = [];
      
      // Tarih filtresi aktifse seçilen ay için borç kontrolü yap (forceGeneralView true ise atla)
      if (!forceGeneralView && isDateFilterActive && selectedPaymentDate.year && selectedPaymentDate.month) {
        // Tarih filtresi aktifse grup filtresi olmadan tüm öğrenciler için borç kontrolü yap
        const debts = await PaymentService.getGroupPeriodDebts(null, selectedPaymentDate.year, selectedPaymentDate.month);
        const debtMap = new Map();
        debts.forEach(debt => {
          debtMap.set(debt.studentId, debt);
        });
        
        // Her öğrenci için seçilen ay için borç kontrolü yap
        studentsWithPayments = backendStudents.map(student => {
          const debt = debtMap.get(student.id);
          
          // Seçilen ay için borç kontrolü
          const hasDebtForSelectedMonth = debt?.hasDebtMonth === true || (debt?.debtAmountForFilteredMonth !== null && debt?.debtAmountForFilteredMonth !== undefined && debt.debtAmountForFilteredMonth > 0);
          const paymentStatus = hasDebtForSelectedMonth ? 'unpaid' : 'paid';
          
          return {
            ...student,
            paymentStatus,
            totalDebt: debt?.debtAmountForFilteredMonth || 0,
            payments: []
          };
        });
      } else {
        // Tarih filtresi yoksa toplam borç bilgisini çek
        studentsWithPayments = await Promise.all(
          backendStudents.map(async (student) => {
            try {
              // Backend'den öğrencinin toplam borç bilgisini çek
              const paymentData = await PaymentService.getStudentPaymentDetails(student.id);
              const totalDebt = paymentData?.totalDebt || 0;
              
              // Toplam borç 0 ise ödendi, 0'dan büyükse ödenmedi
              const paymentStatus = totalDebt === 0 ? 'paid' : 'unpaid';
              
              return {
                ...student,
                paymentStatus,
                totalDebt,
                payments: paymentData?.debts || [] // Ödeme detayları için sakla
              };
            } catch (error) {
              console.error(`Öğrenci ${student.id} ödeme bilgileri yüklenirken hata:`, error);
              // Hata durumunda unpaid olarak işaretle
              return {
                ...student,
                paymentStatus: 'unpaid',
                totalDebt: 0,
                payments: []
              };
            }
          })
        );
      }
      
      setPaymentStudents(studentsWithPayments);
      
      // İlk öğrenciyi otomatik seç
      if (studentsWithPayments.length > 0 && !selectedPaymentStudentId) {
        setSelectedPaymentStudentId(studentsWithPayments[0].id);
      }
    } catch (error) {
      console.error('Ödeme öğrencileri yüklenirken hata:', error);
      setPaymentStudentsError(error.message || 'Öğrenciler yüklenirken bir hata oluştu');
      setPaymentStudents([]);
    } finally {
      setPaymentStudentsLoading(false);
    }
  };

  const handlePaymentDateChange = async (groupId, year, month) => {
    if (!year || !month) {
      // Tarih seçilmediyse normal yükleme yap
      setIsDateFilterActive(false);
      loadPaymentStudents();
      return;
    }
    
    // Ay ve yıl değerlerini sayıya çevir (güvenlik için)
    const yearNumber = typeof year === 'string' ? parseInt(year, 10) : Number(year);
    const monthNumber = typeof month === 'string' ? parseInt(month, 10) : Number(month);
    
    setSelectedPaymentGroupId(groupId);
    setSelectedPaymentDate({ year: yearNumber, month: monthNumber });
    setIsDateFilterActive(true); // Tarih filtresi aktif
    
    // Ay ve yıla göre tüm öğrenciler için borç kontrolü yap
    setPaymentStudentsLoading(true);
    setPaymentStudentsError(null);
    try {
      // Backend'den tüm öğrencileri çek
      const backendStudents = await StudentService.getAllStudents();
      
      // Her öğrenci için ödeme bilgilerini çek ve seçilen ay/yıl ile karşılaştır
      const studentsWithPayments = await Promise.all(
        backendStudents.map(async (student) => {
            try {
            // Öğrencinin tüm ödemelerini çek (/api/Debts/student/{studentId})
            const response = await PaymentService.getStudentPayments(student.id);
            const debts = response || [];
            
            // Seçilen ay/yıl için borç kontrolü
            // dueDate'i parse et ve ay/yıl ile karşılaştır
            let hasDebtForSelectedMonth = false;
            let debtAmountForMonth = 0;
            
            debts.forEach(debt => {
              if (debt.dueDate) {
                const dueDate = new Date(debt.dueDate);
                const debtYear = dueDate.getFullYear();
                const debtMonth = dueDate.getMonth() + 1; // JavaScript'te 0-11, bizde 1-12
                
                // Seçilen ay/yıl ile eşleşiyor mu?
                if (debtYear === yearNumber && debtMonth === monthNumber) {
                  // Bu ay/yıl için borç var mı? (isPaid: false veya deptAmount > 0)
                  const isPaid = debt.isPaid || false;
                  const deptAmount = debt.deptAmount || 0;
                  
                  if (!isPaid || deptAmount > 0) {
                    hasDebtForSelectedMonth = true;
                    debtAmountForMonth += deptAmount;
                  }
                }
              }
            });
            
            const paymentStatus = hasDebtForSelectedMonth ? 'unpaid' : 'paid';
            
            return {
              ...student,
              paymentStatus,
              totalDebt: debtAmountForMonth,
              debtInfo: {
                hasDebtTotal: debtAmountForMonth > 0,
                hasDebtMonth: hasDebtForSelectedMonth,
                debtAmountForFilteredMonth: debtAmountForMonth,
                dueDateForFilteredMonth: null
              },
              payments: []
            };
          } catch (error) {
            console.error(`Öğrenci ${student.id} ödeme bilgileri yüklenirken hata:`, error);
            // Hata durumunda ödeme yapıldı olarak işaretle
            return {
              ...student,
              paymentStatus: 'paid',
              totalDebt: 0,
              debtInfo: {
                hasDebtTotal: false,
                hasDebtMonth: false,
                debtAmountForFilteredMonth: 0,
                dueDateForFilteredMonth: null
              },
              payments: []
            };
          }
        })
      );
      
      // Grup filtresi varsa öğrencileri filtrele
      let filteredStudents = studentsWithPayments;
      if (groupId) {
        // Grup öğrencilerini al
        const groupStudents = await GroupService.getGroupStudents(groupId);
        const groupStudentIds = new Set();
        groupStudents.forEach(gs => {
          groupStudentIds.add(gs.id || gs._backendData?.id);
        });
        
        filteredStudents = studentsWithPayments.filter(student => 
          groupStudentIds.has(student.id)
        );
      }
      
      setPaymentStudents(filteredStudents);
      
      // İlk öğrenciyi otomatik seç
      if (filteredStudents.length > 0 && !selectedPaymentStudentId) {
        setSelectedPaymentStudentId(filteredStudents[0].id);
      }
    } catch (error) {
      console.error('Ay ve yıla göre borç bilgileri yüklenirken hata:', error);
      setPaymentStudentsError(error.message || 'Borç bilgileri yüklenirken bir hata oluştu');
      setPaymentStudents([]);
    } finally {
      setPaymentStudentsLoading(false);
    }
  };

  const handleGeneralClick = () => {
    // Genel butonuna basıldığında tarih filtresini kaldır ve tüm yıl için toplam borç bilgisini göster
    setIsDateFilterActive(false);
    setSelectedPaymentDate({ year: null, month: null });
    setSelectedPaymentGroupId(null);
    
    // forceGeneralView parametresi ile tarih filtresini atla ve doğrudan toplam borç bilgisini çek
    loadPaymentStudents(true);
  };

  // Load groups and payment students when Ödemeler view is active
  useEffect(() => {
    if (activeView === 'Ödemeler') {
      // Grupları yükle (filtreleme için)
      if (groupState.groups.length === 0) {
        groupActions.loadGroups();
      }
      // Öğrencileri yükle
      loadPaymentStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  // Listen for payment update events
  useEffect(() => {
    if (activeView === 'Ödemeler') {
      const handlePaymentUpdated = () => {
        // Ödeme güncellendiğinde öğrencileri yeniden yükle
        loadPaymentStudents();
      };
      
      window.addEventListener('paymentUpdated', handlePaymentUpdated);
      
      return () => {
        window.removeEventListener('paymentUpdated', handlePaymentUpdated);
      };
    }
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
    
    // Grup ID'sini kontrol et - önce backendLesson'dan, sonra savedGroupIds'den
    const lessonId = backendLesson.id || backendLesson.lessonId;
    const groupId = backendLesson.groupId 
      || backendLesson.group?.id 
      || (backendLesson.group && typeof backendLesson.group === 'string' ? backendLesson.group : null)
      || (backendLesson.group && typeof backendLesson.group === 'object' ? backendLesson.group.id : null)
      || (lessonId && savedGroupIds[lessonId] ? savedGroupIds[lessonId] : null);
    
    console.log('Transform Lesson - Extracted GroupId:', groupId);
    console.log('Transform Lesson - Available Groups:', groups?.map(g => ({ id: g.id, name: g.name })));
    
    // Grup listesinden grup bilgisini bul
    let group = null;
    let groupName = '-';
    
    if (groupId && groups && groups.length > 0) {
      // Grup ID'sini string'e çevir ve eşleştir
      const lessonGroupIdStr = String(groupId).trim();
      
      // Grup listesinde ara - hem tam eşleşme hem de case-insensitive kontrol
      group = groups.find(g => {
        const gIdStr = String(g.id).trim();
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
      startingHour: formatTime(backendLesson.startingHour) || '-',
      endingHour: formatTime(backendLesson.endingHour) || '-',
      capacity: backendLesson.capacity ? `${backendLesson.currentStudentCount || 0}/${backendLesson.capacity}` : '-',
      _backendData: backendLesson // Orijinal backend verisini sakla
    };
    
    console.log('Transform Lesson - Transformed:', transformed);
    
    return transformed;
  };

  // Load lessons from backend
  const loadLessons = async () => {
    // Zaten yükleniyorsa tekrar yükleme
    if (lessonsLoading) {
      return;
    }

    setLessonsLoading(true);
    setLessonsError(null);
    try {
      // Grup listesi yüklenmemişse yükleme (useEffect'te kontrol ediliyor)
      if (groupState.groups.length === 0) {
        setLessonsLoading(false);
        return;
      }
      
      const backendLessons = await getLessons();
      console.log('Load Lessons - Backend Response:', backendLessons);
      
      // Sadece isActive: true olan dersleri filtrele (soft delete için)
      const activeLessons = Array.isArray(backendLessons) 
        ? backendLessons.filter(lesson => lesson.isActive !== false) // isActive undefined veya true ise göster
        : [];
      console.log('Load Lessons - Active Lessons (filtered):', activeLessons);
      
      // Backend'den gelen ders listesinde groupId yoksa, her ders için detay çekerek groupId'yi al
      // Ancak sadece groupId yoksa detay çek, aksi halde gereksiz API çağrısı yapma
      let lessonsWithDetails = [];
      
      if (Array.isArray(activeLessons) && activeLessons.length > 0) {
        // Önce hangi derslerin groupId'si eksik kontrol et
        const lessonsNeedingDetails = activeLessons.filter(lesson => 
          !lesson.groupId && !lesson.group?.id && !lessonGroupIds[lesson.id]
        );
        
        // Sadece groupId'si eksik olan dersler için detay çek
        if (lessonsNeedingDetails.length > 0) {
          console.log(`Loading details for ${lessonsNeedingDetails.length} lessons without groupId...`);
          const detailsPromises = lessonsNeedingDetails.map(async (lesson) => {
            try {
              const lessonDetail = await getLessonById(lesson.id);
              return {
                ...lesson,
                groupId: lessonDetail.groupId || lessonDetail.group?.id || null
              };
            } catch (error) {
              console.warn(`Lesson ${lesson.id} detail çekilemedi:`, error);
              return lesson;
            }
          });
          
          const lessonsWithDetailsArray = await Promise.all(detailsPromises);
          
          // Detay çekilen dersleri güncelle, diğerlerini olduğu gibi bırak
          lessonsWithDetails = activeLessons.map(lesson => {
            const detailedLesson = lessonsWithDetailsArray.find(dl => dl.id === lesson.id);
            if (detailedLesson) {
              return detailedLesson;
            }
            // Eğer lessonGroupIds'de varsa onu kullan
            if (lessonGroupIds[lesson.id]) {
              return {
                ...lesson,
                groupId: lessonGroupIds[lesson.id]
              };
            }
            return lesson;
          });
        } else {
          // Tüm derslerin groupId'si var, detay çekmeye gerek yok
          lessonsWithDetails = activeLessons.map(lesson => ({
            ...lesson,
            groupId: lesson.groupId || lesson.group?.id || lessonGroupIds[lesson.id] || null
          }));
        }
      }
      
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
      
      // Backend'den gelen tüm derslerin groupId'lerini lessonGroupIds'e ekle
      // Bu sayfa yenilendiğinde grup bilgileri korunur
      if (Array.isArray(lessonsWithDetails) && lessonsWithDetails.length > 0) {
        const newLessonGroupIds = { ...lessonGroupIds };
        let hasNewGroupIds = false;
        
        lessonsWithDetails.forEach(lesson => {
          const lessonId = lesson.id || lesson.lessonId;
          const groupId = lesson.groupId || lesson.group?.id;
          
          if (lessonId && groupId) {
            // Mevcut değer yoksa veya farklıysa güncelle
            if (!newLessonGroupIds[lessonId] || newLessonGroupIds[lessonId] !== groupId) {
              newLessonGroupIds[lessonId] = groupId;
              hasNewGroupIds = true;
            }
          }
        });
        
        // Eğer yeni groupId'ler varsa state'i güncelle
        if (hasNewGroupIds) {
          setLessonGroupIds(newLessonGroupIds);
          console.log('Load Lessons - Updated lessonGroupIds:', newLessonGroupIds);
        }
      }
      
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

  // Load lessons when Dersler view is active - tek bir useEffect ile birleştirildi
  useEffect(() => {
    // Sadece Dersler görünümündeyken çalış
    if (activeView !== 'Dersler') {
      return;
    }

    // Zaten yükleniyorsa tekrar yükleme
    if (lessonsLoading) {
      return;
    }

    // Gruplar yüklenmemişse önce grupları yükle ve çık
    if (groupState.groups.length === 0) {
      groupActions.loadGroups();
      return;
    }

    // Gruplar yüklü ve dersler yüklenmemişse yükle
    if (lessons.length === 0) {
      loadLessons();
      return;
    }

    // Gruplar güncellendiğinde mevcut dersleri yeniden transform et (API çağrısı yapmadan)
    // Sadece grup bilgileri güncellendiğinde transform et, her grup değişikliğinde API çağrısı yapma
    const backendLessons = lessons.map(l => l._backendData).filter(Boolean);
    if (backendLessons.length > 0) {
      // Sadece transform et, API çağrısı yapma
      const transformedLessons = backendLessons.map(lesson => transformLesson(lesson, groupState.groups, lessonGroupIds));
      setLessons(transformedLessons);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, groupState.groups.length]); // lessons.length'i dependency'den çıkardık - sonsuz döngüyü önlemek için

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
  
  // Grup listesinden grup ismini bul - daha güvenilir eşleştirme
  let selectedLessonGroup = null;
  let selectedLessonGroupName = '-';
  
  if (selectedLessonGroupId && groupState.groups && groupState.groups.length > 0) {
    const lessonGroupIdStr = String(selectedLessonGroupId).trim();
    selectedLessonGroup = groupState.groups.find(g => {
      const gIdStr = String(g.id).trim();
      return gIdStr === lessonGroupIdStr || gIdStr.toLowerCase() === lessonGroupIdStr.toLowerCase();
    });
    
    if (selectedLessonGroup) {
      selectedLessonGroupName = selectedLessonGroup.name;
    } else {
      // Grup bulunamadıysa lesson'dan gelen grup adını kullan
      selectedLessonGroupName = selectedLessonData?.group || backendLessonData?.group?.name || 'Grup Bulunamadı';
    }
  } else if (selectedLessonGroupId) {
    // Grup ID var ama grup listesi yok
    selectedLessonGroupName = selectedLessonData?.group || backendLessonData?.group?.name || 'Grup Yükleniyor...';
  } else {
    // Grup ID yok - lesson'dan gelen grup adını kullan
    selectedLessonGroupName = selectedLessonData?.group || backendLessonData?.group?.name || '-';
  }
  
  const selectedLesson = selectedLessonData ? {
    id: selectedLessonData.id,
    lessonId: lessonIdForGroup,
    name: selectedLessonData.name,
    group: selectedLessonGroupName, // Grup adını ekle
    groupName: selectedLessonGroupName, // Geriye dönük uyumluluk için
    groupId: selectedLessonGroupId, // Grup ID'sini sakla
    day: selectedLessonData.day,
    startingHour: formatTimeForDisplay(backendLessonData?.startingHour || selectedLessonData.time),
    endingHour: formatTimeForDisplay(backendLessonData?.endingHour),
    capacity: backendLessonData?.capacity || (selectedLessonData.capacity ? selectedLessonData.capacity.split('/')[1] : '-'),
    // Backend verilerini de sakla
    _backendData: backendLessonData
  } : (mockLessonDetails[selectedLessonId] || null);
  // Ders öğrencileri - state'ten al, yoksa mock data kullan
  const currentLessonStudents = lessonStudents.length > 0 ? lessonStudents : (mockLessonStudents[selectedLessonId] || []);
  
  // Seçili ödeme öğrencisi - backend'den gelen verilerden bul
  const selectedPaymentStudent = paymentStudents.find(s => String(s.id) === String(selectedPaymentStudentId)) || null;
  
  // Attendance data based on selected group
  const selectedAttendanceGroup = groupState.groups.find(g => g.id === selectedAttendanceGroupId);
  
  // Find lesson for selected group - use real lesson data from backend
  const selectedAttendanceLessonData = selectedAttendanceGroupId && lessonsToDisplay.length > 0
    ? lessonsToDisplay.find(l => {
        const lessonGroupId = l.groupId || l._backendData?.groupId || (l.id && lessonGroupIds[l.id]);
        return lessonGroupId && String(lessonGroupId) === String(selectedAttendanceGroupId);
      })
    : null;

  // Format lesson for attendance display (only name, day, capacity)
  const selectedAttendanceLesson = selectedAttendanceLessonData ? {
    id: selectedAttendanceLessonData.id,
    name: selectedAttendanceLessonData.name || '-',
    day: selectedAttendanceLessonData.day || '-',
    capacity: selectedAttendanceLessonData.capacity 
      ? (typeof selectedAttendanceLessonData.capacity === 'string' 
          ? selectedAttendanceLessonData.capacity.split('/')[1] || selectedAttendanceLessonData.capacity
          : String(selectedAttendanceLessonData.capacity))
      : (selectedAttendanceLessonData._backendData?.capacity 
          ? String(selectedAttendanceLessonData._backendData.capacity)
          : '-'),
    date: selectedAttendanceLessonData._backendData?.date || new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
  } : null;

  // Load students for selected attendance group
  useEffect(() => {
    const loadAttendanceStudents = async () => {
      if (!selectedAttendanceGroupId || activeView !== 'Yoklamalar') {
        setAttendanceStudents([]);
        return;
      }

      setAttendanceStudentsLoading(true);
      try {
        const students = await GroupService.getGroupStudents(selectedAttendanceGroupId);
        setAttendanceStudents(students || []);
      } catch (error) {
        console.error('Öğrenciler yüklenirken hata:', error);
        setAttendanceStudents([]);
      } finally {
        setAttendanceStudentsLoading(false);
      }
    };

    loadAttendanceStudents();
  }, [selectedAttendanceGroupId, activeView]);

  // Load groups and lessons when Yoklamalar view is active
  useEffect(() => {
    if (activeView === 'Yoklamalar') {
      // Load groups if not loaded
      if (groupState.groups.length === 0) {
        groupActions.loadGroups();
      }
      // Load lessons if not loaded and groups are available
      if (groupState.groups.length > 0 && lessons.length === 0 && !lessonsLoading) {
        loadLessons();
      }
      // Set first group as selected when groups are loaded
      if (groupState.groups.length > 0 && !selectedAttendanceGroupId) {
        const firstGroup = groupState.groups[0];
        setSelectedAttendanceGroupId(firstGroup.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, groupState.groups, lessons.length, lessonsLoading]);

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
              lessonGroupIds={lessonGroupIds}
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
              students={paymentStudents}
              selectedId={selectedPaymentStudentId}
              onSelect={setSelectedPaymentStudentId}
              groups={groupState.groups}
              loading={paymentStudentsLoading}
              onDateChange={handlePaymentDateChange}
              onGeneralClick={handleGeneralClick}
            />
            <PaymentDetailsPanel student={selectedPaymentStudent} />
          </>
        )}
        {activeView === 'Yoklamalar' && (
          <>
            <AttendanceListPanel
              groups={groupState.groups}
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