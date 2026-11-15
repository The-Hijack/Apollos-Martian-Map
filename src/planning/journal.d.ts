export interface FieldNote {
  id: string;
  title: string;
  observation: string;
  coordinates: [number, number];
  photo?: string;
  createdAt: string;
  locationContext: string;
}
export const JOURNAL_KEY: string;
export function journalKey(missionId?: string): string;
export function validateNote(note: unknown): string | null;
export function readNotes(storage: Pick<Storage, 'getItem'>, missionId?: string): FieldNote[];
export function saveNote(
  storage: Pick<Storage, 'setItem'>,
  notes: FieldNote[],
  note: FieldNote,
  missionId?: string,
): FieldNote[];
