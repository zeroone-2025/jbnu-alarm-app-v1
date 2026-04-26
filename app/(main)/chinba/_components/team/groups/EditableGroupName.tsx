'use client';

import { useState, useRef, useEffect } from 'react';

import { FiEdit2 } from 'react-icons/fi';

interface EditableGroupNameProps {
  name: string;
  onChange: (v: string) => void;
}

export default function EditableGroupName({ name, onChange }: EditableGroupNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(name);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(name); setEditing(false); }
        }}
        maxLength={30}
        className="text-sm font-bold text-gray-800 bg-transparent border-b border-gray-300 outline-none py-0 px-0 w-32 focus:border-gray-900"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(name); setEditing(true); }}
      className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-gray-600 transition-colors"
    >
      {name}
      <FiEdit2 size={12} className="text-gray-400" />
    </button>
  );
}
