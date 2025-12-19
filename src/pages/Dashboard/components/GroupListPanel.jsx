import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function GroupListPanel({ groups, selectedId, onSelect }) {
  return (
    <aside className="dash-left">
      <h1 className="dash-left__title">Grup Listesi</h1>

      <button type="button" className="groups-add-btn">
        GRUP EKLE
      </button>

      <div className="dash-left__groups">
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
        {groups.map((group) => {
          const active = group.id === selectedId;
          return (
            <button
              key={group.id}
              type="button"
              className={`dash-row dash-row--groups ${active ? 'dash-row--active' : ''}`}
              onClick={() => onSelect?.(group.id)}
            >
              <div className="dash-row__name">{group.name}</div>
              <div className="dash-row__meta">{group.ageRange}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}