import React from 'react';
import { MoreVertical } from 'lucide-react';

// Helper function to format age range for display
const formatAgeRange = (group) => {
  // Backend'den gelen yeni format (minAge, maxAge)
  if (group.minAge !== undefined && group.maxAge !== undefined) {
    return `${group.minAge} - ${group.maxAge}`;
  }
  // Eski format (ageRange string) - backward compatibility
  if (group.ageRange) {
    return group.ageRange;
  }
  return '';
};

export default function GroupListPanel({ groups, selectedId, onSelect, onAddClick, loading }) {
  return (
    <aside className="dash-left">
      <h1 className="dash-left__title">Grup Listesi</h1>

      <button 
        type="button" 
        className="groups-add-btn"
        onClick={onAddClick}
      >
        GRUP EKLE
      </button>

      <div className="groups-table__header">
        <div className="groups-table__cell--header">Grup Adı</div>
        <div className="groups-table__cell--header">Yaş Aralığı</div>
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
              <div className="dash-row__meta">{formatAgeRange(group)}</div>
              <div className="dash-row__menu">
                <MoreVertical size={16} strokeWidth={2.5} />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}