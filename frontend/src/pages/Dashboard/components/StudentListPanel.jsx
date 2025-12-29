import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { FaPencil } from "react-icons/fa6";
import * as GroupService from '../../../services/groupService';
import { StudentService } from '../../../services/studentService';
import StudentImage from './StudentImage';

function StudentAvatar({ student, name }) {
  return (
    <div className="dash-row__avatar">
      <StudentImage student={student} alt={name} />
    </div>
  );
}

export default function StudentListPanel({ students, selectedId, onSelect, loading, groups = [], onStudentDeleted, onStudentUpdated }) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(null); // null = Tüm Grup
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [groupStudentsMap, setGroupStudentsMap] = useState(new Map()); // Grup ID -> Öğrenci ID'leri
  const [studentGroupMap, setStudentGroupMap] = useState(new Map()); // Öğrenci ID -> Grup adı
  const [deletingStudentId, setDeletingStudentId] = useState(null);

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
  };

  const handleDeleteClick = async (e, studentId) => {
    e.stopPropagation(); // Row click event'ini engelle
    
    const confirmed = window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?');
    if (!confirmed) {
      return;
    }

    setDeletingStudentId(studentId);
    try {
      await StudentService.deleteStudent(studentId);
      // Silme başarılı, parent component'e bildir
      if (onStudentDeleted) {
        onStudentDeleted(studentId);
      }
    } catch (error) {
      alert('Öğrenci silinirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      console.error('Öğrenci silme hatası:', error);
    } finally {
      setDeletingStudentId(null);
    }
  };


  return (
    <aside className="dash-left">
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

      <div className="dash-list dash-list--students" role="list">
        {filteredStudents.map((s) => {
          const active = s.id === selectedId;
          // Öğrencinin hangi grupta olduğunu bul
          const studentId = String(s.id || '');
          const studentNationalId = String(s.profile?.tc || s._backendData?.nationalId || '');
          const studentGroup = studentGroupMap.get(studentId) || 
                              (studentNationalId !== '' ? studentGroupMap.get(studentNationalId) : null) ||
                              '-';
          // Branş bilgisini al
          const studentBranch = s.team || s.branch || s.profile?.branch || s._backendData?.branch || '-';
          
          return (
            <div
              key={s.id}
              className={`dash-row-wrapper ${active ? 'dash-row--active' : ''}`}
            >
              <button
                type="button"
                className={`dash-row ${active ? 'dash-row--active' : ''}`}
                onClick={() => onSelect?.(s.id)}
              >
                <StudentAvatar student={s} name={s.name} />
                <div className="dash-row__name">{s.name}</div>
                <div className="dash-row__meta">{studentGroup}</div>
                <div className="dash-row__meta">{studentBranch}</div>
                <div className="dash-row__meta">{s.age || '-'}</div>
                <div className="dash-row__indicator" aria-hidden="true" />
              </button>
              <div className="dash-row__actions">
                <button
                  type="button"
                  className="dash-row__action-btn dash-row__action-btn--delete"
                  onClick={(e) => handleDeleteClick(e, s.id)}
                  disabled={deletingStudentId === s.id}
                  title="Sil"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}


