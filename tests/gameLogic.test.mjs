import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isToneSpellAnswer,
  shuffle,
  starsForScore,
} from '../src/utils/gameLogic.ts'
import {
  completeChapterLevel,
  getTotalStars,
} from '../src/utils/progress.ts'
import {
  loadStoredValue,
  saveStoredValue,
} from '../src/utils/storage.ts'

test('tone spell answers compare with the configured tone option', () => {
  const options = ['mā', 'má', 'mǎ', 'mà']

  assert.equal(isToneSpellAnswer('mǎ', options, 2), true)
  assert.equal(isToneSpellAnswer('mā', options, 2), false)
})

test('shuffle does not mutate input and keeps every item', () => {
  const input = [1, 2, 3, 4]
  const output = shuffle(input, () => 0)

  assert.deepEqual(input, [1, 2, 3, 4])
  assert.deepEqual([...output].sort(), input)
  assert.notDeepEqual(output, input)
})

test('score thresholds produce zero to three stars', () => {
  assert.equal(starsForScore(0), 0)
  assert.equal(starsForScore(1), 1)
  assert.equal(starsForScore(70), 2)
  assert.equal(starsForScore(90), 3)
})

test('completing every level unlocks the next chapter without mutating input', () => {
  const chapters = [
    {
      id: 'first',
      name: 'First',
      description: '',
      icon: '',
      color: '',
      unlocked: true,
      completed: false,
      progress: 0,
      levels: [
        {
          id: 'level-1',
          chapterId: 'first',
          name: '',
          type: 'learn',
          description: '',
          phonemes: [],
          starsRequired: 0,
          completed: false,
          starsEarned: 0,
          bestScore: 0,
        },
      ],
    },
    {
      id: 'second',
      name: 'Second',
      description: '',
      icon: '',
      color: '',
      unlocked: false,
      completed: false,
      progress: 0,
      levels: [],
    },
  ]

  const updated = completeChapterLevel(chapters, 'first', 'level-1', 4)

  assert.equal(chapters[0].levels[0].completed, false)
  assert.equal(updated[0].levels[0].starsEarned, 3)
  assert.equal(updated[0].progress, 100)
  assert.equal(updated[1].unlocked, true)
  assert.equal(getTotalStars(updated), 3)
})

test('storage helpers restore valid data and fall back for corrupted data', () => {
  const values = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  }

  assert.equal(saveStoredValue('progress', { stars: 3 }), true)
  assert.deepEqual(loadStoredValue('progress', {}), { stars: 3 })

  values.set('progress', '{broken')
  assert.deepEqual(loadStoredValue('progress', { stars: 0 }), { stars: 0 })

  delete globalThis.window
})
