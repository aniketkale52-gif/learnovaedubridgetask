/* Quick check: Binary search trees, 5 questions, mixing theory, applied and maths.
   Question 4 is the canvas board (Quiz / QuizCorrect / QuizWrong), copied word for word.
   The canvas only designs question 4; the others use the same card: the top panel shows the worked
   step behind each answer (an example, a path or the arithmetic), the label names the answer. */
export interface Option {
  code: string;
  label: string;
}
export interface Question {
  q: string;
  options: Option[];
  answer: number;
  why: string; // shown under "Correct · +10 XP"
  whyWrong: string; // shown under "Not quite. The answer is …"
  hint: string; // mascot poke while answering
  clue: string; // mascot poke after a miss
  tip: string; // mascot poke after a correct answer
}

export const TOPIC = 'Trees';
export const XP_PER_CORRECT = 10;

export const QUESTIONS: Question[] = [
  {
    // theory: the search rule
    q: 'The root is 50. Where does a key of 30 belong?',
    options: [
      { code: '30 < 50\n→ go left', label: 'Left of 50' },
      { code: '30 < 50\n→ go right', label: 'Right of 50' },
      { code: '30 < 50\n→ swap with 50', label: 'In place of 50' },
    ],
    answer: 0,
    why: 'Smaller keys go left. Every key in the left subtree is smaller than the node.',
    whyWrong: 'The search rule: smaller keys go left, larger keys go right. Nothing is ever swapped.',
    hint: 'Hint: is 30 smaller or larger than 50?',
    clue: 'Smaller goes left, larger goes right.',
    tip: 'Smaller left, larger right. Every other question builds on that.',
  },
  {
    // applied: the insert from the lesson
    q: 'The root is 50 and its left child is 30. Where does 42 go?',
    options: [
      { code: '42 < 50 → left\n42 < 30 → left', label: 'Left of 30' },
      { code: '42 < 50 → left\n42 > 30 → right', label: 'Right of 30' },
      { code: '42 > 50 → right', label: 'Right of 50' },
    ],
    answer: 1,
    why: '42 is smaller than 50, so it goes left; it is larger than 30, so it goes right.',
    whyWrong: 'Compare at every step: 42 < 50 goes left, then 42 > 30 goes right.',
    hint: 'Hint: start at the root. Is 42 smaller than 50?',
    clue: 'Check each comparison: is 42 really smaller than 30?',
    tip: 'Insert is just a search that stops at an empty spot.',
  },
  {
    // maths: log n
    q: 'A balanced tree holds 1,000 keys. About how many comparisons does it take to find one?',
    options: [
      { code: 'check every key\n1,000 checks', label: 'About 1,000' },
      { code: 'half the keys\n1,000 ÷ 2', label: 'About 500' },
      { code: '1000 → 500 → 250 …\nhalf each step', label: 'About 10' },
    ],
    answer: 2,
    why: 'Each comparison discards half of what is left, and 2¹⁰ = 1,024, so about 10 steps.',
    whyWrong: 'Each comparison discards half the tree. Halving 1,000 reaches 1 in about 10 steps (2¹⁰ = 1,024).',
    hint: 'Hint: each comparison throws away half of what is left.',
    clue: 'Count the halvings: 1000, 500, 250, 125 …',
    tip: 'Balanced trees are fast because every step halves the work: about log₂ n steps.',
  },
  {
    // code: the canvas board
    q: 'Which structure keeps its keys in sorted order?',
    options: [
      { code: 'items = []\nitems.append(k)', label: 'List' },
      { code: 'tree = BST()\ntree.insert(k)', label: 'Binary search tree' },
      { code: 'table = {}\ntable[k] = v', label: 'Hash map' },
    ],
    answer: 1,
    why: 'Smaller keys go left, so an in-order walk returns them sorted.',
    whyWrong: 'Hash maps find keys fast but store them in no particular order.',
    hint: 'Hint: walk it from left to right. Which one comes out sorted?',
    clue: 'Order is the clue here.',
    tip: 'In-order walk = sorted keys. That is the whole trick.',
  },
  {
    // theory + maths: why balance matters
    q: 'You insert 1, 2, 3, 4, 5 in that order. How many levels tall is the tree?',
    options: [
      { code: 'all five keys\nside by side', label: '1 level' },
      { code: '3 on top,\n2 and 4 under it …', label: '3 levels' },
      { code: '1 → 2 → 3 → 4 → 5\neach one goes right', label: '5 levels' },
    ],
    answer: 2,
    why: "Each key is larger than the last, so every insert goes right: a chain 5 levels tall. That's why balance matters.",
    whyWrong: 'Each key is larger than the last, so every insert goes right and the tree becomes a chain 5 levels tall.',
    hint: 'Hint: where does 2 go after 1? And 3 after 2?',
    clue: 'Follow the inserts one by one: is 2 smaller or larger than 1?',
    tip: 'Sorted input makes a chain. Balanced trees fix that next lesson.',
  },
];
