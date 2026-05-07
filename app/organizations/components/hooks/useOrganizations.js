import { useQuery } from '@tanstack/react-query';
import { fetchOrganizations } from '../data';

export function useOrganizations(filters) {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: () => fetchOrganizations(filters),
  });
}