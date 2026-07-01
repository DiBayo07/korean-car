// Only calls the backend API. No direct Carapis calls or CORS proxy.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const KRW_TO_USD = 1350;
const BASE_IMAGE_URL = 'https://ci.encar.com/carpicture';

// Types matching backend response
export interface SearchResultItem {
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
  success: boolean;
  total: number;
  page: number;
  limit: number;
  items: SearchResultItem[];
  message?: string;
}

export interface DetailResponse {
  success: boolean;
  data?: {
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
  };
  message?: string;
}

export interface EncarVehicle {
  id: string;
  type: 'car' | 'bike' | 'salvage';
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  generation?: string;
  generation_slug?: string;
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
  color?: string;
  body_type?: string;
  drive_type?: string;
  location?: string;
  options?: string[];
  accident_history?: string;
}

export interface EncarDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  price_usd: number;
  price_krw: number;
  year: number;
  month?: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  thumbnail?: string;
  specifications: Record<string, string>;
  sourceUrl: string;
  source: 'encar';
  brand: string;
  model: string;
  generation?: string;
  trim?: string;
  korean_name?: string;
  color?: string;
  location?: string;
  inspectionAvailable?: boolean;
  engineCc?: number;
  engine_cc?: number;
  body_type?: string;
  drive_type?: string;
  options?: string[];
  accident_history?: string;
}

export interface ListVehiclesParams {
  limit?: number;
  page?: number;
  manufacturer_slug?: string;
  model_group_slug?: string;
  model_slug?: string;
  min_year?: number;
  max_year?: number;
  fuel_type?: string;
  price_from?: number;
  price_to?: number;
  search?: string;
}

export interface ListVehiclesResult {
  count: number;
  page: number;
  pages: number;
  limit: number;
  results: EncarVehicle[];
}

// Brand translation
const BRAND_MAP: Record<string, string> = {
  '현대': 'Hyundai',
  '기아': 'Kia',
  '쉐보레': 'Chevrolet',
  '르노': 'Renault',
  '쌍용': 'SsangYong',
  'KG모빌리티': 'KG Mobility',
  '제네시스': 'Genesis',
  'BMW': 'BMW',
  '벤츠': 'Mercedes-Benz',
  '아우디': 'Audi',
  '폭스바겐': 'Volkswagen',
  '토요타': 'Toyota',
  '혼다': 'Honda',
  '닛산': 'Nissan',
  '포드': 'Ford',
  '볼보': 'Volvo',
  '테슬라': 'Tesla',
  '포르쉐': 'Porsche',
  '랜드로버': 'Land Rover',
  '마쯔다': 'Mazda',
  '스바루': 'Subaru',
  '벤츠': 'Mercedes-Benz',
  '미니': 'Mini',
  '링컨': 'Lincoln',
  '지프': 'Jeep',
  '푸조': 'Peugeot',
  '시트로엥': 'Citroen',
  '픽업트럭': 'Pickup',
};

export function translateBrandName(koreanName: string): string {
  return BRAND_MAP[koreanName] || koreanName;
}

/**
 * Преобразует путь к изображению в полный URL.
 * Если путь уже начинается с http:// или https://, возвращает как есть.
 * Если путь относительный (начинается с /), добавляет базовый URL.
 */
export function getFullImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Если путь уже содержит base URL (например, сохранён с префиксом ранее)
  if (path.includes('ci.encar.com')) return path.startsWith('http') ? path : `https:${path}`;
  // Относительный путь: добавляем базовый URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_IMAGE_URL}${cleanPath}`;
}

