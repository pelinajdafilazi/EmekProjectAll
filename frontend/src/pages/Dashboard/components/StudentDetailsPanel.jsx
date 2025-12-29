import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import StudentImage from './StudentImage';
import { getLessons, getLessonStudents } from '../../../services/lessonService';
import { getStudentAttendancePercentage } from '../../../services/attendanceService';

function ProfileAvatar({ student, name }) {
  return (
    <div className="dash-profile">
      <div className="dash-profile__avatar">
        <div className="dash-profile__avatarInner">
          <StudentImage 
            student={student} 
            alt={name} 
            style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} 
          />
        </div>
      </div>
      <div className="dash-profile__name">{name}</div>
    </div>
  );
}

function InfoGrid({ profile }) {
  const gridRows = [
    [
      { label: 'T.C. Kimlik No', value: profile?.tc || '—' },
      { label: 'Okul İsmi', value: profile?.school || '—' },
    ],
    [
      { label: 'Doğum Tarihi', value: profile?.dob || '—' },
      { label: 'Sınıf No', value: profile?.grade || '—' },
    ],
    [
      { label: 'Sporcu Cep', value: profile?.phone || '—' },
      { label: 'Branşı', value: profile?.branch || '—' },
    ],
  ];

  return (
    <div className="dash-info">
      {gridRows.map((rowPair, idx) => (
        <div key={idx} className="dash-info__grid-row">
          <div className="dash-info__label">{rowPair[0].label}</div>
          <div className="dash-info__value">{rowPair[0].value}</div>
          <div className="dash-info__label">{rowPair[1].label}</div>
          <div className="dash-info__value">{rowPair[1].value}</div>
        </div>
      ))}
      <div className="dash-info__address-row">
        <span className="dash-info__address-label">Adres</span>
        <span className="dash-info__address-value">{profile?.address || '—'}</span>
      </div>
    </div>
  );
}

