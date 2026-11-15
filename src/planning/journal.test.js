import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNAL_KEY, readNotes, saveNote, validateNote } from './journal.js';
const note = {
  id: 'sample',
  title: 'Layering',
  observation: 'Simulation test observation.',
  coordinates: [77.42, 18.45],
  createdAt: '2026-11-15T12:00:00Z',
  locationContext: 'Simulated traverse position',
};
test('field observations persist with coordinates and survive a fresh read', () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const next = saveNote(storage, [], note);
  assert.deepEqual(readNotes(storage), next);
  assert.deepEqual(next[0].coordinates, note.coordinates);
});
test('invalid location, blank text and unsupported photos are rejected', () => {
  assert.ok(validateNote({ ...note, coordinates: [181, 0] }));
  assert.ok(validateNote({ ...note, title: ' ' }));
  assert.ok(validateNote({ ...note, observation: '' }));
  assert.ok(validateNote({ ...note, photo: 'data:image/svg+xml;base64,AAAA' }));
  assert.equal(validateNote({ ...note, photo: 'data:image/png;base64,AAAA' }), null);
});
test('storage failures do not mutate existing records', () => {
  const existing = [note];
  assert.throws(
    () =>
      saveNote(
        {
          setItem() {
            throw new Error('Quota exceeded');
          },
        },
        existing,
        { ...note, id: 'new' },
      ),
    /Quota/,
  );
  assert.deepEqual(existing, [note]);
});
test('corrupt saved records fail closed rather than silently overwrite evidence', () => {
  assert.throws(() => readNotes({ getItem: () => '{bad json' }));
  assert.throws(() =>
    readNotes({ getItem: () => JSON.stringify([{ ...note, coordinates: [NaN, 0] }]) }),
  );
  assert.equal(readNotes({ getItem: () => null }).length, 0);
  assert.ok(JOURNAL_KEY);
});
