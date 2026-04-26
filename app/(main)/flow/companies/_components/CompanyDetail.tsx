'use client';

import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiExternalLink, FiInstagram } from 'react-icons/fi';

import { useCompany } from '@/_lib/hooks/useCompanies';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';

import {
  benefitBg,
  formatEmployeeBucket,
  logoBg,
  logoText,
  qaText,
} from '../../_components/companyTheme';
import CompanyPhotoCarousel from './CompanyPhotoCarousel';
import InterestPanel from './InterestPanel';

interface Props {
  id: number;
}

export default function CompanyDetail({ id }: Props) {
  const router = useRouter();
  const { data: company, isLoading, error } = useCompany(id);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-50">
      {/* Top sub-header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <button
          onClick={() => router.back()}
          aria-label="뒤로"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200"
        >
          <FiChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-1">
          <span className="text-base font-bold tracking-tight text-gray-900">FLOW</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="w-9" />
      </header>

      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error || !company ? (
        <div className="p-6 text-sm text-rose-700">
          기업 정보를 불러오지 못했어요.
        </div>
      ) : (
        <div className="h-[calc(100%-56px)] overflow-y-auto pb-24">
          {/* Photo carousel — 회사가 직접 보여주는 시각 자산 */}
          <CompanyPhotoCarousel
            photos={company.photos}
            fallbackLetter={company.logo_letter ?? company.name.charAt(0)}
            fallbackColor={company.logo_color}
          />

          {/* Company info card */}
          <section className="px-4 mt-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${logoBg(company.logo_color)}`}
                >
                  <span className={`text-lg font-bold ${logoText(company.logo_color)}`}>
                    {company.logo_letter ?? company.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-gray-900">
                    {company.name}
                    {company.name_en && (
                      <span className="ml-1.5 text-xs font-medium text-gray-400">
                        {company.name_en}
                      </span>
                    )}
                  </h1>
                  <p className="mt-0.5 text-xs text-gray-500 break-keep">
                    {[
                      company.industry,
                      company.location,
                      formatEmployeeBucket(company.employee_count)
                        ? `직원 ${formatEmployeeBucket(company.employee_count)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              {company.slogan && (
                <p className="mt-3 text-xs italic leading-relaxed text-gray-600 break-keep">
                  &ldquo;{company.slogan}&rdquo;
                </p>
              )}
            </div>
          </section>

          {/* Benefits summary */}
          {company.benefits.length > 0 && (
            <div className="px-4 mt-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span>✨</span> 복지 한눈에
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {company.benefits.map((b) => (
                    <div key={b.id} className="text-center">
                      <div
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${benefitBg(b.color)}`}
                      >
                        <span className="text-lg">{b.icon}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-tight text-gray-600 whitespace-pre-line">
                        {b.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {company.description && (
            <div className="px-4 mt-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">기업 소개</h3>
                <p className="text-sm text-gray-700 leading-relaxed break-keep">
                  {company.description}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-gray-500">
                  {company.address && (
                    <div className="flex gap-2">
                      <dt className="w-12 shrink-0 text-gray-400">주소</dt>
                      <dd className="text-gray-700">{company.address}</dd>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex gap-2">
                      <dt className="w-12 shrink-0 text-gray-400">전화</dt>
                      <dd className="text-gray-700">{company.phone}</dd>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex gap-2">
                      <dt className="w-12 shrink-0 text-gray-400">웹</dt>
                      <dd className="truncate">
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {/* 회사 채널 — 외부 링크 모음의 일부로 자연스럽게 */}
                {(company.instagram_url || company.naver_blog_url) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                    {company.instagram_url && (
                      <a
                        href={company.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <FiInstagram size={12} /> 인스타그램
                      </a>
                    )}
                    {company.naver_blog_url && (
                      <a
                        href={company.naver_blog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <FiExternalLink size={12} /> 블로그
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects — 회사가 만든 것 */}
          {company.projects.length > 0 && (
            <div className="px-4 mt-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span>🚀</span> 우리가 만든 것
                </h3>
                <div className="space-y-2">
                  {company.projects.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 rounded-xl p-3 ${benefitBg(p.color)}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-sm">
                        {p.icon ?? '✨'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 break-keep">{p.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {[p.client, p.year].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interviews */}
          {company.interviews.map((iv) => (
            <div key={iv.id} className="px-4 mt-5">
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow">
                    {iv.interviewer_initial}
                  </div>
                  <div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                      INTERVIEW
                    </span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{iv.interviewer_name}</p>
                    <p className="text-xs text-gray-500">
                      {iv.interviewer_role}
                      {iv.interviewer_years ? ` · ${iv.interviewer_years}년차` : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-5 p-4">
                  {iv.qas.map((qa) => (
                    <div key={qa.id}>
                      <p className={`mb-2 text-xs font-bold ${qaText(qa.color)}`}>
                        Q. {qa.question}
                      </p>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-700 break-keep">
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* 더 솔직한 이야기 안내 — 비공개 영역의 가치 시그널 */}
          {company.interviews.length > 0 && (
            <div className="px-4 mt-3">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs text-gray-500 break-keep">
                  💬 더 솔직한 이야기는 <span className="font-semibold text-gray-700">1:1 커피챗</span>에서 들어보세요
                </p>
              </div>
            </div>
          )}

          {/* 지금 뽑는 자리 — 회사 logo_color 톤의 옅은 배경 */}
          {company.openings.filter((o) => o.is_open).length > 0 && (
            <div className="px-4 mt-5 space-y-3">
              {company.openings.filter((o) => o.is_open).map((o) => (
                <a
                  key={o.id}
                  href={o.external_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block rounded-2xl border border-gray-100 ${logoBg(company.logo_color)} p-4 shadow-sm transition active:scale-[0.99]`}
                >
                  <p className={`text-xs font-bold ${logoText(company.logo_color)}`}>
                    📢 지금 뽑는 자리
                    {o.posted_at && (
                      <span className="ml-2 font-normal text-gray-500">
                        {new Date(o.posted_at).toISOString().slice(0, 10)}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 break-keep">{o.title}</p>
                  {o.tags && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {o.tags.split(',').map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${logoText(company.logo_color)}`}>
                    자세히 보기 <FiExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Floating interest panel */}
      {company && <InterestPanel company={company} />}
    </div>
  );
}
