// hotelbeds.service.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.makcorps.com';
const API_KEY = '6857ccfad63a2500de8d3ba0';

// Interfaces
export interface Vendor {
  name: string;
  price: string | null;
  tax: string | null;
}

export interface HotelSearchParams {
  hotelid?: string; // Make hotelid optional
  cityid?: string; // Add cityid as optional
  rooms: string;
  adults: string;
  checkin: string;
  checkout: string;
  cur: string;
}

interface CitySearchResponse {
  document_id: string;
  name: string;
  type: string; // Add type field
  // Add other relevant fields if needed
}

export const fetchCityId = async (cityName: string): Promise<string> => {
  try {
    const response = await axios.get<CitySearchResponse[]>(`${API_BASE_URL}/mapping`, {
      params: {
        api_key: API_KEY,
        name: cityName,
      },
    });

    console.log('City Search API Response:', response.data);

    if (response.data && response.data.length > 0) {
      // Filter for city type and check if name contains the input city name
      const city = response.data.find(item => 
        item.type === 'CITY' && 
        item.name.toLowerCase().includes(cityName.toLowerCase()) && 
        item.document_id
      );
      if (city) {
        return city.document_id;
      } else {
        throw new Error(`City ID not found for ${cityName}. Please try a more specific city name or check for typos.`);
      }
    } else {
      throw new Error(`No results found for city: ${cityName}.`);
    }
  } catch (error: any) {
    console.error('Error fetching city ID:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      `Failed to fetch city ID for ${cityName}. Please check the city name and try again.`
    );
  }
};

export const fetchHotelsByCity = async (params: HotelSearchParams): Promise<Vendor[]> => {
  try {
    const response = await axios.get<any>(`${API_BASE_URL}/city`, {
      params: {
        cityid: params.cityid,
        rooms: params.rooms,
        adults: params.adults,
        checkin: params.checkin,
        checkout: params.checkout,
        api_key: API_KEY,
        cur: params.cur,
      },
    });

    console.log('API Response (by City):', response.data);

    const comparison = response.data.comparison[0] || [];
    const vendors: Vendor[] = Object.keys(comparison[0] || {})
      .filter((key) => key.startsWith('vendor'))
      .map((key, index) => ({
        name: comparison[0][key] || 'Unknown Vendor',
        price: comparison[0][`price${index + 1}`],
        tax: comparison[0][`tax${index + 1}`],
      }))
      .filter((vendor) => vendor.name !== null && vendor.price !== null && vendor.tax !== null) as Vendor[];

    return vendors;
  } catch (error: any) {
    console.error('Error fetching hotel prices by city:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch hotel prices by city. Please check your inputs and try again.'
    );
  }
};

export const fetchHotelsById = async (params: HotelSearchParams): Promise<Vendor[]> => {
  try {
    const response = await axios.get<any>(`${API_BASE_URL}/hotel`, {
      params: {
        hotelid: params.hotelid,
        rooms: params.rooms,
        adults: params.adults,
        checkin: params.checkin,
        checkout: params.checkout,
        api_key: API_KEY,
        cur: params.cur,
      },
    });

    console.log('API Response (by ID):', response.data);

    const comparison = response.data.comparison[0] || [];
    const vendors: Vendor[] = Object.keys(comparison[0] || {})
      .filter((key) => key.startsWith('vendor'))
      .map((key, index) => ({
        name: comparison[0][key] || 'Unknown Vendor',
        price: comparison[0][`price${index + 1}`],
        tax: comparison[0][`tax${index + 1}`],
      }))
      .filter((vendor) => vendor.name !== null && vendor.price !== null && vendor.tax !== null) as Vendor[];

    return vendors;
  } catch (error: any) {
    console.error('Error fetching hotel prices by ID:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch hotel prices by ID. Please check your inputs and try again.'
    );
  }
};



