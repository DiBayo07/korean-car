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
  sourceUrl?: string;
}

export interface SearchItem {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  source: 'encar';
  brand?: string;
  model?: string;
  type?: 'car' | 'moto';
}

export interface SearchResponse {
  total: number;
  page: number;
  items: SearchItem[];
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  specifications: Record<string, string>;
  sourceUrl: string;
  source: 'encar';
  brand: string;
  model: string;
  trim?: string;
  color?: string;
  location?: string;
  inspectionAvailable?: boolean;
  engineCc?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const KRW_TO_USD = 1350;

function mapSearchItemToVehicle(item: SearchItem, vehicleType: 'car' | 'bike'): Vehicle {
  return {
    id: item.id,
    type: vehicleType,
    brand: item.brand || item.title.split(' ')[0] || '',
    model: item.model || item.title.split(' ').slice(1).join(' ') || '',
    year: item.year,
    mileage: item.mileage,
    price_usd: item.price ? Math.round(item.price / KRW_TO_USD) : 0,
    price_krw: item.price,
    image_url: item.images[0] || '',
    images: item.images,
    status: 'Available',
    fuel: item.fuel,
    transmission: item.transmission,
    korean_name: item.title,
  };
}

async function fetchSearch(type: 'car' | 'moto', filters: Record<string, string | number> = {}): Promise<SearchItem[]> {
  const params = new URLSearchParams({
    type,
    limit: '50',
    page: '1',
    ...Object.fromEntries(
      Object.entries(filters).map(([k, v]) => [k, String(v)]),
    ),
  });

  const res = await fetch(`${API_URL}/search?${params}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data: SearchResponse = await res.json();
  return data.items || [];
}

export const searchVehicles = async (filters: {
  type?: 'car' | 'moto' | 'bike';
  brand?: string;
  model?: string;
  priceFrom?: number;
  priceTo?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  limit?: number;
} = {}): Promise<SearchResponse> => {
  const type = filters.type === 'bike' ? 'moto' : (filters.type || 'car');
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries({ ...filters, type })
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ),
  );

  const res = await fetch(`${API_URL}/search?${params}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
};

export const getVehicles = async (filters: Record<string, string | number> = {}): Promise<Vehicle[]> => {
  try {
    const [cars, motos] = await Promise.all([
      fetchSearch('car', filters),
      fetchSearch('moto', filters),
    ]);

    return [
      ...cars.map((item) => mapSearchItemToVehicle(item, 'car')),
      ...motos.map((item) => mapSearchItemToVehicle(item, 'bike')),
    ];
  } catch (error) {
    console.warn('Backend unavailable, returning empty list', error);
    return [];
  }
};

export const getCarDetails = async (id: string): Promise<Vehicle | null> => {
  try {
    const res = await fetch(`${API_URL}/item/${id}?type=car`);
    if (!res.ok) {
      const legacy = await fetch(`${API_URL}/car/${id}`);
      if (!legacy.ok) throw new Error('API failed');
      return legacy.json();
    }

    const detail: ItemDetail = await res.json();
    return {
      id: detail.id,
      brand: detail.brand,
      model: detail.model,
      trim: detail.trim,
      year: detail.year,
      mileage: detail.mileage,
      price_usd: detail.price ? Math.round(detail.price / KRW_TO_USD) : 0,
      price_krw: detail.price,
      image_url: detail.images[0] || '',
      images: detail.images,
      status: 'Available',
      type: 'car',
      fuel: detail.fuel,
      transmission: detail.transmission,
      description: detail.description,
      inspectionAvailable: detail.inspectionAvailable,
      sourceUrl: detail.sourceUrl,
      engine_cc: detail.engineCc,
      korean_name: detail.title,
    };
  } catch (error) {
    console.warn('Backend unavailable', error);
    return null;
  }
};

export const getItemDetails = async (id: string, type: 'car' | 'moto' = 'car'): Promise<ItemDetail | null> => {
  try {
    const res = await fetch(`${API_URL}/item/${id}?type=${type}`);
    if (!res.ok) throw new Error('API failed');
    return res.json();
  } catch (error) {
    console.warn('Backend unavailable', error);
    return null;
  }
};

export const addVehicle = async (vehicle: unknown): Promise<unknown> => {
  console.log('Adding manually is disabled in Encar sync mode');
  return vehicle;
};

export const deleteVehicle = async (_id: string): Promise<boolean> => {
  console.log('Deleting manually is disabled in Encar sync mode');
  return true;
};
