export const JOURNAL_KEY = 'apollos-jezero-field-notes-v1';
export function journalKey(missionId = 'perseverance') {
  return missionId === 'perseverance' ? JOURNAL_KEY : `apollos-field-notes-v1-${missionId}`;
}
export function validateNote(note) {
  if (!note || typeof note.title !== 'string' || !note.title.trim() || note.title.length > 100)
    return 'Enter a title of up to 100 characters.';
  if (
    typeof note.observation !== 'string' ||
    !note.observation.trim() ||
    note.observation.length > 2000
  )
    return 'Enter an observation of up to 2,000 characters.';
  if (
    !Array.isArray(note.coordinates) ||
    note.coordinates.length !== 2 ||
    !note.coordinates.every(Number.isFinite) ||
    Math.abs(note.coordinates[0]) > 180 ||
    Math.abs(note.coordinates[1]) > 90
  )
    return 'A valid Mars location is required.';
  if (
    note.photo &&
    (typeof note.photo !== 'string' ||
      !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(note.photo) ||
      note.photo.length > 850000)
  )
    return 'Use a JPEG, PNG or WebP photo under 600 KB.';
  return null;
}
export function readNotes(storage, missionId = 'perseverance') {
  const raw = storage.getItem(journalKey(missionId));
  if (!raw) return [];
  const notes = JSON.parse(raw);
  if (
    !Array.isArray(notes) ||
    notes.some(
      (note) =>
        validateNote(note) || typeof note.id !== 'string' || typeof note.createdAt !== 'string',
    )
  )
    throw new Error(
      'Saved notes could not be read. Export or recover browser storage before adding new records.',
    );
  return notes;
}
export function saveNote(storage, notes, note, missionId = 'perseverance') {
  const error = validateNote(note);
  if (error) throw new Error(error);
  if (notes.length >= 20)
    throw new Error(
      'This local notebook holds 20 records. Export your notebook, then remove older records to make room.',
    );
  const next = [note, ...notes];
  storage.setItem(journalKey(missionId), JSON.stringify(next));
  return next;
}
