import React from 'react';

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

export default function GroupTable({ groups, selectedId, onSelect, interactive = true }) {
  return (
    <>
      <div className="groups-table__header">
        <div className="groups-table__cell--header">Grup Adı</div>
        <div className="groups-table__cell--header">Yaş Aralığı</div>
      </div>

      <div className="dash-list dash-list--groups" role="list">
        {groups.map((group) => {
          const active = interactive && group.id === selectedId;
          return (
            <button
              key={group.id}
              type="button"
              className={`dash-row dash-row--groups ${active ? 'dash-row--active' : ''}`}
              onClick={() => interactive && onSelect?.(group.id)}
              disabled={!interactive}
              style={!interactive ? { cursor: 'default' } : {}}
            >
              <div className="dash-row__name">{group.name}</div>
              <div className="dash-row__meta">{formatAgeRange(group)}</div>
              <div className="dash-row__indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </>
  );
}

