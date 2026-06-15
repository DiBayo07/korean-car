import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase Client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock Data structure in case Supabase is empty or fails
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
  status: string;
  engine_cc?: number;
  korean_name?: string;
  created_at?: string;
}

const DEFAULT_CARS: Vehicle[] = [
  {
    id: 'car-1',
    type: 'car',
    brand: 'Hyundai',
    model: 'The New Grandeur IG',
    generation: 'IG',
    trim: '2.5 Premium Choice',
    year: 2020,
    month: 1,
    mileage: 58712,
    price_usd: 15474,
    image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-2',
    type: 'car',
    brand: 'Hyundai',
    model: 'Grandeur IG',
    generation: 'IG',
    trim: '2.4 Premium (None)',
    year: 2018,
    month: 5,
    mileage: 69052,
    price_usd: 11622,
    image_url: 'https://images.unsplash.com/photo-1617469767053-d3b508a0d84d?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-3',
    type: 'car',
    brand: 'Hyundai',
    model: 'i40',
    generation: 'VF',
    trim: '1.7 VGT PYL',
    year: 2013,
    month: 5,
    mileage: 231607,
    price_usd: 2524,
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-4',
    type: 'car',
    brand: 'Kia',
    model: 'K7 Premier',
    generation: 'YG',
    trim: '2.5 GDI Noblesse',
    year: 2020,
    month: 3,
    mileage: 72154,
    price_usd: 16900,
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-5',
    type: 'car',
    brand: 'Genesis',
    model: 'G80',
    generation: 'DH',
    trim: 'BH330 Luxury Basic',
    year: 2008,
    month: 5,
    mileage: 99817,
    price_usd: 2590,
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-6',
    type: 'car',
    brand: 'Hyundai',
    model: 'Palisade',
    generation: 'LX2',
    trim: 'Diesel 2.2 4WD Prestige',
    year: 2018,
    month: 12,
    mileage: 113126,
    price_usd: 16536,
    image_url: 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-7',
    type: 'car',
    brand: 'BMW',
    model: '5 Series 520d',
    generation: 'G30',
    trim: 'M Sport Plus',
    year: 2019,
    month: 6,
    mileage: 85200,
    price_usd: 19800,
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  },
  {
    id: 'car-8',
    type: 'car',
    brand: 'Mercedes-Benz',
    model: 'E-Class E220d',
    generation: 'W213',
    trim: 'Avantgarde',
    year: 2018,
    month: 9,
    mileage: 92400,
    price_usd: 22500,
    image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop',
    status: 'Available'
  }
];

const DEFAULT_BIKES: Vehicle[] = [
  {
    id: 'bike-1',
    type: 'bike',
    brand: 'Royal Enfield',
    model: 'Interceptor 650',
    year: 2022,
    mileage: 7000,
    price_krw: 5200000,
    price_usd: 3453,
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 650,
    korean_name: '로얄엔필드 인터셉터 650'
  },
  {
    id: 'bike-2',
    type: 'bike',
    brand: 'Yamaha',
    model: 'YZF-R3',
    year: 2019,
    mileage: 32364,
    price_krw: 3000000,
    price_usd: 1992,
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 321,
    korean_name: 'YZF-R3'
  },
  {
    id: 'bike-3',
    type: 'bike',
    brand: 'Yamaha',
    model: 'R7',
    year: 2022,
    mileage: 300,
    price_krw: 9700000,
    price_usd: 6442,
    image_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 689,
    korean_name: 'R7'
  },
  {
    id: 'bike-4',
    type: 'bike',
    brand: 'Daelim',
    model: 'Citi Ace 110',
    year: 2017,
    mileage: 25000,
    price_krw: 1500000,
    price_usd: 996,
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 110,
    korean_name: '씨티에이스'
  },
  {
    id: 'bike-5',
    type: 'bike',
    brand: 'Yamaha',
    model: 'VOX',
    year: 2008,
    mileage: 9500,
    price_krw: 500000,
    price_usd: 332,
    image_url: 'https://images.unsplash.com/photo-1558981852-4105e412a12b?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 49,
    korean_name: '복스 50'
  },
  {
    id: 'bike-6',
    type: 'bike',
    brand: 'SYM',
    model: 'Mio 100',
    year: 2007,
    mileage: 18194,
    price_krw: 700000,
    price_usd: 465,
    image_url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 100,
    korean_name: '미오 100'
  },
  {
    id: 'bike-7',
    type: 'bike',
    brand: 'Honda',
    model: 'SCR110α',
    year: 2020,
    mileage: 21200,
    price_krw: 1600000,
    price_usd: 1063,
    image_url: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 110,
    korean_name: 'SCR110α'
  },
  {
    id: 'bike-8',
    type: 'bike',
    brand: 'Daelim',
    model: 'Aera 125',
    year: 2016,
    mileage: 86000,
    price_krw: 1200000,
    price_usd: 797,
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop',
    status: 'Available',
    engine_cc: 125,
    korean_name: '에이프 125'
  }
];

const getLocalStorageVehicles = (): Vehicle[] => {
  const data = localStorage.getItem('kg_motors_vehicles');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  const all = [...DEFAULT_CARS, ...DEFAULT_BIKES];
  localStorage.setItem('kg_motors_vehicles', JSON.stringify(all));
  return all;
};

// Functions to query database (with LocalStorage fallback)
export const getVehicles = async (): Promise<Vehicle[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data as Vehicle[];
      }
      
      // If table is connected but empty, try seeding it in Supabase, or fallback to mock
      const mock = getLocalStorageVehicles();
      return mock;
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to LocalStorage:', err);
      return getLocalStorageVehicles();
    }
  }
  return getLocalStorageVehicles();
};

export const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const newVehicle = {
    ...vehicle,
    id: Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle])
        .select();
      
      if (error) throw error;
      if (data && data[0]) {
        return data[0] as Vehicle;
      }
    } catch (err) {
      console.warn('Supabase insert failed, adding to LocalStorage:', err);
    }
  }

  // LocalStorage insert
  const current = getLocalStorageVehicles();
  const updated = [newVehicle, ...current];
  localStorage.setItem('kg_motors_vehicles', JSON.stringify(updated));
  return newVehicle;
};

export const deleteVehicle = async (id: string): Promise<boolean> => {
  if (supabase) {
    try {
      // Check if it's a supabase UUID or a temp string ID
      const isUuid = id.length === 36;
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq(isUuid ? 'id' : 'brand', id); // Fallback logic or exact match
      
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete failed, removing from LocalStorage:', err);
    }
  }

  const current = getLocalStorageVehicles();
  const updated = current.filter(v => v.id !== id);
  localStorage.setItem('kg_motors_vehicles', JSON.stringify(updated));
  return true;
};
