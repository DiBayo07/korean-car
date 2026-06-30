import { useState, useEffect, useRef } from 'react';
import { getVehicleDetail } from '../api/encarApi';
import type { EncarDetail } from '../api/encarApi';

export interface UseVehicleResult {
  vehicle: EncarDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVehicle(id: string | undefined): UseVehicleResult {
  const [vehicle, setVehicle] = useState<EncarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = async (vehicleId: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await getVehicleDetail(vehicleId);
      setVehicle(result);
      if (!result) setError('Vehicle not found');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle');
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    } else {
      setLoading(false);
      setVehicle(null);
    }
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [id]);

  const refetch = () => { if (id) fetchData(id); };

  return { vehicle, loading, error, refetch };
}
