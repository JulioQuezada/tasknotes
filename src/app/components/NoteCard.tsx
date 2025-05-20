import {
  Bars3Icon, CalendarIcon, PencilIcon, ShareIcon, TrashIcon, UserIcon,
} from '@heroicons/react/20/solid';

type NoteProps = {
  id: string;
  title: string;
  members?: string[];
  owner?: string;
  uidToEmail: { [uid: string]: string };
  onEdit: () => void;
  onShare: (noteId: string) => void;
  onDelete?: (noteId: string) => void;
};

export default function NoteCard({
  id,
  title,
  members = [],
  owner,
  uidToEmail,
  onEdit,
  onShare,
  onDelete,
}: NoteProps) {
  const getEmail = (uid: string) =>
    uidToEmail?.[uid] || `(${uid.slice(0, 6)}...)`;

  return (
    <div className="lg:flex lg:items-center lg:justify-between bg-white rounded-xl shadow p-6 mb-6">
            {/*---------------------------------------------title card-------------------------------------------*/}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
          {owner && (
            <span className="ml-2 flex items-center gap-1 text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
              <UserIcon className="w-4 h-4" />
              Owner
            </span>
          )}
        </div>

            {/*---------------------------------------------icons card-------------------------------------------*/}
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <UserIcon className="mr-1.5 size-5 shrink-0 text-gray-400" />
            {owner ? getEmail(owner) : "Desconocido"}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-1">
            <span className="italic text-gray-400 mr-2">Members:</span>
            {members.length === 0 ? (
              <span className="italic text-gray-300">No Members</span>
            ) : (
              members.map((member, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700 ring-1 ring-gray-300"
                  title={getEmail(member)}
                >
                  {getEmail(member)}
                  {owner === member && (
                    <span className="ml-1 text-teal-600 font-bold">(owner)</span>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/*---------------------------------------------Button section on card-----------------------------*/}
      <div className="mt-5 flex lg:mt-0 lg:ml-4 gap-2">
        <button
          onClick={onEdit}
          type="button"
          title="Editar"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          <PencilIcon className="mr-1.5 size-5 text-gray-400" />
          Edit
        </button>
        <button
          onClick={() => onShare(id)}
          type="button"
          title="Compartir"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
          <ShareIcon className="mr-1.5 size-5 text-gray-400" />
          Share
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            type="button"
            title="Eliminar"
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <TrashIcon className="mr-1.5 size-5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
