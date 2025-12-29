import React from 'react';
import GroupTable from './GroupTable';

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

      <GroupTable
        groups={groups}
        selectedId={selectedId}
        onSelect={onSelect}
        interactive={true}
      />
    </aside>
  );
}