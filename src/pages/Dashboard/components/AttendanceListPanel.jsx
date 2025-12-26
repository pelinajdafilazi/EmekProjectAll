import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import GroupTable from './GroupTable';
import LessonTable from './LessonTable';
import { getLessons } from '../../../services/lessonService';

export default function AttendanceListPanel({ groups, selectedId, onSelect, selectedLessonId, onLessonSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
  const [groupLessons, setGroupLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const selectedGroup = groups.find(g => g.id === selectedId);

  // Load lessonGroupIds from localStorage
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

  // Load all lessons for the selected group
  useEffect(() => {
    const loadGroupLessons = async () => {
      if (!selectedGroup || !selectedGroup.id) {
        setGroupLessons([]);
        return;
      }

      setLessonsLoading(true);
      try {
        const allLessons = await getLessons();
        
        // Filter active lessons only
        const activeLessons = Array.isArray(allLessons) 
          ? allLessons.filter(lesson => lesson.isActive !== false)
          : [];
        
        // Load lessonGroupIds from localStorage
        const lessonGroupIds = loadLessonGroupIdsFromStorage();
        
        // Filter lessons by groupId
        const groupIdStr = String(selectedGroup.id).trim();
        const filteredLessons = activeLessons.filter(backendLesson => {
          const lessonId = backendLesson.id || backendLesson.lessonId;
          const lessonGroupId = backendLesson.groupId 
            || backendLesson.group?.id 
            || (lessonId && lessonGroupIds[lessonId] ? lessonGroupIds[lessonId] : null)
            || backendLesson._backendData?.groupId;
          
          if (!lessonGroupId) {
            return false;
          }
          
          const lessonGroupIdStr = String(lessonGroupId).trim();
          return lessonGroupIdStr === groupIdStr || lessonGroupIdStr.toLowerCase() === groupIdStr.toLowerCase();
        });

        // Transform lessons for display
        const dayMappingEnToTr = {
          'Monday': 'Pazartesi',
          'Tuesday': 'Salı',
          'Wednesday': 'Çarşamba',
          'Thursday': 'Perşembe',
          'Friday': 'Cuma',
          'Saturday': 'Cumartesi',
          'Sunday': 'Pazar'
        };

        const transformedLessons = filteredLessons.map(backendLesson => ({
          id: backendLesson.id || backendLesson.lessonId,
          name: backendLesson.lessonName || backendLesson.name || '-',
          day: dayMappingEnToTr[backendLesson.startingDayOfWeek] || backendLesson.startingDayOfWeek || '-',
          capacity: backendLesson.capacity ? `${backendLesson.currentStudentCount || 0}/${backendLesson.capacity}` : '-',
          _backendData: backendLesson
        }));

        setGroupLessons(transformedLessons);

        // Select first lesson if available and no lesson is selected
        if (transformedLessons.length > 0 && !selectedLessonId && onLessonSelect) {
          onLessonSelect(transformedLessons[0].id);
        }
      } catch (err) {
        console.error('Grup dersleri yüklenirken hata:', err);
        setGroupLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    loadGroupLessons();
  }, [selectedGroup?.id, selectedLessonId, onLessonSelect]);

  // Filter groups based on search query
  const filteredGroups = (groups || []).filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter lessons based on search query
  const filteredLessons = groupLessons.filter(lesson =>
    lesson.name.toLowerCase().includes(lessonSearchQuery.toLowerCase())
  );

  return (
    <aside className="dash-left">
      <h1 className="dash-left__title">Grup Listesi</h1>

      <div className="dash-search-container dash-search-container--attendance">
        <input
          type="text"
          className="dash-search-input dash-search-input--attendance"
          placeholder="Grup Ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="dash-search-icon dash-search-icon--attendance">
          <Search size={20} strokeWidth={2} />
        </div>
      </div>

      <GroupTable
        groups={filteredGroups}
        selectedId={selectedId}
        onSelect={onSelect}
        interactive={true}
      />

      {/* Ders Listesi */}
      {selectedGroup && (
        <>
          <h1 className="dash-left__title" style={{ marginTop: '2rem' }}>Ders Listesi</h1>

          <div className="dash-search-container dash-search-container--attendance">
            <input
              type="text"
              className="dash-search-input dash-search-input--attendance"
              placeholder="Ders Ara..."
              value={lessonSearchQuery}
              onChange={(e) => setLessonSearchQuery(e.target.value)}
            />
            <div className="dash-search-icon dash-search-icon--attendance">
              <Search size={20} strokeWidth={2} />
            </div>
          </div>

          {lessonsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              Dersler yükleniyor...
            </div>
          ) : filteredLessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              {lessonSearchQuery ? 'Ders bulunamadı' : 'Bu grup için ders bulunamadı'}
            </div>
          ) : (
            <LessonTable
              lessons={filteredLessons}
              selectedId={selectedLessonId}
              onSelect={onLessonSelect}
              interactive={true}
            />
          )}
        </>
      )}
    </aside>
  );
}
