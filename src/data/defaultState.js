/**
 * Default State for Ultimate Student OS
 * Contains starter data for competitive exam preparation (PCM, JEE, NDA).
 * ALL data is editable, deletable, and customizable by the student.
 */

export const DEFAULT_STATE = {
  profile: {
    name: 'Arjun Sharma',
    targetExam: 'JEE / NDA 2026',
    targetDate: '2026-05-24',
    dailyTargetHours: 3.0
  },
  timer: {
    activePreset: '25/5',
    presets: {
      '25/5': { work: 25, shortBreak: 5, longBreak: 15 },
      '50/10': { work: 50, shortBreak: 10, longBreak: 20 },
      '90/15': { work: 90, shortBreak: 15, longBreak: 30 },
      'custom': { work: 25, shortBreak: 5, longBreak: 15 }
    },
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true
  },
  metrics: {
    todayFocusMinutes: 45,
    todayCompletedSessions: 2,
    studyStreakDays: 12,
    lastStudyDate: new Date().toISOString().split('T')[0],
    deepWorkMinutesTotal: 30,
    history: [
      { date: '2026-09-01', minutes: 120, sessions: 4 },
      { date: '2026-09-02', minutes: 150, sessions: 5 },
      { date: '2026-09-03', minutes: 180, sessions: 6 },
      { date: '2026-09-04', minutes: 90, sessions: 3 },
      { date: '2026-09-05', minutes: 160, sessions: 5 },
      { date: '2026-09-06', minutes: 45, sessions: 2 }
    ]
  },
  // Dynamic Tasks
  tasks: [
    { id: 'task-1', title: 'Physics — Current Electricity Numerical Practice', subject: 'Physics', completed: true, priority: 'High', date: new Date().toISOString().split('T')[0] },
    { id: 'task-2', title: 'Chemistry — Organic Reaction Mechanisms Note Review', subject: 'Chemistry', completed: true, priority: 'Medium', date: new Date().toISOString().split('T')[0] },
    { id: 'task-3', title: 'Maths — Integration by Parts 15 PYQ Problems', subject: 'Maths', completed: false, priority: 'High', date: new Date().toISOString().split('T')[0] },
    { id: 'task-4', title: 'Revision — Laws of Motion Spaced Flashcards', subject: 'Physics', completed: false, priority: 'Urgent', date: new Date().toISOString().split('T')[0] }
  ],
  // Dynamic Goals
  goals: [
    {
      id: 'goal-1',
      title: 'Complete Rotational Dynamics & 50 PYQs',
      exam: 'JEE Advanced',
      targetDate: '2026-10-15',
      priority: 'High',
      dailyTarget: '2 hrs',
      progress: 75,
      description: 'Finish all advanced numericals on Moment of Inertia, Rolling Motion, and Angular Momentum.'
    },
    {
      id: 'goal-2',
      title: 'Weekly Target: 21 Hours Total Focus Time',
      exam: 'General Focus',
      targetDate: '2026-09-12',
      priority: 'Medium',
      dailyTarget: '3 hrs',
      progress: 78,
      description: 'Maintain consistency and log at least 3 hours deep work per day.'
    },
    {
      id: 'goal-3',
      title: 'Organic Chemistry: Complete Reaction Mechanisms',
      exam: 'JEE / NDA',
      targetDate: '2026-11-01',
      priority: 'High',
      dailyTarget: '1.5 hrs',
      progress: 45,
      description: 'Master electrophilic addition, nucleophilic substitution, and elimination reactions.'
    }
  ],
  // Dynamic Syllabus Tree
  syllabus: [
    {
      id: 'subj-physics',
      name: 'Physics',
      color: '#06b6d4',
      badgeClass: 'badge-physics',
      chapters: [
        {
          id: 'phys-chap-1',
          name: 'Laws of Motion & Work Energy',
          topics: [
            { id: 'top-p1', name: "Newton's Laws of Motion", completed: true, difficulty: 'Medium', priority: 'High', notes: 'Review friction and pseudo-force problems', lastStudied: '2026-09-02' },
            { id: 'top-p2', name: 'Work, Energy & Power', completed: true, difficulty: 'Medium', priority: 'High', notes: 'Work-energy theorem with conservative forces', lastStudied: '2026-09-03' },
            { id: 'top-p3', name: 'Circular Motion & Centripetal Forces', completed: true, difficulty: 'Hard', priority: 'High', notes: 'Banking of roads and vertical loop dynamics', lastStudied: '2026-09-04' }
          ]
        },
        {
          id: 'phys-chap-2',
          name: 'Current Electricity & Magnetism',
          topics: [
            { id: 'top-p4', name: "Ohm's Law & Kirchhoff's Rules", completed: true, difficulty: 'Easy', priority: 'Medium', notes: 'Loop rule sign conventions', lastStudied: '2026-09-05' },
            { id: 'top-p5', name: 'Wheatstone Bridge & Potentiometer', completed: false, difficulty: 'Medium', priority: 'High', notes: 'Standard laboratory numericals', lastStudied: null },
            { id: 'top-p6', name: 'Magnetic Force & Biot-Savart Law', completed: false, difficulty: 'Hard', priority: 'High', notes: 'Right hand thumb rule applications', lastStudied: null }
          ]
        }
      ]
    },
    {
      id: 'subj-chemistry',
      name: 'Chemistry',
      color: '#10b981',
      badgeClass: 'badge-chemistry',
      chapters: [
        {
          id: 'chem-chap-1',
          name: 'Chemical Bonding & Molecular Structure',
          topics: [
            { id: 'top-c1', name: 'VSEPR Theory & Molecular Geometry', completed: true, difficulty: 'Medium', priority: 'High', notes: 'Bond angles and lone pair repulsions', lastStudied: '2026-09-01' },
            { id: 'top-c2', name: 'Hybridization & Resonance', completed: true, difficulty: 'Hard', priority: 'High', notes: 'sp, sp2, sp3d hybridization shapes', lastStudied: '2026-09-04' },
            { id: 'top-c3', name: 'Molecular Orbital Theory (MOT)', completed: false, difficulty: 'Hard', priority: 'High', notes: 'Bond order formulas for O2, N2, CO', lastStudied: null }
          ]
        },
        {
          id: 'chem-chap-2',
          name: 'Organic Reactions & Mechanisms',
          topics: [
            { id: 'top-c4', name: 'Inductive, Resonance & Hyperconjugation', completed: true, difficulty: 'Easy', priority: 'Medium', notes: 'Carbocation stability orders', lastStudied: '2026-09-03' },
            { id: 'top-c5', name: 'SN1 and SN2 Reaction Pathways', completed: false, difficulty: 'Hard', priority: 'High', notes: 'Solvent effects and stereochemical inversion', lastStudied: null }
          ]
        }
      ]
    },
    {
      id: 'subj-maths',
      name: 'Mathematics',
      color: '#8b5cf6',
      badgeClass: 'badge-maths',
      chapters: [
        {
          id: 'math-chap-1',
          name: 'Integral Calculus',
          topics: [
            { id: 'top-m1', name: 'Indefinite Integration Formulas', completed: true, difficulty: 'Medium', priority: 'High', notes: 'Standard trigonometric substitution', lastStudied: '2026-09-02' },
            { id: 'top-m2', name: 'Integration by Parts & Partial Fractions', completed: true, difficulty: 'Hard', priority: 'High', notes: 'ILATE rule exceptions', lastStudied: '2026-09-05' },
            { id: 'top-m3', name: 'Definite Integrals & King Property', completed: false, difficulty: 'Hard', priority: 'High', notes: 'Symmetric bounds properties', lastStudied: null }
          ]
        },
        {
          id: 'math-chap-2',
          name: 'Coordinate Geometry & Vectors',
          topics: [
            { id: 'top-m4', name: 'Straight Lines & Pair of Lines', completed: true, difficulty: 'Easy', priority: 'Medium', notes: 'Distance between parallel lines', lastStudied: '2026-09-01' },
            { id: 'top-m5', name: 'Vector Dot and Cross Products', completed: false, difficulty: 'Medium', priority: 'High', notes: 'Geometric interpretation of scalar triple product', lastStudied: null }
          ]
        }
      ]
    }
  ],
  // Dynamic Revision Queue
  revisions: [
    {
      id: 'rev-1',
      topic: 'Laws of Motion',
      subject: 'Physics',
      difficulty: 'Medium',
      intervalDays: 7,
      revisionCount: 3,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      notes: 'Review free body diagrams on inclined planes'
    },
    {
      id: 'rev-2',
      topic: 'Chemical Bonding & VSEPR',
      subject: 'Chemistry',
      difficulty: 'Medium',
      intervalDays: 3,
      revisionCount: 2,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      notes: 'Recall lone pair bond angle variations'
    },
    {
      id: 'rev-3',
      topic: 'Integration Formulas',
      subject: 'Maths',
      difficulty: 'Hard',
      intervalDays: 1,
      revisionCount: 1,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      notes: 'Active recall for inverse trigonometric forms'
    },
    {
      id: 'rev-4',
      topic: 'Work Energy Theorem',
      subject: 'Physics',
      difficulty: 'Easy',
      intervalDays: 14,
      revisionCount: 4,
      dueDate: '2026-09-12',
      completed: false,
      notes: 'Potential energy graphs and equilibrium points'
    }
  ],
  // Dynamic Quiz History & Question Bank
  quiz: {
    history: [
      { id: 'qh-1', title: 'Physics Mechanics Mock', subject: 'Physics', score: 18, total: 20, accuracy: 90, date: '2026-09-04', timeTakenSec: 840 },
      { id: 'qh-2', title: 'Chemical Bonding Rapid Test', subject: 'Chemistry', score: 14, total: 20, accuracy: 70, date: '2026-09-05', timeTakenSec: 720 },
      { id: 'qh-3', title: 'Integration & Calculus Test', subject: 'Maths', score: 17, total: 20, accuracy: 85, date: '2026-09-06', timeTakenSec: 900 }
    ],
    weakTopics: ['Chemistry — Molecular Orbital Theory', 'Maths — Definite Integral Bounds', 'Physics — Centripetal Pseudo Forces'],
    strongTopics: ['Physics — Kinematics', 'Maths — Indefinite Integration', 'Chemistry — VSEPR Geometry']
  },
  // Dynamic Flashcards
  flashcards: [
    { id: 'fc-1', question: "What is Lenz's Law of Electromagnetic Induction?", answer: "The direction of induced current is always such that it opposes the change in magnetic flux that produces it.", subject: 'Physics', chapter: 'Electromagnetism', difficulty: 'Medium', learned: true },
    { id: 'fc-2', question: "State Heisenberg's Uncertainty Principle formula.", answer: "Δx · Δp ≥ h / (4π) where Δx is position uncertainty and Δp is momentum uncertainty.", subject: 'Physics', chapter: 'Modern Physics', difficulty: 'Hard', learned: false },
    { id: 'fc-3', question: "What are Markovnikov's and Anti-Markovnikov's rules?", answer: "In addition of HX to alkene, H attaches to carbon with more H (Markovnikov). In presence of peroxide, H attaches to carbon with fewer H (Anti-Markovnikov).", subject: 'Chemistry', chapter: 'Organic Chemistry', difficulty: 'Medium', learned: true },
    { id: 'fc-4', question: "What is the King Property of Definite Integrals?", answer: "∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx.", subject: 'Maths', chapter: 'Calculus', difficulty: 'Medium', learned: true }
  ],
  // Dynamic Study Resources
  resources: [
    { id: 'res-1', title: 'H.C. Verma Concepts of Physics Vol 1 & 2 Solutions', type: 'Notes', subject: 'Physics', url: 'https://example.com/hcv-solutions', description: 'Comprehensive worked numerical solutions.', favorite: true, tags: ['HCV', 'Mechanics', 'JEE'] },
    { id: 'res-2', title: 'JEE Advanced 10-Year Chapterwise PYQ Archive', type: 'PYQ', subject: 'Maths', url: 'https://example.com/jee-pyq', description: 'Past examination questions categorized by topic.', favorite: true, tags: ['PYQ', 'Calculus', 'Advanced'] },
    { id: 'res-3', title: 'Organic Chemistry Complete Mechanism Flowchart PDF', type: 'Formula Sheet', subject: 'Chemistry', url: 'https://example.com/organic-flowchart', description: 'One-page overview of SN1, SN2, E1, E2 pathways.', favorite: false, tags: ['Organic', 'Mechanisms'] }
  ]
};
