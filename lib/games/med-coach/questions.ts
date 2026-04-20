export interface Question {
  id: number
  text: string
  options: string[]
  correct: number // index
  topic: string
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'sleep',
    text: 'How many hours of sleep per night do adults typically need for optimal cognitive function?',
    options: ['4–5 hours', '6–7 hours', '7–9 hours', '10–12 hours'],
    correct: 2,
  },
  {
    id: 2,
    topic: 'exercise',
    text: 'Which type of exercise is most beneficial for maintaining brain volume in older adults?',
    options: ['Stretching only', 'Aerobic exercise', 'Weightlifting only', 'Yoga only'],
    correct: 1,
  },
  {
    id: 3,
    topic: 'nutrition',
    text: 'Which nutrient deficiency is most commonly linked to cognitive decline?',
    options: ['Vitamin C', 'Vitamin B12', 'Calcium', 'Vitamin D only'],
    correct: 1,
  },
  {
    id: 4,
    topic: 'attention',
    text: 'A consistent routine of which activity helps improve sustained attention in daily life?',
    options: [
      'Watching TV',
      'Mindfulness meditation',
      'Social media browsing',
      'Napping frequently',
    ],
    correct: 1,
  },
  {
    id: 5,
    topic: 'vision',
    text: 'How often should adults over 40 have a comprehensive eye examination?',
    options: ['Every 5 years', 'Only when symptoms arise', 'Every 1–2 years', 'Every 10 years'],
    correct: 2,
  },
  {
    id: 6,
    topic: 'memory',
    text: 'Which lifestyle habit has the strongest evidence for reducing dementia risk?',
    options: [
      'Frequent vitamins',
      'Regular physical activity',
      'Crossword puzzles only',
      'Low-carb diet only',
    ],
    correct: 1,
  },
  {
    id: 7,
    topic: 'stress',
    text: 'Chronic stress primarily impairs memory by damaging which brain structure?',
    options: ['Cerebellum', 'Hippocampus', 'Medulla', 'Corpus callosum'],
    correct: 1,
  },
  {
    id: 8,
    topic: 'sleep',
    text: 'During which sleep stage does the brain consolidate memories most effectively?',
    options: ['Stage 1 (light sleep)', 'Stage 2', 'REM sleep', 'Deep sleep only'],
    correct: 2,
  },
  {
    id: 9,
    topic: 'vision',
    text: 'Which symptom is an early warning sign of glaucoma?',
    options: ['Central vision loss', 'Loss of peripheral vision', 'Double vision', 'Eye redness'],
    correct: 1,
  },
  {
    id: 10,
    topic: 'nutrition',
    text: 'The Mediterranean diet is associated with reduced cognitive decline mainly because of its high content of:',
    options: [
      'Red meat',
      'Processed grains',
      'Omega-3 fatty acids & antioxidants',
      'Saturated fats',
    ],
    correct: 2,
  },
]
