export type VehicleType = 'car' | 'moto';

// ─── Search params accepted by /api/search ────────────────────────────────

export interface SearchQuery {
  type?: string;
  brand?: string;
  model?: string;
  yearFrom?: string;
  yearTo?: string;
  priceFrom?: string;
  priceTo?: string;
  fuel?: string;
  transmission?: string;
  mileage?: string;
  page?: string;
  limit?: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────

export interface SearchItemDto {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  thumbnail: string;
  source: 'encar';
  brand?: string;
  model?: string;
  type?: VehicleType;
}

export interface SearchResponseDto {
  total: number;
  page: number;
  limit: number;
  items: SearchItemDto[];
}

export interface ItemDetailDto {
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

// ─── Brand translation ────────────────────────────────────────────────────

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
};

export function translateBrand(korean: string): string {
  return BRAND_MAP[korean] || korean;
}
