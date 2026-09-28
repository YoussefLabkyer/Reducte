import { fetchApi } from './api';
import { SearchResults } from '../types';

export const searchService = {
  search: (query: string) => fetchApi<SearchResults>(`/search?q=${encodeURIComponent(query)}`),
};
