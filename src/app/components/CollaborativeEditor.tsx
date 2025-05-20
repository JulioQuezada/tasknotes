"use client";
import { app } from "@/app/lib/firebase";
import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { FirestoreProvider } from "@gmcfall/yjs-firestore-provider";

const colors = [
  "#958DF1", "#F98181", "#FBBC88", "#FAF594", "#70CFF8", "#94FADB", "#B9F18D",
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

type Props = { //imports user data and his notes
  noteId: string;
  userName?: string;
};

const ydocsMap: Map<string, { ydoc: Y.Doc; provider: FirestoreProvider; refCount: number }> = new Map();

export default function CollaborativeEditor({
  noteId,
  userName = "Member",
}: Props) {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  const { ydoc, provider } = useMemo(() => {
    let entry = ydocsMap.get(noteId);
    if (!entry) {
      const ydoc = new Y.Doc();
      const provider = new FirestoreProvider(app, ydoc, ["notes-collab", noteId]);
      if (provider.awareness) {
        provider.awareness.setLocalStateField("user", { //awarnes to sesions and room online
          name: userName,
          color: getRandomColor(), //i like the ones on top
        });
      }
      entry = { ydoc, provider, refCount: 1 };
      ydocsMap.set(noteId, entry);
    } else {
      entry.refCount += 1;
    }
    return entry;
  }, [noteId, userName]);

  useEffect(() => {
    if (!provider.awareness) return;
    const onChange = () => {
      const states = Array.from(provider.awareness!.getStates().values());
      setActiveUsers(states.map((state: any) => state.user).filter(Boolean));
    };
    provider.awareness.on("change", onChange);
    onChange();
    return () => {
      provider.awareness!.off("change", onChange);
    };
  }, [provider.awareness]);

  const editor = useEditor({ //functions of the editor
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: "",
          color: getRandomColor(),
        },
      }),
    ],
  });

  if (!editor) {
    return <div>Joining to multinotes...</div>; //if the load time its too much i guess, i didnt get to see it in action
  }

//------------------------------------------------HTML to editor---------------------------------------
  return (
    <div className="border rounded-lg p-0 bg-white shadow relative"> 
      <div className="relative bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-1">
          {activeUsers.map((user, idx) => (
            <span
              key={idx}
              title={user?.name}
              className="inline-block w-4 h-4 rounded-full border-2 border-white shadow"
              style={{ background: user?.color || "#888" }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-teal-200' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >B</button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-teal-200' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          ><span className="italic">I</span></button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-teal-200' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Undeline"
          ><span className="underline">U</span></button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-teal-200' : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Title"
          >Title</button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-teal-200' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="List"
          >• List</button>
          <button
            type="button"
            className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-teal-200' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Number List"
          >1. List</button>
          <button
            type="button"
            className="px-2 py-1 rounded"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clean fomrat"
          >✕</button>
        </div>
      </div>
      {/*here is the real editor that generates on session*/}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
