'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import LoadingSpinner from '@/_components/ui/LoadingSpinner';

import CompaniesList from './_components/CompaniesList';
import CompanyDetail from './_components/CompanyDetail';

/** ?id 가 있으면 상세, 없으면 목록을 같은 라우트(/flow/companies)에서 분기 */
function CompaniesRouteInner() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const id = idParam ? Number(idParam) : null;

  if (id !== null && !Number.isNaN(id)) {
    return <CompanyDetail id={id} />;
  }
  return <CompaniesList />;
}

export default function FlowCompaniesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <CompaniesRouteInner />
    </Suspense>
  );
}
