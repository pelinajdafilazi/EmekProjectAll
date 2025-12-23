import React, { useState, useEffect } from 'react';
import * as GroupService from '../../../services/groupService';

function StudentAvatar({ photo, name }) {
  return (
    <div className="dash-row__avatar">
      <img src={photo} alt={name} />
    </div>
  );
}

export default function StudentListPanel({ students, selectedId, onSelect, loading, groups = [] }) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(null); // null = Tüm Grup
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [groupStudentsMap, setGroupStudentsMap] = useState(new Map()); // Grup ID -> Öğrenci ID'leri

  // Gruplardaki öğrencileri yükle
  useEffect(() => {
    const loadGroupStudents = async () => {
      const map = new Map();
      
      for (const group of groups) {
        try {
          const groupStudents = await GroupService.getGroupStudents(group.id);
          // Öğrenci ID'lerini Set'e ekle (hem id hem de nationalId'yi kontrol et)
          const studentIds = new Set();
          groupStudents.forEach(student => {
            if (student.id) {
              studentIds.add(String(student.id));
            }
            if (student.profile?.tc && student.profile.tc !== '-') {
              studentIds.add(String(student.profile.tc));
            }
            if (student._backendData?.id) {
              studentIds.add(String(student._backendData.id));
            }
            if (student._backendData?.nationalId) {
              studentIds.add(String(student._backendData.nationalId));
            }
          });
          map.set(group.id, studentIds);
        } catch (error) {
          console.error(`Grup ${group.id} öğrencileri yüklenirken hata:`, error);
        }
      }
      
      setGroupStudentsMap(map);
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

      <div className="dash-list" role="list">
        {filteredStudents.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              className={`dash-row ${active ? 'dash-row--active' : ''}`}
              onClick={() => onSelect?.(s.id)}
            >
              <StudentAvatar photo={s.photo} name={s.name} />
              <div className="dash-row__name">{s.name}</div>
              <div className="dash-row__meta">{s.age}</div>
              <div className="dash-row__meta dash-row__meta--wide">{s.team}</div>
              <div className="dash-row__meta">{s.birthDate}</div>
              <div className="dash-row__meta dash-row__meta--attendance">{s.attendance}</div>
              <div className="dash-row__indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}


