import React, { useState, useEffect } from 'react';
import { Check, X, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css';
import AttendanceInfoModal from './AttendanceInfoModal';
import { getLessonAttendances, bulkCreateAttendances, formatDateForBackend, getStudentAttendancePercentage } from '../../../services/attendanceService';
import { getGroupStudents } from '../../../services/groupService';
import { getLessonStudents } from '../../../services/lessonService';
import { transformBackendToStudent } from '../../../services/studentService';
import StudentImage from './StudentImage';

registerLocale('tr', tr);

export default function AttendanceDetailsPanel({ group, lesson, students }) {
  const [allGroupStudents, setAllGroupStudents] = useState([]);
  const [lessonStudents, setLessonStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [percentageLoading, setPercentageLoading] = useState(false);

  // Load all students from group - use students prop if provided, otherwise fetch from group
  useEffect(() => {
    const loadStudentsForGroup = async () => {
      // Grup seçilmediyse öğrencileri temizle
      if (!group) {
        setAllGroupStudents([]);
        return;
      }

      // If students prop is provided and it's an array with items, use it
      if (students && Array.isArray(students) && students.length > 0) {
        console.log('Using students prop:', students.length, 'students');
        setAllGroupStudents(students);
        return;
      }

      // Otherwise, fetch students from group
      const groupId = group.id || group._backendData?.id;
      if (!groupId) {
        setAllGroupStudents([]);
        return;
      }

      setStudentsLoading(true);
      try {
        console.log('Loading students for group:', groupId, group);
        const fetchedStudents = await getGroupStudents(groupId);
        console.log('Loaded group students:', fetchedStudents);
        setAllGroupStudents(fetchedStudents || []);
      } catch (err) {
        console.error('Grup öğrencileri yüklenirken hata:', err);
        setAllGroupStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudentsForGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id, group?._backendData?.id, students?.length]);

  // Load students enrolled in the selected lesson and filter group students
  useEffect(() => {
    const loadAndFilterStudents = async () => {
      if (!lesson || !group) {
        setFilteredStudents([]);
        setLessonStudents([]);
        return;
      }

      const lessonId = lesson.id || lesson._backendData?.id;
      if (!lessonId) {
        setFilteredStudents([]);
        setLessonStudents([]);
        return;
      }

      if (allGroupStudents.length === 0) {
        setFilteredStudents([]);
        return;
      }

      try {
        console.log('Loading students enrolled in lesson:', lessonId);
        const enrolledStudentsRaw = await getLessonStudents(lessonId);
        console.log('Loaded lesson students (raw):', enrolledStudentsRaw);
        
        // Transform students if needed (getLessonStudents returns raw backend data)
        const transformedLessonStudents = enrolledStudentsRaw.map(student => {
          // If student is already transformed (has name, age, etc.), use it as is
          if (student.name && student.age !== undefined) {
            return student;
          }
          // Otherwise transform it
          return transformBackendToStudent(student);
        });
        
        setLessonStudents(transformedLessonStudents || []);

        // Create a set of enrolled student IDs for quick lookup
        // Check both raw and transformed data
        const enrolledStudentIds = new Set();
        enrolledStudentsRaw.forEach(student => {
          // Extract ID from raw backend data
          const rawId = student.id || student.studentId || student.student?.id || student.student?.studentId;
          if (rawId) {
            enrolledStudentIds.add(String(rawId));
          }
          const rawNationalId = student.nationalId || student.student?.nationalId;
          if (rawNationalId && rawNationalId !== '-' && rawNationalId !== '') {
            enrolledStudentIds.add(String(rawNationalId));
          }
        });
        transformedLessonStudents.forEach(student => {
          // Extract ID from transformed data
          const transformedId = student.id || student._backendData?.id || student._backendData?.studentId;
          if (transformedId) {
            enrolledStudentIds.add(String(transformedId));
          }
          const transformedNationalId = student.profile?.tc || student._backendData?.nationalId;
          if (transformedNationalId && transformedNationalId !== '-' && transformedNationalId !== '') {
            enrolledStudentIds.add(String(transformedNationalId));
          }
        });

        console.log('Enrolled student IDs:', Array.from(enrolledStudentIds));

        // Filter group students to only include those enrolled in the lesson
        const filtered = allGroupStudents.filter(groupStudent => {
          const groupStudentId = String(groupStudent.id || '');
          const groupStudentNationalId = String(groupStudent.profile?.tc || groupStudent._backendData?.nationalId || '');
          
          // Check if student ID matches
          if (groupStudentId && enrolledStudentIds.has(groupStudentId)) {
            return true;
          }
          
          // Check if national ID matches
          if (groupStudentNationalId && groupStudentNationalId !== '' && groupStudentNationalId !== '-' && enrolledStudentIds.has(groupStudentNationalId)) {
            return true;
          }
          
          return false;
        });

        console.log(`Filtered students: ${filtered.length} out of ${allGroupStudents.length} group students are enrolled in lesson`);
        setFilteredStudents(filtered);
      } catch (err) {
        console.error('Ders öğrencileri yüklenirken hata:', err);
        setLessonStudents([]);
        setFilteredStudents([]);
      }
    };

    loadAndFilterStudents();
  }, [lesson?.id, lesson?._backendData?.id, allGroupStudents, group]);

  // Update selectedStudent when filteredStudents change
  useEffect(() => {
    if (filteredStudents && filteredStudents.length > 0) {
      // If current selected student is not in the list, select the first one
      if (!selectedStudent || !filteredStudents.find(s => s.id === selectedStudent.id)) {
        setSelectedStudent(filteredStudents[0]);
      }
    } else {
      setSelectedStudent(null);
    }
  }, [filteredStudents]);

  // Function to load attendance percentage
  const loadAttendancePercentage = async (studentId) => {
    if (!studentId || !lesson || !lesson.id) {
      setAttendancePercentage(0);
      return;
    }

    setPercentageLoading(true);
    try {
      const lessonId = lesson.id || lesson._backendData?.id;
      const percentage = await getStudentAttendancePercentage(studentId, lessonId);
      setAttendancePercentage(Math.round(percentage || 0));
    } catch (err) {
      console.error('Katılım yüzdesi yüklenirken hata:', err);
      // Hata durumunda yüzdeyi 0 olarak göster
      setAttendancePercentage(0);
    } finally {
      setPercentageLoading(false);
    }
  };

  // Load attendance percentage when selected student or lesson changes
  useEffect(() => {
    if (selectedStudent?.id && lesson?.id) {
      loadAttendancePercentage(selectedStudent.id);
    } else {
      setAttendancePercentage(0);
    }
  }, [selectedStudent?.id, lesson?.id]);
  
  // Parse initial date from lesson.date or lesson.day, or use today's date
  const parseAttendanceDate = (lessonData) => {
    if (!lessonData) return new Date();
    
    if (lessonData.date) {
      // If it's already a date object
      if (lessonData.date instanceof Date) return lessonData.date;
      // If it's a string, try to parse it
      const parsed = new Date(lessonData.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    
    // If lesson.day is provided (like "Pazartesi"), use today's date as fallback
    // In a real app, you might want to find the next occurrence of that day
    return new Date();
  };
  
  // Use lesson prop for display
  const displayLesson = lesson || {
    name: 'Ders seçilmedi',
    day: '-',
    capacity: '-',
    date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
  };

  const [attendanceDate, setAttendanceDate] = useState(() => parseAttendanceDate(displayLesson));
  
  // Update attendance date when lesson changes
  useEffect(() => {
    if (lesson) {
      const newDate = parseAttendanceDate(lesson);
      setAttendanceDate(newDate);
    }
  }, [lesson?.id]);
  
  const handleAttendanceDateChange = async (date) => {
    setAttendanceDate(date);
    // Tarih değiştiğinde önceki attendance verilerini temizle
    setAttendanceData({});
    setError(null);
    setSuccessMessage(null);
    
    // Yeni tarih için backend'den attendance verilerini getir
    if (!lesson || !lesson.id || !filteredStudents || filteredStudents.length === 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedDate = formatDateForBackend(date);
      if (!formattedDate) {
        setIsLoading(false);
        return;
      }

      const response = await getLessonAttendances(lesson.id, formattedDate);
      
      // Backend response yapısı: { lessonId, students: [{ id, isPresent, ... }] }
      const students = response?.students || response?.Students || [];
      
      // Transform backend data to frontend format
      const attendanceMap = {};
      students.forEach(student => {
        const studentId = student.id || student.Id;
        // Backend'den IsPresent null gelebilir, null olarak tut (gri göstermek için)
        if (studentId) {
          const isPresent = student.isPresent !== undefined 
            ? student.isPresent 
            : (student.IsPresent !== undefined ? student.IsPresent : null);
          attendanceMap[studentId] = isPresent;
        }
      });
      
      // Merge with filtered students - null değerleri koru (gri göstermek için)
      const mergedData = {};
      filteredStudents.forEach(student => {
        mergedData[student.id] = attendanceMap[student.id] !== undefined 
          ? attendanceMap[student.id] 
          : null; // Null olarak tut (henüz kaydedilmemiş)
      });
      
      setAttendanceData(mergedData);
    } catch (err) {
        console.error('Yoklama verileri yüklenirken hata:', err);
        // On error, initialize with null values (gri göstermek için)
        const defaultData = {};
        filteredStudents.forEach(student => {
          defaultData[student.id] = null;
        });
        setAttendanceData(defaultData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSetAttendance = (studentId, isPresent) => {
    // Sadece state'i güncelle, API çağrısı yapma
    // API çağrısı sadece "Kaydet" butonunda yapılacak
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  // Load attendance data when lesson or attendanceDate changes
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!lesson || !lesson.id) {
        // Reset attendance data if no lesson
        setAttendanceData({});
        return;
      }

      if (!filteredStudents || filteredStudents.length === 0) {
        setAttendanceData({});
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Format attendance date for backend
        const formattedDate = formatDateForBackend(attendanceDate);
        
        // Backend'den attendance verilerini getir (tarih parametresi ile)
        const response = await getLessonAttendances(lesson.id, formattedDate);
        
        // Backend response yapısı: { lessonId, students: [{ id, isPresent, ... }] }
        const students = response?.students || response?.Students || [];
        
        // Transform backend data to frontend format
        const attendanceMap = {};
        students.forEach(student => {
          const studentId = student.id || student.Id;
          // Backend'den IsPresent null gelebilir, null olarak tut (gri göstermek için)
          if (studentId) {
            const isPresent = student.isPresent !== undefined 
              ? student.isPresent 
              : (student.IsPresent !== undefined ? student.IsPresent : null);
            attendanceMap[studentId] = isPresent;
          }
        });
        
        // Merge with filtered students - null değerleri koru (gri göstermek için)
        const mergedData = {};
        filteredStudents.forEach(student => {
          mergedData[student.id] = attendanceMap[student.id] !== undefined 
            ? attendanceMap[student.id] 
            : null; // Null olarak tut (henüz kaydedilmemiş)
        });
        
        setAttendanceData(mergedData);
      } catch (err) {
        console.error('Yoklama verileri yüklenirken hata:', err);
        setError(err.message || 'Yoklama verileri yüklenirken bir hata oluştu');
        // On error, initialize with null values (gri göstermek için)
        const defaultData = {};
        filteredStudents.forEach(student => {
          defaultData[student.id] = null;
        });
        setAttendanceData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [lesson?.id, filteredStudents, attendanceDate]);

  const handleSaveAttendance = async () => {
    if (!lesson || !lesson.id) {
      setError('Ders seçilmedi');
      return;
    }

    if (!filteredStudents || filteredStudents.length === 0) {
      setError('Öğrenci listesi boş');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Format attendance date for backend
      const formattedDate = formatDateForBackend(attendanceDate);
      if (!formattedDate) {
        setError('Geçerli bir tarih seçiniz');
        setIsSaving(false);
        return;
      }

      // Prepare attendance data - Backend StudentAttendances bekliyor (camelCase: studentAttendances)
      // Null değerler için default olarak true gönder
      const studentAttendances = filteredStudents.map(student => {
        const isPresent = attendanceData[student.id];
        return {
          studentId: student.id,
          isPresent: isPresent !== null && isPresent !== undefined ? isPresent : true
        };
      });

      const attendancePayload = {
        lessonId: lesson.id,
        attendanceDate: formattedDate,
        studentAttendances: studentAttendances
      };

      const response = await bulkCreateAttendances(attendancePayload);
      
      // Backend'den gelen success mesajını göster
      if (response?.message) {
        setSuccessMessage(response.message);
        // 3 saniye sonra mesajı temizle
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
      
      // Success - refresh attendance percentage for the selected student from backend
      if (selectedStudent?.id && lesson?.id) {
        try {
          await loadAttendancePercentage(selectedStudent.id);
        } catch (percentageError) {
          console.error('Katılım yüzdesi güncellenirken hata:', percentageError);
        }
      }
      
    } catch (err) {
      console.error('Yoklama kaydedilirken hata:', err);
      setError(err.message || 'Yoklama kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (!group) {
    return (
      <section className="dash-right dash-right--attendance">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Grup seçiniz
        </div>
      </section>
    );
  }

  // Helper function to get age range from group (supports both old string format and new object format)
  const getAgeRange = (group) => {
    if (!group) return { minAge: null, maxAge: null };
    
    // Backend'den gelen yeni format (minAge, maxAge)
    if (group.minAge !== undefined && group.maxAge !== undefined) {
      return {
        minAge: group.minAge,
        maxAge: group.maxAge
      };
    }
    
    // Eski format (ageRange string) - backward compatibility
    if (group.ageRange) {
      const match = group.ageRange.match(/(\d+)\s*-\s*(\d+)/);
      if (match) {
        return {
          minAge: parseInt(match[1], 10),
          maxAge: parseInt(match[2], 10)
        };
      }
    }
    
    return { minAge: null, maxAge: null };
  };

  // Helper function to format age range for display
  const formatAgeRange = (group) => {
    const ageRange = getAgeRange(group);
    if (ageRange.minAge !== null && ageRange.maxAge !== null) {
      return `${ageRange.minAge} - ${ageRange.maxAge}`;
    }
    return '';
  };

  const presentCount = Object.values(attendanceData).filter(isPresent => isPresent).length;
  const totalCount = (filteredStudents && filteredStudents.length > 0) ? filteredStudents.length : 0;

  return (
    <section className="dash-right dash-right--attendance">
      <div className="group-header">Grup ve Ders Bilgisi</div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0.5rem 0rem',
        gap: '0rem',
        marginBottom: '1.5rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#ff7b00', fontWeight: '500', whiteSpace: 'nowrap' }}>Grup Adı:</span>
          <span style={{ color: '#1f2937' }}>{group.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#ff7b00', fontWeight: '500', whiteSpace: 'nowrap' }}>Yaş Aralığı:</span>
          <span style={{ color: '#1f2937' }}>{formatAgeRange(group)} Yaş</span>
        </div>
      </div>

      {/* Ders Bilgileri */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0.5rem 0rem',
        gap: '0rem',
        marginBottom: '1.5rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#ff7b00', fontWeight: '500', whiteSpace: 'nowrap' }}>Ders Adı:</span>
          <span style={{ color: '#1f2937' }}>{lesson?.name || 'Ders seçilmedi'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#ff7b00', fontWeight: '500', whiteSpace: 'nowrap' }}>Ders Günü:</span>
          <span style={{ color: '#1f2937' }}>{lesson?.day || '-'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#ff7b00', fontWeight: '500', whiteSpace: 'nowrap' }}>Kapasite:</span>
          <span style={{ color: '#1f2937' }}>{lesson?.capacity || '-'}</span>
        </div>
      </div>

      <div className="lesson-content-wrapper" style={{ display: 'flex', gap: '2rem', marginTop: '2rem', justifyContent: 'space-between' }}>
        {/* Left Side - Student List */}
        <div style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', maxHeight: '450px', minHeight: 0, marginRight: '1rem' }}>
          <h3 style={{ color: '#ff7b00', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '700' }}>
            Öğrenci Listesi
          </h3>
          
          {/* Search Bar */}
          <div className="dash-search-container dash-search-container--attendance">
            <input
              type="text"
              className="dash-search-input dash-search-input--attendance"
              placeholder="Sporcu ara.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="dash-search-icon dash-search-icon--attendance">
              <Search size={20} strokeWidth={2} />
            </div>
          </div>
          
          <div className="attendance-student-list" style={{ 
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: 'transparent',
            flex: '1',
            minHeight: '276px',
            marginTop: '0.5rem',
            paddingRight: '1rem'
          }}>
            {!lesson ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                Lütfen bir ders seçiniz
              </div>
            ) : studentsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                Öğrenciler yükleniyor...
              </div>
            ) : (filteredStudents || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                Bu derse kayıtlı öğrenci bulunamadı
              </div>
            ) : (filteredStudents || [])
              .filter(student => student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                Arama kriterinize uygun öğrenci bulunamadı
              </div>
            ) : (filteredStudents || [])
              .filter(student => student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((student) => {
              const isPresent = attendanceData[student.id];
              // Renk belirleme: true -> yeşil, false -> kırmızı, null/undefined -> gri
              const getIndicatorColor = () => {
                if (isPresent === true) return '#22c55e'; // Yeşil
                if (isPresent === false) return '#ef4444'; // Kırmızı
                return '#9ca3af'; // Gri (null veya undefined)
              };
              
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px 0px',
                    gap: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    transition: 'opacity 0.2s',
                    justifyContent: 'space-between'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: 0 }}>
                    <StudentImage
                      student={student}
                      alt={student.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ff7b00',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '400' }}>
                      {student.name}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      backgroundColor: getIndicatorColor(),
                      flexShrink: 0
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '2rem', gap: '0.5rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textAlign: 'center',
                width: '100%',
                maxWidth: '206px'
              }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textAlign: 'center',
                width: '100%',
                maxWidth: '206px'
              }}>
                {successMessage}
              </div>
            )}
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={isSaving || isLoading || !lesson || !lesson.id}
              style={{
                width: '206px',
                height: '40px',
                backgroundColor: isSaving || isLoading || !lesson || !lesson.id ? '#9ca3af' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSaving || isLoading || !lesson || !lesson.id ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSaving || isLoading || !lesson || !lesson.id ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isSaving && !isLoading && lesson && lesson.id) {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }
              }}
              onMouseOut={(e) => {
                if (!isSaving && !isLoading && lesson && lesson.id) {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }
              }}
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Right Side - Attendance Tracking */}
        <div style={{ width: '419px', height: '331px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 'auto' }}>
          <h3 style={{ color: '#ff7b00', fontSize: '1.25rem', margin: 0, marginBottom: '1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
            Yoklama Bilgisi
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', marginBottom: '1rem' }}>
            <span style={{ color: '#ff7b00', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Yoklama Tarihi:
            </span>
            <DatePicker
              selected={attendanceDate}
              onChange={handleAttendanceDateChange}
              locale="tr"
              dateFormat="dd.MM.yyyy"
              className="attendance-date-picker"
              placeholderText="Tarih seçin"
              showPopperArrow={false}
            />
          </div>

          {selectedStudent && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              backgroundColor: 'transparent',
              height: '100%',
              width: '100%',
              alignItems: 'flex-start',
              marginTop: '5rem'
            }}>
              {/* Student Profile - Horizontal Layout */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <StudentImage
                  student={selectedStudent}
                  alt={selectedStudent.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ff7b00',
                    flexShrink: 0
                  }}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ 
                    color: '#ff7b00', 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {selectedStudent.name}
                  </h4>

                  {/* Attendance Buttons - Side by Side */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSetAttendance(selectedStudent.id, true)}
                        disabled={isSaving || isLoading || !lesson || !lesson.id}
                        style={{
                          padding: '0 24px',
                          backgroundColor: attendanceData[selectedStudent.id] === true ? '#22c55e' : '#f3f4f6',
                          color: attendanceData[selectedStudent.id] === true ? '#fff' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: (isSaving || isLoading || !lesson || !lesson.id) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          width: '121px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (isSaving || isLoading || !lesson || !lesson.id) ? 0.6 : 1
                        }}
                      >
                        Katıldı
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetAttendance(selectedStudent.id, false)}
                        disabled={isSaving || isLoading || !lesson || !lesson.id}
                        style={{
                          padding: '0 24px',
                          backgroundColor: attendanceData[selectedStudent.id] === false ? '#ef4444' : '#f3f4f6',
                          color: attendanceData[selectedStudent.id] === false ? '#fff' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: (isSaving || isLoading || !lesson || !lesson.id) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          width: '121px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: (isSaving || isLoading || !lesson || !lesson.id) ? 0.6 : 1
                        }}
                      >
                        Katılmadı
                      </button>
                    </div>
                    
                    {/* Student Attendance Details Button */}
                    <button
                      type="button"
                      onClick={() => setIsAttendanceModalOpen(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff7b00',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Öğrenciye ait yoklama Bilgileri
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar Section - Extended Horizontal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignSelf: 'flex-start', width: '100%', marginTop: '2.5rem' }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{ color: '#ff7b00', fontSize: '1rem', fontWeight: '500' }}>
                      Antrenman Katılımı %{percentageLoading ? '...' : attendancePercentage}
                    </span>
                  </div>
                  <div style={{ 
                    width: '240px', 
                    height: '12px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${attendancePercentage}%`,
                      height: '100%',
                      backgroundColor: '#ff7b00',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AttendanceInfoModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        student={selectedStudent}
        group={group}
        lesson={lesson}
        attendancePercentage={attendancePercentage}
      />
    </section>
  );
}
