export default function NoteAction() {
  return (
    <>
      <p class="text-fluid-sm text-amber-800">
        Right Sidebar...
      </p>

      <div class="flex flex-col justify-around gap-2">
        <button type="button">new note</button>
        <button type="button">import</button>
        <button type="button">export</button>
        <button type="button">share</button>
      </div>
    </>
  );
}
