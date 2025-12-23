import React, { useState } from 'react';
import { Search } from 'lucide-react';
import GroupTable from './GroupTable';
import { mockGroups } from '../../../data/mockGroups';

export default function AttendanceListPanel({ groups, selectedId, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Use provided groups or fall back to mockGroups
  const groupsToDisplay = groups || mockGroups;

  // Filter groups based on search query
  const filteredGroups = groupsToDisplay.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    </aside>
  );
}
