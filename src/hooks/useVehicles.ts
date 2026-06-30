import { useState, useEffect, useCallback, useRef } from 'react';
import { listVehicles, listManufacturers, listModelGroups, listModels } from '../api/encarApi';
import type { EncarVehicle, CarapisManufacturer, CarapisModelGroup, CarapisModel } from '../api/encarApi';

export interface UseVehiclesFilters {
  manufacturer_slug?: string;
  model_group_slug?: string;
  model_slug?: string;
  min_year?: number;
  max_year?: number;
  fuel_type?: string;
  price_from?: number;
  price_to?: number;
  search?: string;
  limit?: number;
}

export interface UseVehiclesResult {
  vehicles: EncarVehicle[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  setFilters: (filters: UseVehiclesFilters) => void;
  filters: UseVehiclesFilters;
  // Catalog data for cascading filters
  manufacturers: CarapisManufacturer[];
  manufacturersLoading: boolean;
  modelGroups: CarapisModelGroup[];
  modelGroupsLoading: boolean;
  models: CarapisModel[];
  modelsLoading: boolean;
  fetchModelGroups: (slug: string) => void;
  fetchModels: (manSlug: string, modelGroupSlug: string) => void;
}

export function useVehicles(initialFilters: UseVehiclesFilters = {}): UseVehiclesResult {
  const [filters, setFilters] = useState<UseVehiclesFilters>({ limit: 50, ...initialFilters });
  const [vehicles, setVehicles] = useState<EncarVehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Catalog state
  const [manufacturers, setManufacturers] = useState<CarapisManufacturer[]>([]);
  const [manufacturersLoading, setManufacturersLoading] = useState(false);
  const [modelGroups, setModelGroups] = useState<CarapisModelGroup[]>([]);
  const [modelGroupsLoading, setModelGroupsLoading] = useState(false);
  const [models, setModels] = useState<CarapisModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Load manufacturers on mount
  useEffect(() => {
    let cancelled = false;
    setManufacturersLoading(true);
    listManufacturers({ limit: 100, country: 'KR' })
      .then(data => { if (!cancelled) setManufacturers(data.results || []); })
      .catch(() => { if (!cancelled) setManufacturers([]); })
      .finally(() => { if (!cancelled) setManufacturersLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const fetchModelGroups = useCallback(async (slug: string) => {
    setModelGroupsLoading(true);
    try {
      const data = await listModelGroups(slug, { limit: 100 });
      setModelGroups(data.results || []);
    } catch {
      setModelGroups([]);
    } finally {
      setModelGroupsLoading(false);
    }
  }, []);

  const fetchModels = useCallback(async (manSlug: string, modelGroupSlug: string) => {
    setModelsLoading(true);
    try {
      const data = await listModels(manSlug, modelGroupSlug, { limit: 100 });
      setModels(data.results || []);
    } catch {
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (currentFilters: UseVehiclesFilters, currentPage: number) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await listVehicles({
        limit: currentFilters.limit || 50,
        page: currentPage,
        manufacturer_slug: currentFilters.manufacturer_slug,
        model_group_slug: currentFilters.model_group_slug,
        model_slug: currentFilters.model_slug,
        min_year: currentFilters.min_year,
        max_year: currentFilters.max_year,
        fuel_type: currentFilters.fuel_type,
        price_from: currentFilters.price_from,
        price_to: currentFilters.price_to,
        search: currentFilters.search,
      });

      if (currentPage === 1) {
        setVehicles(result.results);
      } else {
        setVehicles(prev => [...prev, ...result.results]);
      }
      setTotal(result.count);
      setPages(result.pages);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      if (currentPage === 1) setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when filters change (reset to page 1)
  useEffect(() => {
    setPage(1);
    fetchData(filters, 1);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [filters, fetchData]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(filters, nextPage);
  }, [page, filters, fetchData]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchData(filters, 1);
  }, [filters, fetchData]);

  const updateFilters = useCallback((newFilters: UseVehiclesFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const hasMore = page < pages;

  return {
    vehicles,
    total,
    loading,
    error,
    page,
    pages,
    hasMore,
    loadMore,
    refetch,
    setFilters: updateFilters,
    filters,
    manufacturers,
    manufacturersLoading,
    modelGroups,
    modelGroupsLoading,
    models,
    modelsLoading,
    fetchModelGroups,
    fetchModels,
  };
}
