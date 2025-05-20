"use client";
import { useEffect, useState } from "react";
import { ref, onValue, remove, get, update, set } from "firebase/database";
import { db, auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import NoteCreator from "@/app/components/NoteCreator";
import NoteCard from "@/app/components/NoteCard";
import CollaborativeEditor from "@/app/components/CollaborativeEditor";
import { useSearchParams, useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  members?: string[];
  owner?: string;
};

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<any>(null);
  const [uidToEmail, setUidToEmail] = useState<{[uid: string]: string}>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [inviteUid, setInviteUid] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle"|"ok"|"exists"|"error">("idle");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) setUser(user);
      else window.location.href = "/login"; //if it isnt a session active
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsub = onValue(usersRef, snap => {
      const val = snap.val() || {};
      const emailMap: {[uid: string]: string} = {};
      Object.entries(val).forEach(([uid, user]: any) => {
        emailMap[uid] = user.email;
      });
      setUidToEmail(emailMap); //this was to make the user identificator the email on the cards of members, but i couldn't make it work 100%
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const notesRef = ref(db, `notes`);
    const unsubscribe = onValue(notesRef, snapshot => {
      const data = snapshot.val() || {};
      const notesArr: Note[] = Object.entries(data)
        .map(([id, note]: any) => ({
          id,
          ...note,
        }))
        .filter(
          note =>
            note.owner === user.uid ||
            (Array.isArray(note.members) && note.members.includes(user.uid))
        );
      setNotes(notesArr);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const urlNoteId = searchParams.get("noteId");
    if (urlNoteId) {
      setSelectedNoteId(urlNoteId);
    }
  }, [searchParams]);

  const handleNoteCreated = (noteId: string) => setSelectedNoteId(noteId);

  const handleShare = (noteId: string) => {
    const url = `${window.location.origin}/dashboard?noteId=${noteId}`;//makes the link to share
    navigator.clipboard.writeText(url);
    alert("¡Link copied!");
  };

  const handleDelete = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.owner !== user.uid) {//makes the distinction to delete
      alert("Only the Owner can delete this.");
      return;
    }
    if (confirm("¿Are you sure you want to delete this note?")) {
      const noteRef = ref(db, `notes/${noteId}`);
      remove(noteRef);
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    }
  };

  const handleBackToList = () => {
    setSelectedNoteId(null);
    router.replace("/dashboard");//back to my notes
  };

  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    if (!selectedNoteId) {
      setSelectedNote(undefined);
      return;
    }
    const noteRef = ref(db, `notes/${selectedNoteId}`);
    const unsubscribe = onValue(noteRef, snapshot => {
      const data = snapshot.val();
      if (data) setSelectedNote({ id: selectedNoteId, ...data });
      else setSelectedNote(undefined);
    });
    return () => unsubscribe();
  }, [selectedNoteId]);

  const handleInvite = async () => {
    if (!selectedNoteId || !inviteUid) return;
    const noteRef = ref(db, `notes/${selectedNoteId}`);
    try {
      const snap = await get(noteRef);
      if (snap.exists()) {
        const note = snap.val();
        const members: string[] = Array.isArray(note.members) ? note.members : [];
        if (members.includes(inviteUid)) {
          setInviteStatus("exists");
        } else {
          await update(noteRef, { members: [...members, inviteUid] });
          setInviteStatus("ok");
        }
      } else {
        setInviteStatus("error");
      }
      setInviteUid("");
    } catch {
      setInviteStatus("error");
    }
    setTimeout(() => setInviteStatus("idle"), 2000);
  };
/*-----------------------------html-----------------------------*/
  return (
    <div className="max-w-2xl mx-auto mt-12">
      {!selectedNoteId && (
        <>
          <NoteCreator onNoteCreated={handleNoteCreated} />
          {notes.length === 0 && (
            <div className="text-center text-gray-400 mt-8">There is nothing in here :O Start writing!.</div>
          )}
          {notes.map(note => ( //generating the cards of the notes
            <NoteCard
              key={note.id}
              {...note}
              uidToEmail={uidToEmail}
              onEdit={() => setSelectedNoteId(note.id)}
              onShare={handleShare}
              onDelete={note.owner === user.uid ? handleDelete : undefined}
            />
          ))}
        </>
      )}

      {selectedNoteId && selectedNote && (
        <div>
          <button
            className="mb-4 text-blue-600 hover:underline"
            onClick={handleBackToList}
          >← Back to my notes</button>
          <h2 className="text-2xl font-bold mb-2">
            {selectedNote?.title || "Nota"}
          </h2>
          <div className="mb-4 flex gap-2 items-center">
            <input
              className="border px-2 py-1 rounded"
              value={inviteUid}
              onChange={e => setInviteUid(e.target.value)}
              placeholder="User ID to invite"
            />
            <button
              className="bg-teal-600 text-white px-2 py-1 rounded"
              onClick={handleInvite}
              disabled={!inviteUid}
            >Invite</button>
            {inviteStatus === "ok" && <span className="text-green-600 ml-2">¡Invited!</span>}
            {inviteStatus === "exists" && <span className="text-blue-600 ml-2">It's Already a member</span>}
            {inviteStatus === "error" && <span className="text-red-600 ml-2">Error</span>}
          </div>
          <div className="mb-2 text-sm text-gray-700">
            <b>Miembros:</b>{" "}
            {selectedNote?.members && selectedNote.members.length
              ? selectedNote.members.map(uid => uidToEmail[uid] || uid).join(", ")
              : "(only owner)"}
          </div>
          <CollaborativeEditor //data to editor
            noteId={selectedNoteId}
            userName={user?.email || "Colaborator"}
          />
        </div>
      )}
    </div>
  );
}
