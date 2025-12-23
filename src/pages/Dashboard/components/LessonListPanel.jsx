import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function LessonListPanel({ lessons, selectedId, onSelect, onAddClick, groups = [], lessonGroupIds = {} }) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(null); // null = Tüm Grup
  const [filteredLessons, setFilteredLessons] = useState(lessons);

  // Dersleri grup filtresine göre filtrele
  useEffect(() => {
    if (!selectedGroupFilter) {
      // Tüm Grup seçiliyse tüm dersleri göster
      setFilteredLessons(lessons);
    } else {
      // Seçili gruba ait dersleri filtrele
      const filtered = lessons.filter(lesson => {
        // Dersin grup ID'sini kontrol et - önce lesson'dan, sonra backend data'dan, sonra savedGroupIds'den
        const lessonId = lesson.lessonId || lesson.id;
        const lessonGroupId = lesson.groupId 
          || lesson._backendData?.groupId 
          || (lessonId ? lessonGroupIds[lessonId] : null);
        
        // String karşılaştırması yap (ID'ler farklı tiplerde olabilir)
        if (!lessonGroupId) {
          return false; // Grup ID yoksa filtreleme dışında bırak
        }
        
        const lessonGroupIdStr = String(lessonGroupId).trim();
        const filterGroupIdStr = String(selectedGroupFilter).trim();
        
        return lessonGroupIdStr === filterGroupIdStr || lessonGroupIdStr.toLowerCase() === filterGroupIdStr.toLowerCase();
      });
      
      console.log('Filtered lessons for group:', {
        selectedGroupFilter,
        totalLessons: lessons.length,
        filteredCount: filtered.length,
        filteredLessons: filtered.map(l => ({ id: l.id, name: l.name, groupId: l.groupId }))
      });
      
      setFilteredLessons(filtered);
    }
  }, [selectedGroupFilter, lessons, lessonGroupIds]);

  const handleGroupFilterClick = (groupId) => {
    setSelectedGroupFilter(groupId);
  };

  return (
    <aside className="dash-left">
      <h1 className="dash-left__title">Ders Listesi</h1>

      <button 
        type="button" 
        className="groups-add-btn"
        onClick={onAddClick}
      >
        DERS EKLE
      </button>

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
        {filteredLessons.map((lesson) => {
          const active = lesson.id === selectedId;
          return (
            <button
              key={lesson.id}
              type="button"
              className={`dash-row ${active ? 'dash-row--active' : ''}`}
              onClick={() => onSelect?.(lesson.id)}
            >
              <div className="dash-row__name">{lesson.name}</div>
              <div className="dash-row__meta dash-row__meta--wide">{lesson.group}</div>
              <div className="dash-row__meta">{lesson.day}</div>
              <div className="dash-row__meta">{lesson.time}</div>
              <div className="dash-row__meta dash-row__meta--attendance">{lesson.capacity}</div>
              <div className="dash-row__menu">
                <MoreVertical size={16} strokeWidth={2.5} />
              </div>
              <div className="dash-row__indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
