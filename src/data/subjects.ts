/* One template, one entry per dashboard course card (canvas SubjectView renderVals, copied as-is).
   Data Structures links into the Module and Lesson; the other three stay on their own page. */
export type ItemState = 'done' | 'current' | 'next' | 'locked';

export interface Subject {
  id: string;
  course: string;
  card: { status: string; time?: string; done: number; total: number }; // only the up-next card has a time pill
  courseHref?: string;
  nextHref?: string;
  lockedHref?: string;
  moduleLabel: string;
  moduleName: string;
  doneLabel: string;
  doneTopics: string;
  later: [string, string][];
  goal: number;
  goalHint: string;
  items: [ItemState, string, string][];
  teacher: string;
  teacherImg: string;
  learners: string;
  tree?: boolean;
  now: string;
  dur: string;
  chapters: [string, string][];
  transcript: [string, string][];
  notes: [string, string][];
  files: [string, string][];
}

export const SUBJECTS: Subject[] = [
  {
    id: 'dsa', course: 'Data Structures in Python', card: { status: 'Up next', time: 'Quiz Thu', done: 11, total: 18 },
    courseHref: '/module', nextHref: '/lesson', lockedHref: '/module?locked=1',
    moduleLabel: 'Module 3', moduleName: 'Trees', doneLabel: 'Modules 1–2', doneTopics: 'Arrays, linked lists', later: [['Module 4', 'Graphs'], ['Module 5', 'Hashing']],
    goal: 1, goalHint: 'Finish this video and the quick check to hit it.',
    items: [['done', 'What is a tree?', 'Video · 12 min'], ['done', 'Binary trees and traversal', 'Reading · 16 min'], ['done', 'Recursion on trees', 'Video · 14 min'], ['current', 'Binary search trees', 'Video · 11 min'], ['next', 'Try it: insert a key', 'Interactive · 6 min'], ['locked', 'Quick check', 'Quiz · 5 questions · after the video']],
    teacher: 'Prof. Mehta', teacherImg: '/images/teacher1.jpg', learners: '2.1k', tree: true, now: '4:12', dur: '11:48',
    chapters: [['0:00', 'The search rule'], ['2:05', 'Finding a key'], ['4:12', 'Inserting a key'], ['8:30', 'Why balance matters']],
    transcript: [['2:05', 'To find a key, start at the root and compare. Smaller goes left, larger goes right.'], ['4:12', 'Inserting works the same way. Walk down until you hit an empty spot, then place the new key there.'], ['5:40', "Let's insert 42. It's smaller than 50, so we go left; it's larger than 30, so we go right."], ['8:30', "If keys arrive already sorted, the tree becomes a line. That's why balance matters."]],
    notes: [['2:05', 'Search: smaller goes left, larger goes right. About log n steps when the tree is balanced.'], ['0:48', 'Rule for every node: everything on the left is smaller, everything on the right is larger.']],
    files: [['MP4 · 84 MB', 'Lecture video (720p)'], ['PDF · 2.4 MB', 'Slides: binary search trees'], ['PY · 3 KB', 'bst.py starter code'], ['TXT · English', 'Transcript']],
  },
  {
    id: 'stats', course: 'Probability and Statistics', card: { status: 'In progress', done: 4, total: 24 },
    moduleLabel: 'Module 2', moduleName: 'Probability rules', doneLabel: 'Module 1', doneTopics: 'Counting and chance', later: [['Module 3', 'Random variables'], ['Module 4', 'Distributions']],
    goal: 0, goalHint: 'Finish this video to get today started.',
    items: [['done', 'Conditional probability', 'Video · 10 min'], ['current', "Bayes' theorem", 'Video · 13 min'], ['next', 'Try it: a medical test', 'Interactive · 8 min'], ['locked', 'Quick check', 'Quiz · 5 questions · after the video']],
    teacher: 'Dr. Iyer', teacherImg: '/images/teacher2.jpg', learners: '3.4k', now: '6:05', dur: '13:20',
    chapters: [['0:00', 'Flipping the question'], ['3:10', 'Prior and evidence'], ['6:05', 'The formula'], ['10:15', 'A medical test']],
    transcript: [['3:10', "Before any test you already have a belief. That's the prior."], ['6:05', "Bayes' theorem updates that belief with evidence: the likelihood times the prior, scaled by how common the evidence is."], ['8:20', 'Written down: P(A|B) = P(B|A) × P(A) / P(B).'], ['10:15', 'Now a test that is 99% accurate, for a disease 1 in 1,000 people have.']],
    notes: [['3:10', 'Prior = what I believe before seeing any data.'], ['1:20', 'P(A|B) is not P(B|A). The order matters.']],
    files: [['MP4 · 96 MB', 'Lecture video (720p)'], ['PDF · 1.8 MB', "Slides: Bayes' theorem"], ['IPYNB · 12 KB', 'bayes.ipynb notebook'], ['TXT · English', 'Transcript']],
  },
  {
    id: 'web', course: 'Web Development with React', card: { status: 'In progress', done: 13, total: 16 },
    moduleLabel: 'Module 4', moduleName: 'State and effects', doneLabel: 'Modules 1–3', doneTopics: 'JSX, components, props', later: [['Module 5', 'Routing'], ['Project', 'Capstone app']],
    goal: 2, goalHint: 'One more item to hit today’s goal.',
    items: [['done', 'useState basics', 'Video · 9 min'], ['done', 'Lifting state up', 'Reading · 12 min'], ['current', 'useEffect and cleanup', 'Video · 14 min'], ['next', 'Try it: fetch on mount', 'Interactive · 10 min'], ['locked', 'Quick check', 'Quiz · 5 questions · after the video']],
    teacher: 'Dr. Kapoor', teacherImg: '/images/teacher3.jpg', learners: '5.8k', now: '9:40', dur: '14:05',
    chapters: [['0:00', 'What an effect is'], ['3:30', 'The dependency array'], ['7:15', 'Fetching data'], ['9:40', 'Cleaning up']],
    transcript: [['7:15', "An effect runs after React paints. That's where you fetch data."], ['8:50', 'With an empty dependency array it runs once, when the component mounts.'], ['9:40', 'Return a function from the effect to clean up: cancel the request or remove the listener.'], ['11:30', 'Without cleanup, a fast typist fires ten requests and can see the wrong result last.']],
    notes: [['3:30', 'Every value the effect reads goes in the dependency array.'], ['1:05', 'Effects sync with things outside React. Derived values are just variables.']],
    files: [['MP4 · 102 MB', 'Lecture video (720p)'], ['PDF · 2.1 MB', 'Slides: effects'], ['ZIP · 48 KB', 'effects-demo starter code'], ['TXT · English', 'Transcript']],
  },
  {
    id: 'writing', course: 'Technical Writing for Engineers', card: { status: 'In progress', done: 5, total: 12 },
    moduleLabel: 'Module 3', moduleName: 'Docs that get read', doneLabel: 'Modules 1–2', doneTopics: 'Audience, plain language', later: [['Module 4', 'Design docs'], ['Module 5', 'Release notes']],
    goal: 1, goalHint: 'Finish this video and the exercise to hit it.',
    items: [['done', 'Write for a reader in a hurry', 'Video · 8 min'], ['current', 'Structuring a README', 'Video · 11 min'], ['next', 'Try it: fix a README', 'Interactive · 12 min'], ['locked', 'Quick check', 'Quiz · 5 questions · after the video']],
    teacher: 'Prof. Das', teacherImg: '/images/teacher4.jpg', learners: '1.6k', now: '2:40', dur: '11:10',
    chapters: [['0:00', 'What a README is for'], ['2:40', 'The first screen'], ['5:30', 'Install and quick start'], ['8:45', 'When to link out']],
    transcript: [['0:50', 'Most people read a README for under a minute. Plan for that.'], ['2:40', "The first screen says what it is, who it's for, and how to try it."], ['4:10', 'Right after that, the one command that gets someone running.'], ['5:30', 'Install steps come next, tested on a clean machine.']],
    notes: [['0:50', 'Readers skim: lead with what it does, not its history.'], ['1:30', 'Use the headings people search for: Install, Usage, Contributing.']],
    files: [['MP4 · 70 MB', 'Lecture video (720p)'], ['PDF · 1.2 MB', 'Slides: README anatomy'], ['MD · 2 KB', 'README template'], ['TXT · English', 'Transcript']],
  },
];

export const subjectById = (id: string | undefined) => SUBJECTS.find((s) => s.id === id);
