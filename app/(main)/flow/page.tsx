'use client';

import Link from 'next/link';
import { FiBriefcase, FiUser } from 'react-icons/fi';

export default function FlowHomePage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="space-y-4 px-4 pt-4 pb-10">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-indigo-700">FLOW</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <h1 className="mt-2 text-xl font-bold leading-snug text-gray-900 break-keep">
            아는 사이로 시작하는
            <br />
            지역 커리어
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 break-keep">
            내 이력을 정리하고, 지역 기업과 선배들의 이야기를 확인해보세요.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/flow/career"
            className="rounded-2xl bg-gray-900 p-4 text-white shadow-sm transition active:scale-[0.99]"
          >
            <FiUser size={20} />
            <p className="mt-3 text-sm font-bold">내 이력</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">프로필과 커리어 정보를 관리해요.</p>
          </Link>
          <Link
            href="/flow/companies"
            className="rounded-2xl bg-white p-4 text-gray-900 shadow-sm transition active:scale-[0.99]"
          >
            <FiBriefcase size={20} />
            <p className="mt-3 text-sm font-bold">기업</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">만나볼 기업과 채용 정보를 봐요.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
