import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import { ChevronDown } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import * as GroupService from '../../../services/groupService';
import StudentImage from './StudentImage';

registerLocale('tr', tr);

function StudentAvatar({ student, name }) {
  return (
    <div className="dash-row__avatar">
      <StudentImage student={student} alt={name} />
    </div>
  );
}

export default function PaymentListPanel({ students, selectedId, onSelect, groups = [], loading = false, onDateChange, onGeneralClick }) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(null); // null = Tüm Grup
  const [selectedDate, setSelectedDate] = useState(new Date()); // Seçilen tarih
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [groupStudentsMap, setGroupStudentsMap] = useState(new Map()); // Grup ID -> Öğrenci ID'leri
  const [studentGroupMap, setStudentGroupMap] = useState(new Map()); // Öğrenci ID -> Grup adı

  // Gruplardaki öğrencileri yükle
  useEffect(() => {
    const loadGroupStudents = async () => {
      const groupToStudentsMap = new Map(); // Grup ID -> Öğrenci ID'leri Set
      const studentToGroupMap = new Map(); // Öğrenci ID -> Grup adı
      
      for (const group of groups) {
        try {
          const groupStudents = await GroupService.getGroupStudents(group.id);
          // Öğrenci ID'lerini Set'e ekle (hem id hem de nationalId'yi kontrol et)
          const studentIds = new Set();
          groupStudents.forEach(student => {
            const studentId = student.id || student._backendData?.id;
            const studentNationalId = student.profile?.tc || student._backendData?.nationalId;
            
            if (studentId) {
              studentIds.add(String(studentId));
              // Öğrenci ID -> Grup adı mapping'i oluştur
              studentToGroupMap.set(String(studentId), group.name);
            }
            if (studentNationalId && studentNationalId !== '-') {
              studentIds.add(String(studentNationalId));
              // National ID -> Grup adı mapping'i oluştur
              studentToGroupMap.set(String(studentNationalId), group.name);
            }
            if (student._backendData?.id) {
              studentIds.add(String(student._backendData.id));
              studentToGroupMap.set(String(student._backendData.id), group.name);
            }
            if (student._backendData?.nationalId) {
              studentIds.add(String(student._backendData.nationalId));
              studentToGroupMap.set(String(student._backendData.nationalId), group.name);
            }
          });
          groupToStudentsMap.set(group.id, studentIds);
        } catch (error) {
          console.error(`Grup ${group.id} öğrencileri yüklenirken hata:`, error);
        }
      }
      
      setGroupStudentsMap(groupToStudentsMap);
      setStudentGroupMap(studentToGroupMap);
    };

    if (groups.length > 0) {
      loadGroupStudents();
    }
  }, [groups]);

  // Öğrencileri grup filtresine göre filtrele
  useEffect(() => {
    if (!selectedGroupFilter) {
      // Tüm Grup seçiliyse tüm öğrencileri göster
      setFilteredStudents(students);
    } else {
      // Seçili gruba kayıtlı öğrencileri filtrele
      const groupStudentIds = groupStudentsMap.get(selectedGroupFilter);
      if (groupStudentIds) {
        const filtered = students.filter(student => {
          const studentId = String(student.id || '');
          const studentNationalId = String(student.profile?.tc || student._backendData?.nationalId || '');
          return groupStudentIds.has(studentId) || 
                 (studentNationalId !== '' && groupStudentIds.has(studentNationalId));
        });
        setFilteredStudents(filtered);
      } else {
        // Grup öğrencileri henüz yüklenmediyse tüm öğrencileri göster
        setFilteredStudents(students);
      }
    }
  }, [selectedGroupFilter, students, groupStudentsMap]);

  const handleGroupFilterClick = (groupId) => {
    setSelectedGroupFilter(groupId);
    // Tarih ve grup değiştiğinde parent component'e bildir
    if (onDateChange) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // JavaScript'te ay 0-11, backend'de 1-12
      // Tüm Grup seçildiyse null gönder (backend tüm gruplar için veri dönecek)
      onDateChange(groupId, year, month);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Tarih değiştiğinde parent component'e bildir
    if (onDateChange) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript'te ay 0-11, backend'de 1-12
      // selectedGroupFilter null ise tüm gruplar için veri çekilecek
      onDateChange(selectedGroupFilter, year, month);
    }
  };

  return (
    <aside className="dash-left dash-left--payment">
      <h1 className="dash-left__title">Öğrenci Listesi</h1>

      {loading && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
          Yükleniyor...
        </div>
      )}

      <div className="dash-left__groups">
        <div className="dash-left__groups-title">Gruplar</div>
        <div className="dash-left__group-tabs">
          <button 
            type="button" 
            className={`dash-left__tab ${selectedGroupFilter === null ? 'dash-left__tab--active' : ''}`}
            onClick={() => handleGroupFilterClick(null)}
          >
            Tüm Grup
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={`dash-left__tab ${selectedGroupFilter === group.id ? 'dash-left__tab--active' : ''}`}
              onClick={() => handleGroupFilterClick(group.id)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-left__months">
        <label className="dash-left__date-label">Tarih Seç</label>
        <div className="dash-left__date-picker-wrapper">
          <ChevronDown size={16} className="dash-left__date-picker-icon" />
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            locale="tr"
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            placeholderText="Tarih seçin"
            className="dash-left__date-picker"
          />
        </div>
        <button
          type="button"
          className="dash-left__general-btn"
          onClick={onGeneralClick}
        >
          Toplam Borca Göre Listele
        </button>
      </div>

      <div className="dash-list dash-list--payment" role="list">
        {filteredStudents.map((s) => {
          const active = s.id === selectedId;
          const paymentStatus = s.paymentStatus || 'unpaid'; // 'paid', 'unpaid'
          
          return (
            <button
              key={s.id}
              type="button"
              className={`dash-row dash-row--payment ${active ? 'dash-row--active' : ''}`}
              onClick={() => onSelect?.(s.id)}
            >
              <StudentAvatar photo={s.photo} name={s.name} />
              <div className="dash-row__name">{s.name}</div>
              <div 
                className={`dash-row__payment-status ${
                  paymentStatus === 'paid' 
                    ? 'dash-row__payment-status--paid' 
                    : 'dash-row__payment-status--unpaid'
                }`}
              >
                {paymentStatus === 'paid' ? 'Ödeme Yapıldı' : 'Ödeme Yapılmadı'}
              </div>
              <div className="dash-row__indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
