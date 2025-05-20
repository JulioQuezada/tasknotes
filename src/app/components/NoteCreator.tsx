import { useState } from "react";
import { push, ref, set } from "firebase/database";
import { db } from "@/app/lib/firebase";
import { auth } from "@/app/lib/firebase";

export default function NoteCreator({ onNoteCreated }: { onNoteCreated: (noteId: string) => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const createNote = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const notesRef = ref(db, `notes`);
    const newNoteRef = push(notesRef);
    await set(newNoteRef, {
      title,
      owner: user.uid,//makes the difference to the privileges of delete the note (not 100% implemented)
      members: [user.uid],
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setLoading(false);
    onNoteCreated(newNoteRef.key!);
  };
/*---------------------basic html--------------------*/
  return (
    <div className="mb-6 flex gap-2">
      <input
        type="text"
        placeholder="Title"
        className="border rounded px-2 py-1 flex-1"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button
        onClick={createNote}
        disabled={!title || loading}
        className="bg-teal-600 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        Create note
      </button>
    </div>
  );
}
