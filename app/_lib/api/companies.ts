import api from './client';
import type {
  CompanyListItem,
  CompanyDetail,
  CompanyInterestRequest,
  CompanyInterestResponse,
} from '@/_types/flow';

export async function getCompanies(): Promise<CompanyListItem[]> {
  const { data } = await api.get('/companies/');
  return data;
}

export async function getCompany(companyId: number): Promise<CompanyDetail> {
  const { data } = await api.get(`/companies/${companyId}`);
  return data;
}

export async function upsertCompanyInterest(
  companyId: number,
  payload: CompanyInterestRequest,
): Promise<CompanyInterestResponse> {
  const { data } = await api.put(`/companies/${companyId}/interest`, payload);
  return data;
}
