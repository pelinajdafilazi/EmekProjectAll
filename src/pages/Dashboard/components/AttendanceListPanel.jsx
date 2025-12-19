import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function AttendanceListPanel({ lessons, selectedId, onSelect }) {
  return (
    <aside className="dash-left">
      <h1 className="dash-left__title">Ders Listesi</h1>

      <div className="dash-left__groups">
        <div className="dash-left__groups-title">Gruplar</div>
        <div className="dash-left__group-tabs">
          <button type="button" className="dash-left__tab dash-left__tab--active">
            Tüm Grup
          </button>
          <button type="button" className="dash-left__tab">
            Grup Örnek
          </button>
          <button type="button" className="dash-left__tab">
            Grup Örnek 2
          </button>
          <button type="button" className="dash-left__tab">
            Grup Örnek 3
          </button>
        </div>
      </div>

      <div className="dash-list" role="list">
        {lessons.map((lesson) => {
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
