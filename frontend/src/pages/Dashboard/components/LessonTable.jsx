import React from 'react';

export default function LessonTable({ lessons, selectedId, onSelect, interactive = true }) {
  return (
    <>
      <div className="groups-table__header" style={{ gridTemplateColumns: '150px 100px 80px', maxWidth: '330px' }}>
        <div className="groups-table__cell--header">Ders Adı</div>
        <div className="groups-table__cell--header">Ders Günü</div>
        <div className="groups-table__cell--header">Kapasite</div>
      </div>

      <div className="dash-list" role="list">
        {lessons.map((lesson) => {
          const active = interactive && String(lesson.id) === String(selectedId);
          return (
            <button
              key={lesson.id}
              type="button"
              className={`dash-row dash-row--groups ${active ? 'dash-row--active' : ''}`}
              onClick={() => interactive && onSelect?.(lesson.id)}
              disabled={!interactive}
              style={!interactive ? { cursor: 'default' } : { 
                gridTemplateColumns: '150px 100px 80px',
                maxWidth: '330px',
                width: 'fit-content'
              }}
            >
              <div className="dash-row__name">{lesson.name}</div>
              <div className="dash-row__meta">{lesson.day}</div>
              <div className="dash-row__meta">{lesson.capacity}</div>
              <div className="dash-row__indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </>
  );
}

