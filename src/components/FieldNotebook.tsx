import { downloadJson } from '../utils/downloadJson';
import { useState, type FormEvent } from 'react';
import { journalKey, saveNote, type FieldNote } from '../planning/journal.js';
export default function FieldNotebook({
  missionId,
  missionName,
  notes,
  onSave,
  coordinate,
  context,
  storageError,
}: {
  missionId: string;
  missionName: string;
  notes: FieldNote[];
  onSave: (notes: FieldNote[]) => void;
  coordinate: [number, number];
  context: string;
  storageError: string;
}) {
  const [removed, setRemoved] = useState<FieldNote[] | null>(null);
  const [title, setTitle] = useState('');
  const [observation, setObservation] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(false);
  async function choosePhoto(file?: File) {
    setError('');
    setSaved('');
    setPhoto(undefined);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 600 * 1024) {
      setError('Choose a JPEG, PNG or WebP photo under 600 KB.');
      return;
    }
    setLoading(true);
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Photo could not be read.'));
        reader.readAsDataURL(file);
      });
      setPhoto(result);
    } catch {
      setError('Photo could not be read. Please choose it again.');
    } finally {
      setLoading(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaved('');
    try {
      const next = saveNote(
        localStorage,
        notes,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          observation: observation.trim(),
          coordinates: [...coordinate],
          photo,
          createdAt: new Date().toISOString(),
          locationContext: context,
        },
        missionId,
      );
      onSave(next);
      setRemoved(null);
      setTitle('');
      setObservation('');
      setPhoto(undefined);
      event.currentTarget.reset();
      setSaved('Observation saved on this device and marked on the map.');
    } catch (reason) {
      setError(
        reason instanceof DOMException
          ? 'Browser storage is full or unavailable. Your form is unchanged; export existing notes before retrying.'
          : String((reason as Error).message),
      );
    }
  }
  function removeNote(id: string) {
    try {
      const next = notes.filter((note) => note.id !== id);
      localStorage.setItem(journalKey(missionId), JSON.stringify(next));
      setRemoved(notes);
      onSave(next);
      setSaved('Record removed. You can undo this below.');
    } catch {
      setError('Could not update browser storage. The record is unchanged.');
    }
  }
  function undoRemove() {
    if (!removed) return;
    try {
      localStorage.setItem(journalKey(missionId), JSON.stringify(removed));
      onSave(removed);
      setRemoved(null);
      setSaved('Record restored.');
    } catch {
      setError('Could not restore the record to browser storage.');
    }
  }
  function exportNotes() {
    downloadJson(`apollos-${missionId}-field-notes.json`, {
      mission: missionName,
      coordinateSystem: 'Mars east longitude / north latitude, degrees',
      notes,
    });
  }

  return (
    <section className="field-notebook">
      <h3>Record discovery</h3>
      <p className="muted">Stored in this browser. Export to share with your team.</p>
      <form onSubmit={submit}>
        <p className="note-location">
          {context}
          <br />
          {coordinate[1].toFixed(5)}° N · {coordinate[0].toFixed(5)}° E
        </p>
        <label>
          Discovery title
          <input
            required
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Layering near the study site"
          />
        </label>
        <label>
          What did you observe?
          <textarea
            required
            maxLength={2000}
            rows={4}
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            placeholder="Describe texture, layering, surroundings and uncertainty."
          />
        </label>
        <label>
          Attach a photo <small>Optional · JPEG, PNG or WebP · up to 600 KB</small>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={loading}
            onChange={(event) => void choosePhoto(event.target.files?.[0])}
          />
        </label>
        {photo && (
          <img className="note-photo" src={photo} alt="Photo attached to the observation draft" />
        )}
        {(error || storageError) && (
          <p role="alert" className="inline-warning">
            {error || storageError}
          </p>
        )}
        {saved && <p role="status">{saved}</p>}
        <button className="primary-action" disabled={loading || !!storageError}>
          {loading ? 'Reading photo…' : 'Save discovery'}
        </button>
      </form>
      <div className="notebook-heading">
        <h4>Field records · {notes.length}</h4>
        <button onClick={exportNotes} disabled={!notes.length}>
          Export notes
        </button>
      </div>
      {removed && <button onClick={undoRemove}>Undo removal</button>}
      {notes.map((note) => (
        <article className="saved-note" key={note.id}>
          <strong>{note.title}</strong>
          <button
            className="remove-note"
            aria-label={`Remove ${note.title}`}
            onClick={() => removeNote(note.id)}
          >
            Remove
          </button>
          <p>{note.observation}</p>
          {note.photo && (
            <a href={note.photo} target="_blank" rel="noreferrer">
              <img
                className="note-photo"
                src={note.photo}
                alt={`Attached field photo: ${note.title}`}
              />
            </a>
          )}
          <small>
            {note.locationContext}
            <br />
            {note.coordinates[1].toFixed(5)}° N · {note.coordinates[0].toFixed(5)}° E<br />
            {new Date(note.createdAt).toLocaleString()}
          </small>
        </article>
      ))}
    </section>
  );
}
