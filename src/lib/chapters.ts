export const CHAPTERS: Record<string, string[]> = {
  Bangla: ['গদ্য', 'কবিতা', 'ব্যাকরণ', 'রচনা'],
  English: ['Reading', 'Grammar', 'Writing', 'Translation'],
  Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
  'General Science': ['Matter', 'Energy', 'Life Science', 'Environment'],
  ICT: ['Computer Basics', 'Programming Basics', 'Networking', 'Database'],
  'Physics 1st': ['Physical World', 'Vectors', 'Motion', 'Newtonian Mechanics', 'Work Energy', 'Waves'],
  'Physics 2nd': ['Thermodynamics', 'Electricity', 'Magnetism', 'Optics', 'Modern Physics'],
  'Chemistry 1st': ['Atomic Structure', 'Periodic Table', 'Chemical Bonding', 'Mole Concept'],
  'Chemistry 2nd': ['Organic Chemistry', 'Electrochemistry', 'Chemical Kinetics', 'Industrial Chemistry'],
  'Biology 1st': ['Cell Biology', 'Cell Division', 'Microorganism', 'Plant Physiology'],
  'Biology 2nd': ['Human Physiology', 'Genetics', 'Evolution', 'Ecology'],
  'Higher Math 1st': ['Matrix', 'Straight Line', 'Circle', 'Trigonometry', 'Functions'],
  'Higher Math 2nd': ['Complex Number', 'Polynomial', 'Calculus', 'Statics', 'Dynamics'],
  Accounting: ['Accounting Principles', 'Journal', 'Ledger', 'Trial Balance'],
  Finance: ['Financial System', 'Time Value of Money', 'Risk and Return'],
  'Business Organization': ['Business Basics', 'Entrepreneurship', 'Marketing', 'Management'],
  Programming: ['C Basics', 'Control Flow', 'Functions', 'Arrays', 'Problem Solving'],
  'Data Structures': ['Array', 'Stack', 'Queue', 'Linked List', 'Tree', 'Graph'],
  Database: ['SQL Basics', 'Normalization', 'ER Diagram', 'Transactions']
};

export const getChaptersForSubject = (subject: string) => CHAPTERS[subject] || ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Revision'];
