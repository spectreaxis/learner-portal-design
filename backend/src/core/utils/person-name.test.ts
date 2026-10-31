import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMinorNameCorrection, normalizePersonName, personNameProblem } from './person-name';

test('normalises spacing and Unicode composition', () => {
  assert.equal(normalizePersonName('  Zoé   Wanjiru '), 'Zoé Wanjiru');
});

test('accepts names in any script, with hyphens and apostrophes', () => {
  for (const name of ['Gavin Taji', "Wanjiru O'Neil", 'Jean-Luc Mbeki', 'Zoé Ñúñez', 'Иван Петров', 'J. R. Tolkien']) {
    assert.equal(personNameProblem(name), null, name);
  }
});

test('rejects digits, symbols and empty or oversized names', () => {
  for (const name of ['', 'G', 'Gavin 2', 'Gavin@Taji', '<script>', '-Gavin', 'A'.repeat(71)]) {
    assert.notEqual(personNameProblem(name), null, name);
  }
});

test('allows typo, accent and capitalisation fixes', () => {
  assert.ok(isMinorNameCorrection('Gavn Taji', 'Gavin Taji'));
  assert.ok(isMinorNameCorrection('gavin taji', 'Gavin Taji'));
  assert.ok(isMinorNameCorrection('Zoe Wanjiru', 'Zoé Wanjiru'));
  assert.ok(isMinorNameCorrection('Jon Kamau', 'John Kamau'));
});

test('allows adding, dropping or reordering parts of the same name', () => {
  assert.ok(isMinorNameCorrection('Gavin', 'Gavin Taji'));
  assert.ok(isMinorNameCorrection('Gavin Otieno Taji', 'Gavin Taji'));
  assert.ok(isMinorNameCorrection('Taji Gavin', 'Gavin Taji'));
  assert.ok(isMinorNameCorrection('Mary Ann Otieno', 'Maryann Otieno'));
});

test('allows fixing a typo and adding a name in one correction', () => {
  assert.ok(isMinorNameCorrection('Gavn', 'Gavin Taji'));
  assert.ok(isMinorNameCorrection('Gavin Tajj Otieno', 'Gavin Taji'));
});

test('refuses changing to a different person', () => {
  assert.ok(!isMinorNameCorrection('Gavin Taji', 'Mary Wambui'));
  assert.ok(!isMinorNameCorrection('Gavin Taji', 'Gavin Smith'));
  assert.ok(!isMinorNameCorrection('Gavn', 'Kevin Taji'));
  // Short names allow no typos, so they cannot become another short name
  assert.ok(!isMinorNameCorrection('Al', 'Ed'));
  assert.ok(!isMinorNameCorrection('Ann Lee', 'Ian Lim'));
});
