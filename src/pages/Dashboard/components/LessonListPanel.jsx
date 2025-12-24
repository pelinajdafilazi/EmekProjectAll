import React, { useState, useEffect } from 'react';

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

      <div className="dash-list dash-list--lessons" role="list">
        {filteredLessons.map((lesson) => {
          const active = lesson.id === selectedId;
          
          // Backend'den gelen saat bilgilerini formatla
          // startingHour ve endingHour direkt olarak kullan
          const formatTimeDisplay = (time) => {
            if (!time || time === '-') return '-';
            // Eğer HH:mm:ss formatındaysa sadece HH:mm'i al
            if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
              return time.substring(0, 5);
            }
            // Eğer zaten HH:mm formatındaysa olduğu gibi döndür
            return time;
          };
          
          const startTime = formatTimeDisplay(lesson.startingHour || lesson._backendData?.startingHour || '-');
          const endTime = formatTimeDisplay(lesson.endingHour || lesson._backendData?.endingHour || '-');
          
          // Ders adı - backend'den lessonName veya name
          const lessonName = lesson.name || lesson._backendData?.lessonName || '-';
          
          // Başlangıç günü - backend'den startingDayOfWeek
          const startingDay = lesson.day || lesson._backendData?.startingDayOfWeek || '-';
          
          // Başlangıç ve bitiş saatlerini birleştir
          const timeRange = startTime !== '-' && endTime !== '-' 
            ? `${startTime} - ${endTime}` 
            : (startTime !== '-' ? startTime : (endTime !== '-' ? endTime : '-'));
          
          // Grup adını bul - önce lesson.group'dan, yoksa groupId'den groups listesinde ara
          let groupName = lesson.group || '-';
          if (groupName === '-' || groupName === 'Grup Bulunamadı' || groupName === 'Grup Yükleniyor...') {
            // Grup ID'sini al
            const lessonId = lesson.lessonId || lesson.id;
            const lessonGroupId = lesson.groupId 
              || lesson._backendData?.groupId 
              || (lessonId ? lessonGroupIds[lessonId] : null);
            
            // Grup listesinden grup adını bul
            if (lessonGroupId && groups && groups.length > 0) {
              const lessonGroupIdStr = String(lessonGroupId).trim();
              const foundGroup = groups.find(g => {
                const gIdStr = String(g.id).trim();
                return gIdStr === lessonGroupIdStr || gIdStr.toLowerCase() === lessonGroupIdStr.toLowerCase();
              });
              
              if (foundGroup) {
                groupName = foundGroup.name;
              }
            }
          }
          
          return (
            <button
              key={lesson.id}
              type="button"
              className={`dash-row dash-row--lessons ${active ? 'dash-row--active' : ''}`}
              onClick={() => onSelect?.(lesson.id)}
            >
              <div className="dash-row__name">{lessonName}</div>
              <div className="dash-row__meta">{groupName}</div>
              <div className="dash-row__meta">{startingDay}</div>
              <div className="dash-row__meta">{timeRange}</div>
              <div className="dash-row__meta dash-row__meta--attendance">{lesson.capacity || '-'}</div>
              <div className="dash-row__indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
