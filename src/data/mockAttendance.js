// Mock attendance data - organized by group ID

// Lesson data for each group
export const mockAttendanceLessonsByGroup = {
  '1': {
    id: 'lesson-1',
    name: 'Futbol Antrenmanı',
    day: 'Pazartesi',
    time: '14:00',
    capacity: '30',
    date: '23.12.2024'
  },
  '2': {
    id: 'lesson-2',
    name: 'Teknik Çalışma',
    day: 'Salı',
    time: '16:00',
    capacity: '25',
    date: '24.12.2024'
  },
  '3': {
    id: 'lesson-3',
    name: 'Kondisyon Antrenmanı',
    day: 'Çarşamba',
    time: '15:00',
    capacity: '28',
    date: '25.12.2024'
  },
  '4': {
    id: 'lesson-4',
    name: 'Taktik Antrenmanı',
    day: 'Perşembe',
    time: '17:00',
    capacity: '30',
    date: '26.12.2024'
  },
  '5': {
    id: 'lesson-5',
    name: 'Maç Hazırlık',
    day: 'Cuma',
    time: '14:30',
    capacity: '32',
    date: '27.12.2024'
  }
};

// Students for each group
export const mockAttendanceStudentsByGroup = {
  '1': [
    {
      id: 's1-g1',
      name: 'Ahmet Yılmaz',
      age: 12,
      team: 'U13 Takımı',
      birthDate: '15.03.2012',
      attendance: 9,
      jerseyNumber: '10',
      photo: '/avatars/group-student-1.svg',
      isPresent: true
    },
    {
      id: 's2-g1',
      name: 'Mehmet Demir',
      age: 13,
      team: 'U13 Takımı',
      birthDate: '22.05.2011',
      attendance: 8,
      jerseyNumber: '7',
      photo: '/avatars/group-student-2.svg',
      isPresent: true
    },
    {
      id: 's3-g1',
      name: 'Ali Kaya',
      age: 12,
      team: 'U13 Takımı',
      birthDate: '10.09.2012',
      attendance: 7,
      jerseyNumber: '15',
      photo: '/avatars/group-student-3.svg',
      isPresent: false
    },
    {
      id: 's4-g1',
      name: 'Can Arslan',
      age: 13,
      team: 'U13 Takımı',
      birthDate: '05.01.2011',
      attendance: 10,
      jerseyNumber: '9',
      photo: '/avatars/group-student-4.svg',
      isPresent: true
    }
  ],
  '2': [
    {
      id: 's1-g2',
      name: 'Zeynep Aydın',
      age: 11,
      team: 'U12 Takımı',
      birthDate: '18.07.2013',
      attendance: 9,
      jerseyNumber: '11',
      photo: '/avatars/group-student-1.svg',
      isPresent: true
    },
    {
      id: 's2-g2',
      name: 'Elif Özkan',
      age: 10,
      team: 'U12 Takımı',
      birthDate: '25.11.2014',
      attendance: 8,
      jerseyNumber: '5',
      photo: '/avatars/group-student-2.svg',
      isPresent: true
    },
    {
      id: 's3-g2',
      name: 'Ayşe Çelik',
      age: 11,
      team: 'U12 Takımı',
      birthDate: '14.04.2013',
      attendance: 9,
      jerseyNumber: '8',
      photo: '/avatars/group-student-3.svg',
      isPresent: true
    }
  ],
  '3': [
    {
      id: 's1-g3',
      name: 'Burak Şahin',
      age: 14,
      team: 'U15 Takımı',
      birthDate: '08.02.2010',
      attendance: 10,
      jerseyNumber: '4',
      photo: '/avatars/group-student-1.svg',
      isPresent: true
    },
    {
      id: 's2-g3',
      name: 'Emre Yıldız',
      age: 15,
      team: 'U15 Takımı',
      birthDate: '30.06.2009',
      attendance: 9,
      jerseyNumber: '6',
      photo: '/avatars/group-student-2.svg',
      isPresent: false
    },
    {
      id: 's3-g3',
      name: 'Cem Öztürk',
      age: 14,
      team: 'U15 Takımı',
      birthDate: '12.10.2010',
      attendance: 8,
      jerseyNumber: '12',
      photo: '/avatars/group-student-3.svg',
      isPresent: true
    },
    {
      id: 's4-g3',
      name: 'Kerem Avcı',
      age: 15,
      team: 'U15 Takımı',
      birthDate: '19.08.2009',
      attendance: 9,
      jerseyNumber: '3',
      photo: '/avatars/group-student-4.svg',
      isPresent: true
    },
    {
      id: 's5-g3',
      name: 'Deniz Polat',
      age: 14,
      team: 'U15 Takımı',
      birthDate: '27.12.2010',
      attendance: 7,
      jerseyNumber: '14',
      photo: '/avatars/group-student-5.svg',
      isPresent: true
    }
  ],
  '4': [
    {
      id: 's1-g4',
      name: 'Selin Yurt',
      age: 13,
      team: 'U14 Takımı',
      birthDate: '11.03.2011',
      attendance: 10,
      jerseyNumber: '2',
      photo: '/avatars/group-student-1.svg',
      isPresent: true
    },
    {
      id: 's2-g4',
      name: 'Eda Erdem',
      age: 13,
      team: 'U14 Takımı',
      birthDate: '19.11.2011',
      attendance: 9,
      jerseyNumber: '13',
      photo: '/avatars/group-student-2.svg',
      isPresent: true
    }
  ],
  '5': [
    {
      id: 's1-g5',
      name: 'Onur Taş',
      age: 12,
      team: 'U13 Takımı',
      birthDate: '21.05.2012',
      attendance: 8,
      jerseyNumber: '16',
      photo: '/avatars/group-student-1.svg',
      isPresent: false
    },
    {
      id: 's2-g5',
      name: 'Berk Kılıç',
      age: 12,
      team: 'U13 Takımı',
      birthDate: '03.09.2012',
      attendance: 9,
      jerseyNumber: '18',
      photo: '/avatars/group-student-2.svg',
      isPresent: true
    },
    {
      id: 's3-g5',
      name: 'Kaan Aksoy',
      age: 13,
      team: 'U13 Takımı',
      birthDate: '16.01.2011',
      attendance: 10,
      jerseyNumber: '1',
      photo: '/avatars/group-student-3.svg',
      isPresent: true
    }
  ]
};
