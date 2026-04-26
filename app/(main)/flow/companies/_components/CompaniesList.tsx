'use client';

import Link from 'next/link';
import { FiChevronRight, FiZap } from 'react-icons/fi';

import { useCompanies } from '@/_lib/hooks/useCompanies';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';

import { formatEmployeeBucket, logoBg, logoText } from '../../_components/companyTheme';

export default function CompaniesList() {
  const { data: companies, isLoading, error } = useCompanies();

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-300 to-indigo-400 px-5 pt-6 pb-8 text-gray-900">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-indigo-700">FLOW</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <h1 className="mt-2 text-xl font-bold leading-snug break-keep">
          모르는 사이가 아닌,
          <br />
          아는 사이로 시작하는 커리어
        </h1>
        <p className="mt-2 text-sm text-gray-600 break-keep">
          지역 선배들의 진짜 이야기를 들어보세요.
        </p>
      </section>

      {/* Section title */}
      <div className="px-5 pt-5 pb-2 flex items-center gap-2">
        <FiZap size={16} className="text-emerald-500" />
        <h2 className="text-sm font-semibold text-gray-900">
          오늘 만나볼 기업 {companies ? `(${companies.length})` : ''}
        </h2>
      </div>

      {/* List */}
      <div className="px-4 pb-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            기업 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : !companies || companies.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
            아직 등록된 기업이 없어요.
          </div>
        ) : (
          <ul className="space-y-3">
            {companies.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/flow/companies/?id=${c.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:border-gray-200 active:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Left: Logo */}
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${logoBg(c.logo_color)}`}
                    >
                      <span className={`text-xl font-bold ${logoText(c.logo_color)}`}>
                        {c.logo_letter ?? c.name.charAt(0)}
                      </span>
                    </div>

                    {/* Right: Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {c.name}
                        {c.name_en && (
                          <span className="ml-1.5 text-xs font-medium text-gray-400">
                            {c.name_en}
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {[
                          c.industry,
                          c.location,
                          formatEmployeeBucket(c.employee_count)
                            ? `직원 ${formatEmployeeBucket(c.employee_count)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {c.slogan && (
                        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed break-keep line-clamp-2">
                          “{c.slogan}”
                        </p>
                      )}
                    </div>

                    <FiChevronRight className="text-gray-300 shrink-0" size={20} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
