// Mock attendance data

export const mockAttendanceLessons = [
  { id: '1', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '14:00', capacity: '25/30' },
  { id: '2', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '16:00', capacity: '25/30' },
  { id: '3', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '10:00', capacity: '25/30' },
  { id: '4', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '15:30', capacity: '25/30' },
  { id: '5', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '13:00', capacity: '25/30' },
  { id: '6', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '17:00', capacity: '25/30' },
  { id: '7', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '11:00', capacity: '25/30' },
  { id: '8', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '09:00', capacity: '25/30' },
  { id: '9', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '18:00', capacity: '25/30' },
  { id: '10', name: 'Örnek Ders', group: 'Örnek Grup', day: 'Çarşamba', time: '12:00', capacity: '25/30' }
];

export const mockAttendanceDetails = {
  '1': {
    id: '1',
    name: 'Örnek Ders',
    groupName: 'Örnek Grup',
    day: 'Çarşamba',
    time: '14:00',
    capacity: '30',
    date: '25.12.2024'
  }
};

export const mockAttendanceStudents = {
  '1': [
    {
      id: 's1',
      name: 'Eda Erdem',
      age: 26,
      team: 'A Milli Yıldızlar',
      birthDate: '19.11.2001',
      attendance: 9,
      photo: '/avatars/group-student-1.svg',
      isPresent: true
    },
    {
      id: 's2',
      name: 'Eda Erdem',
      age: 26,
      team: 'A Milli Yıldızlar',
      birthDate: '19.11.2001',
      attendance: 9,
      photo: '/avatars/group-student-2.svg',
      isPresent: true
    },
    {
      id: 's3',
      name: 'Eda Erdem',
      age: 26,
      team: 'A Milli Yıldızlar',
      birthDate: '19.11.2001',
      attendance: 9,
      photo: '/avatars/group-student-3.svg',
      isPresent: false
    },
    {
      id: 's4',
      name: 'Eda Erdem',
      age: 26,
      team: 'A Milli Yıldızlar',
      birthDate: '19.11.2001',
      attendance: 9,
      photo: '/avatars/group-student-4.svg',
      isPresent: true
    },
    {
      id: 's5',
      name: 'Eda Erdem',
      age: 26,
      team: 'A Milli Yıldızlar',
      birthDate: '19.11.2001',
      attendance: 9,
      photo: '/avatars/group-student-5.svg',
      isPresent: true
    },
    {
      id: 's6',
      name: 'Eda Erdem',
      age: 26,
      team: 'A Milli Yıldızlar',
      birthDate: '19.11.2001',
      attendance: 9,
      photo: '/avatars/group-student-6.svg',
      isPresent: true
    }
  ]
};
