import React, { useState } from 'react';
import DashboardNavbar from './components/DashboardNavbar';
import GroupListPanel from './components/GroupListPanel';
import GroupDetailsPanel from './components/GroupDetailsPanel';
import { mockGroups, mockGroupStudents } from '../../data/mockGroups';

export default function GroupsPage({ onNavigate }) {
  const [selectedGroupId, setSelectedGroupId] = useState('1');

  const selectedGroup = mockGroups.find(g => g.id === selectedGroupId);
  const groupStudents = mockGroupStudents[selectedGroupId] || [];

  return (
    <div className="dash">
      <DashboardNavbar activeItem="Gruplar" onNavigate={onNavigate} />
      <div className="dash__body">
        <GroupListPanel
          groups={mockGroups}
          selectedId={selectedGroupId}
          onSelect={setSelectedGroupId}
        />
        <GroupDetailsPanel
          group={selectedGroup}
          students={groupStudents}
        />
      </div>
    </div>
  );
}