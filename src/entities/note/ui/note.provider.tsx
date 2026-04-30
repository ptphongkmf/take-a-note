import { createContext, type ParentProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

// redundant for now

const NoteContext = createContext();

function _NoteProvider(props: ParentProps) {
  const [note, setNote] = createStore();

  const noteStore = { note, setNote };

  return (
    <NoteContext.Provider value={noteStore}>
      {props.children}
    </NoteContext.Provider>
  );
}

function _useNote() {
  const context = useContext(NoteContext);

  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }

  return context;
}
