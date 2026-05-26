export const SUBJECTS = {
  school: {
    common: ['Bangla', 'English', 'Mathematics', 'General Science', 'ICT', 'Religion', 'Health Protection']
  },
  hsc: {
    science: ['Physics 1st', 'Physics 2nd', 'Chemistry 1st', 'Chemistry 2nd', 'Biology 1st', 'Biology 2nd', 'Higher Math 1st', 'Higher Math 2nd', 'ICT'],
    commerce: ['Accounting', 'Finance', 'Business Organization', 'Economics', 'ICT'],
    arts: ['History', 'Civics', 'Geography', 'Logic', 'Social Work', 'ICT']
  },
  university: {
    cse: ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Operating System', 'Software Engineering'],
    eee: ['Circuit Analysis', 'Electronics', 'Signals', 'Power System'],
    bba: ['Accounting', 'Marketing', 'Management', 'Finance', 'Business Communication']
  }
} as const;

export const getSubjectsForProfile = (level?: string) => {
  const normalized = (level || '').toLowerCase();
  if (normalized.includes('college') || normalized.includes('hsc') || normalized.includes('inter')) {
    return [...SUBJECTS.hsc.science, ...SUBJECTS.hsc.commerce, ...SUBJECTS.hsc.arts.filter((subject) => subject !== 'ICT')];
  }
  if (normalized.includes('university')) {
    return [...SUBJECTS.university.cse, ...SUBJECTS.university.eee, ...SUBJECTS.university.bba];
  }
  return SUBJECTS.school.common;
};
