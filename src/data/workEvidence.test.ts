import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORK_CATEGORIES,
  TECHNICAL_DEMONSTRATIONS,
  TECHNICAL_NOTE_REFS,
  filterWorkEvidence,
} from './workEvidence.ts';

test('Work Evidence — All Work returns every demonstration and engineering note', () => {
  const result = filterWorkEvidence('all');
  assert.equal(result.categoryLabel, 'All Work');
  assert.equal(result.demonstrations.length, TECHNICAL_DEMONSTRATIONS.length);
  assert.equal(result.notes.length, TECHNICAL_NOTE_REFS.length);
});

test('Work Evidence — Every category button yields matching evidence without dead empty filters', () => {
  for (const cat of WORK_CATEGORIES) {
    const result = filterWorkEvidence(cat.id);
    assert.equal(result.categoryLabel, cat.label);
    assert.ok(
      result.demonstrations.length > 0,
      `Category "${cat.id}" must match at least one technical demonstration`
    );
    assert.ok(
      result.notes.length > 0,
      `Category "${cat.id}" must match at least one technical note`
    );
  }
});

test('Work Evidence — Websites filter narrows down to edge website & architecture evidence', () => {
  const result = filterWorkEvidence('websites');
  assert.equal(result.demonstrations.length, 1);
  assert.equal(result.demonstrations[0].id, 'rescue-static-architecture');
  assert.equal(result.notes.length, 1);
  assert.equal(result.notes[0].id, 'rescue-stalled-project');
});

test('Work Evidence — Financial filter includes reconciliation demo and zero websites-only demo', () => {
  const result = filterWorkEvidence('financial');
  assert.ok(result.demonstrations.some((d) => d.id === 'momo-reconciliation'));
  assert.ok(!result.demonstrations.some((d) => d.id === 'rescue-static-architecture'));
});