function ParentsCard({ mother, father }) {
  return (
    <>
      <div className="dash-parents">
        <div className="dash-parents__col">
          <div className="dash-parents__header">Anne Bilgileri</div>
          <div className="dash-parents__body">
            <div className="dash-parents__row">
              <div className="dash-parents__label">Ad Soyad</div>
              <div className="dash-parents__value">{mother?.name || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">T.C. Kimlik No</div>
              <div className="dash-parents__value">{mother?.tc || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Mesleği</div>
              <div className="dash-parents__value">{mother?.occupation || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Cep Tel No</div>
              <div className="dash-parents__value">{mother?.phone || '—'}</div>
            </div>
          </div>
        </div>
        <div className="dash-parents__divider" />
        <div className="dash-parents__col">
          <div className="dash-parents__header">Baba Bilgileri</div>
          <div className="dash-parents__body">
            <div className="dash-parents__row">
              <div className="dash-parents__label">Ad Soyad</div>
              <div className="dash-parents__value">{father?.name || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">T.C. Kimlik No</div>
              <div className="dash-parents__value">{father?.tc || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Mesleği</div>
              <div className="dash-parents__value">{father?.occupation || '—'}</div>
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Cep Tel No</div>
              <div className="dash-parents__value">{father?.phone || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RelativesCard({ title, relatives = [] }) {
  if (!relatives || relatives.length === 0) {
    return (
      <div className="dash-rel">
        <div className="dash-rel__title">{title}</div>
        <div className="dash-rel__cols">
          <div className="dash-rel__col">
            <div className="dash-rel__header">Yakın Bilgisi Yok</div>
            <div className="dash-rel__body">
              <div className="dash-rel__field">
                <div className="dash-rel__value" style={{ gridColumn: '1 / -1', justifyContent: 'center', padding: '20px' }}>
                  Kayıtlı yakın bilgisi bulunmamaktadır.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-rel">
      <div className="dash-rel__title">{title}</div>
      <div className="dash-rel__cols" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {relatives.map((relative, index) => (
          <div key={index} className="dash-rel__col">
            <div className="dash-rel__header">{relative.relationType || `Yakın ${index + 1}`}</div>
            <div className="dash-rel__body">
              <div className="dash-rel__field">
                <div className="dash-rel__label">Ad Soyad</div>
                <div className="dash-rel__value">{relative.name || '—'}</div>
              </div>
              <div className="dash-rel__field">
                <div className="dash-rel__label">T.C. Kimlik No</div>
                <div className="dash-rel__value">{relative.tc || '—'}</div>
              </div>
              {relative.phone && relative.phone !== '-' && (
                <div className="dash-rel__field">
                  <div className="dash-rel__label">Cep Tel No</div>
                  <div className="dash-rel__value">{relative.phone}</div>
                </div>
              )}
              {relative.occupation && relative.occupation !== '-' && (
                <div className="dash-rel__field">
                  <div className="dash-rel__label">Mesleği</div>
                  <div className="dash-rel__value">{relative.occupation}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentDetailsPanel({ student, loading = false }) {
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [percentageLoading, setPercentageLoading] = useState(false);

  // Load attendance percentage for student across all lessons
  useEffect(() => {
    const loadAttendancePercentage = async () => {
      if (!student?.id) {
        setAttendancePercentage(0);
        return;
      }

      setPercentageLoading(true);
      try {
        // Get all lessons
        const allLessons = await getLessons();
        
        // Find lessons where this student is enrolled
        const studentLessons = [];
        for (const lesson of allLessons) {
          try {
            const lessonStudents = await getLessonStudents(lesson.id || lesson.lessonId);
            const isEnrolled = lessonStudents.some(ls => {
              const studentId = ls.id || ls._backendData?.id;
              return String(studentId) === String(student.id);
            });
            if (isEnrolled) {
              studentLessons.push(lesson);
            }
          } catch (error) {
            // Skip lesson if error (e.g., 404)
            console.warn(`Lesson ${lesson.id} öğrencileri yüklenirken hata:`, error);
          }
        }

        // Calculate attendance percentage for each lesson and get average
        if (studentLessons.length === 0) {
          setAttendancePercentage(0);
          return;
        }

        const percentages = [];
        for (const lesson of studentLessons) {
          try {
            const lessonId = lesson.id || lesson.lessonId;
            const percentage = await getStudentAttendancePercentage(student.id, lessonId);
            if (percentage !== null && percentage !== undefined && !isNaN(percentage)) {
              percentages.push(percentage);
            }
          } catch (error) {
            console.warn(`Öğrenci ${student.id} için ders ${lesson.id} yüzdesi hesaplanırken hata:`, error);
          }
        }

        // Calculate average percentage
        if (percentages.length > 0) {
          const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
          setAttendancePercentage(Math.round(average));
        } else {
          setAttendancePercentage(0);
        }
      } catch (error) {
        console.error('Katılım yüzdesi yüklenirken hata:', error);
        setAttendancePercentage(0);
      } finally {
        setPercentageLoading(false);
      }
    };

    loadAttendancePercentage();
  }, [student?.id]);

  if (loading) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Yükleniyor...
        </div>
      </section>
    );
  }
  
  if (!student) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
          Öğrenci seçiniz
        </div>
      </section>
    );
  }

  const name = student?.name || '—';
  const parents = student?.parents || {};
  const relatives = Array.isArray(student?.relatives) ? student.relatives : [];
  const training = attendancePercentage; // Use calculated attendance percentage
  
  // Use the same paymentStatus logic as PaymentListPanel
  const paymentStatus = student?.paymentStatus || 'unpaid'; // 'paid', 'unpaid'

  const getPaymentButtonClass = () => {
    return paymentStatus === 'paid' 
      ? 'dash-paid dash-paid--green' 
      : 'dash-paid dash-paid--red';
  };

  const getPaymentButtonText = () => {
    return paymentStatus === 'paid' 
      ? 'Ödeme Yapıldı' 
      : 'Ödeme Yapılmadı';
  };

  return (
    <section className="dash-right">
      <div className="dash-top">
        <ProfileAvatar student={student} name={name} />
        <div className="dash-top__info">
          <InfoGrid profile={student?.profile} />
        </div>
      </div>

      <ParentsCard mother={parents.mother} father={parents.father} />

      <div className="dash-scrollable">
        <RelativesCard title="Yakın Listesi" relatives={relatives} />
      </div>

      <div className="dash-bottom">
        <div className="dash-attendance">
          <div className="dash-attendance__bar-wrapper">
            <div className="dash-attendance__label">
              Antrenman Katılımı %{percentageLoading ? '...' : training}
            </div>
            <div className="dash-attendance__bar-container">
              <div className="dash-attendance__bar">
                <div className="dash-attendance__fill" style={{ width: `${training}%` }} />
              </div>
              <ChevronDown size={14} className="dash-attendance__chevron-icon" />
            </div>
          </div>
        </div>

        <button type="button" className={getPaymentButtonClass()}>
          {getPaymentButtonText()}
        </button>
      </div>
    </section>
  );
}


