import React, { useState, useEffect } from 'react';
import DashboardNavbar from './components/DashboardNavbar';
import GroupListPanel from './components/GroupListPanel';
import GroupDetailsPanel from './components/GroupDetailsPanel';
import AddGroupModal from './components/AddGroupModal';
import { useGroups } from '../../context/GroupContext';

export default function GroupsPage({ onNavigate }) {
  const { state, actions } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load groups on mount (only once)
  useEffect(() => {
    if (isInitialLoad) {
      actions.loadGroups();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, actions]);

  // Set first group as selected when groups are loaded
  useEffect(() => {
    if (state.groups.length > 0 && !selectedGroupId) {
      const firstGroup = state.groups[0];
      setSelectedGroupId(firstGroup.id);
      actions.selectGroup(firstGroup);
    }
  }, [state.groups, selectedGroupId, actions]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    const group = state.groups.find(g => g.id === groupId);
    if (group) {
      actions.selectGroup(group);
    }
  };

  const selectedGroup = state.groups.find(g => g.id === selectedGroupId);
  const groupStudents = selectedGroupId ? (state.students[selectedGroupId] || []) : [];

  return (
    <div className="dash">
      <DashboardNavbar activeItem="Gruplar" onNavigate={onNavigate} />
      <div className="dash__body">
        <GroupListPanel
          groups={state.groups}
          selectedId={selectedGroupId}
          onSelect={handleSelectGroup}
          onAddClick={() => setIsAddModalOpen(true)}
          loading={state.loading}
        />
        <GroupDetailsPanel
          group={selectedGroup}
          students={groupStudents}
        />
        <AddGroupModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </div>
  );
}