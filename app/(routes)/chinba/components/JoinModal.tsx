'use client';

import { useState } from 'react';

interface JoinModalProps {
  isOpen: boolean;
  onJoin: (name: string, password?: string) => void;
  isLoading?: boolean;
}

export default function JoinModal({ isOpen, onJoin, isLoading }: JoinModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), password.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">방에 참가하기</h2>
        <p className="text-gray-500 text-sm mb-6">
          이름을 입력하고 시간 조율에 참여하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              이름 <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김민수"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
              required
              autoFocus
            />
          </div>

          {/* 비밀번호 입력 (선택) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              비밀번호 <span className="text-gray-400 text-xs">(선택사항)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="나중에 수정할 때 필요해요"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 참가 버튼 */}
          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full py-4 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '참가 중...' : '참가하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
