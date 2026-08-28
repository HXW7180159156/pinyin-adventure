import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isToneSpellAnswer,
  shuffle,
  starsForScore,
} from '../src/utils/gameLogic.ts'

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
