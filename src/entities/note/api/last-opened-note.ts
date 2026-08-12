const STORAGE_KEY = "last-opened-note-id";

export function getLastOpenedNoteId(): string | undefined {
  return localStorage.getItem(STORAGE_KEY) ?? undefined;
}

export function setLastOpenedNoteId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function clearLastOpenedNoteId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
