// Removed unused imports

export interface Vehicle {
  id: string;
  type: 'car' | 'bike' | 'salvage';
  brand: string;
  model: string;
  generation?: string;
  trim?: string;
  year: number;
  month?: number;
  mileage: number;
  price_usd: number;
  price_krw?: number;
  image_url: string;
  images?: string[];
  thumbnail?: string;
  status: string;
  engine_cc?: number;
  korean_name?: string;
  fuel?: string;
  transmission?: string;
  description?: string;
  inspectionAvailable?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://13.63.165.49:3000/api';

export const getVehicles = async (filters: any = {}): Promise<Vehicle[]> => {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/search?${params}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data.cars || [];
  } catch (error) {
    console.warn('Backend unavailable, falling back to mock data', error);
    // Return empty or mock array during dev
    return [];
  }
};

export const getCarDetails = async (id: string): Promise<Vehicle | null> => {
  try {
    const res = await fetch(`${API_URL}/car/${id}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable', error);
    return null;
  }
};

// Deprecated admin functions (removed supabase)
export const addVehicle = async (vehicle: any): Promise<any> => {
  console.log('Adding manually is disabled in Encar sync mode');
  return vehicle;
};

export const deleteVehicle = async (_id: string): Promise<boolean> => {
  console.log('Deleting manually is disabled in Encar sync mode');
  return true;
};
