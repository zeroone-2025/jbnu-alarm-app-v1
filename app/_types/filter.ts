export type FilterType = 'ALL' | 'UNREAD' | 'FAVORITE' | 'KEYWORD';

export const LOGIN_REQUIRED_FILTERS: FilterType[] = ['UNREAD', 'KEYWORD', 'FAVORITE'];

export const isLoginRequiredFilter = (filter: FilterType): boolean => {
  return LOGIN_REQUIRED_FILTERS.includes(filter);
};