// Map backend search result to EncarVehicle
function mapSearchItem(item: SearchResultItem): EncarVehicle {
  const brand = item.brand || item.title.split(' ')[0] || '';
  const model = item.model || item.title.split(' ').slice(1).join(' ') || '';
  const images = (item.images || []).map(getFullImageUrl);
  return {
    id: item.id,
    type: item.type === 'moto' ? 'bike' : 'car',
    brand: translateBrandName(brand),
    brand_slug: brand.toLowerCase().replace(/\s+/g, '-'),
    model: translateBrandName(model) || model,
    model_slug: model.toLowerCase().replace(/\s+/g, '-'),
    year: item.year,
    mileage: item.mileage,
    price_usd: item.price ? Math.round(item.price / KRW_TO_USD) : 0,
    price_krw: item.price,
    image_url: getFullImageUrl(item.images[0]),
    images,
    thumbnail: getFullImageUrl(item.images[0]),
    status: 'Available',
    fuel: item.fuel,
    transmission: item.transmission,
    korean_name: item.title,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────

export async function listVehicles(params: ListVehiclesParams = {}): Promise<ListVehiclesResult> {
  const searchParams = new URLSearchParams();
  searchParams.set('type', 'car');
  searchParams.set('limit', String(params.limit || 50));
  searchParams.set('page', String(params.page || 1));
  if (params.manufacturer_slug) searchParams.set('brand', params.manufacturer_slug);
  if (params.model_group_slug) searchParams.set('model', params.model_group_slug);
  if (params.min_year) searchParams.set('yearFrom', String(params.min_year));
  if (params.max_year) searchParams.set('yearTo', String(params.max_year));
  if (params.fuel_type) searchParams.set('fuel', params.fuel_type);
  if (params.price_from) searchParams.set('priceFrom', String(params.price_from));
  if (params.price_to) searchParams.set('priceTo', String(params.price_to));
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(`${API_URL}/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);

  const data: SearchResponse = await res.json();
  if (!data.success) throw new Error(data.message || 'Search failed');

  return {
    count: data.total,
    page: data.page,
    pages: Math.ceil(data.total / data.limit),
    limit: data.limit,
    results: data.items.map(mapSearchItem),
  };
}

export async function getVehicleDetail(id: string | number): Promise<EncarDetail | null> {
  try {
    const res = await fetch(`${API_URL}/item/${id}?type=car`);
    if (!res.ok) return null;

    const data: DetailResponse = await res.json();
    if (!data.success || !data.data) return null;

    const d = data.data;
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      price_usd: d.price ? Math.round(d.price / KRW_TO_USD) : 0,
      price_krw: d.price,
      year: d.year,
      mileage: d.mileage,
      fuel: d.fuel,
      transmission: d.transmission,
      images: (d.images || []).map(getFullImageUrl),
      thumbnail: getFullImageUrl(d.images[0]),
      specifications: d.specifications,
      sourceUrl: d.sourceUrl,
      source: 'encar',
      brand: translateBrandName(d.brand),
      model: d.model,
      generation: d.trim,
      trim: d.trim,
      korean_name: d.title,
      color: d.color,
      location: d.location,
      inspectionAvailable: d.inspectionAvailable,
      engineCc: d.engineCc,
      engine_cc: d.engineCc,
      body_type: d.specifications?.['Body Type'],
      drive_type: d.specifications?.['Drive Type'],
      accident_history: d.specifications?.['Accident History'],
    };
  } catch (error) {
    console.warn('Failed to fetch vehicle details:', error);
    return null;
  }
}

// ─── Admin / Stats ───────────────────────────────────────────────────────

export interface StatsResponse {
  totalCars: number;
  lastUpdated: string | null;
}

export async function getStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/admin/stats`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ─── Catalog API (via backend) ────────────────────────────────────────────

export interface CarapisManufacturer {
  name: string;
  slug: string;
}

export interface CarapisModelGroup {
  name: string;
  slug: string;
}

export interface CarapisModel {
  name: string;
  slug: string;
}

export async function listManufacturers(params: { limit?: number; country?: string } = {}): Promise<{ count: number; results: CarapisManufacturer[] }> {
  try {
    const res = await fetch(`${API_URL}/catalog/manufacturers?country=${params.country || 'KR'}`);
    if (!res.ok) return { count: 0, results: [] };
    const data = await res.json();
    if (!data.success) return { count: 0, results: [] };
    return data.data || { count: 0, results: [] };
  } catch {
    return { count: 0, results: [] };
  }
}

export async function listModelGroups(manufacturerSlug: string): Promise<{ count: number; results: CarapisModelGroup[] }> {
  try {
    const res = await fetch(`${API_URL}/catalog/model-groups/${encodeURIComponent(manufacturerSlug)}`);
    if (!res.ok) return { count: 0, results: [] };
    const data = await res.json();
    if (!data.success) return { count: 0, results: [] };
    return data.data || { count: 0, results: [] };
  } catch {
    return { count: 0, results: [] };
  }
}

export async function listModels(manufacturerSlug: string, modelGroupSlug: string): Promise<{ count: number; results: CarapisModel[] }> {
  try {
    const res = await fetch(`${API_URL}/catalog/models/${encodeURIComponent(manufacturerSlug)}/${encodeURIComponent(modelGroupSlug)}`);
    if (!res.ok) return { count: 0, results: [] };
    const data = await res.json();
    if (!data.success) return { count: 0, results: [] };
    return data.data || { count: 0, results: [] };
  } catch {
    return { count: 0, results: [] };
  }
}
