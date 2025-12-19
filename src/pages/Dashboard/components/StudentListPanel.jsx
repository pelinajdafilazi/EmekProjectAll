import React from 'react';
import { MoreVertical } from 'lucide-react';

function StudentAvatar({ photo, name }) {
  return (
    <div className="dash-row__avatar">
      <img src={photo} alt={name} />
    </div>
  );
}

export default function StudentListPanel({ students, selectedId, onSelect }) {
  return (
    <aside className="dash-left">
      <h1 className="dash-left__title">Öğrenci Listesi</h1>

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
        {students.map((s) => {
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


