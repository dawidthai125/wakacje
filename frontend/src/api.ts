import axios from 'axios';
import { Offer, List, ListOffer, Rating } from './types';

const API_BASE = '/api';

export const offersAPI = {
  getAll: () => axios.get<Offer[]>(`${API_BASE}/offers`),
  create: (offer: Omit<Offer, 'id' | 'createdAt'>) => axios.post<Offer>(`${API_BASE}/offers`, offer),
  delete: (id: string) => axios.delete(`${API_BASE}/offers/${id}`),
};

export const listsAPI = {
  getAll: () => axios.get<List[]>(`${API_BASE}/lists`),
  getById: (id: string) => axios.get<List>(`${API_BASE}/lists/${id}`),
  create: (list: Omit<List, 'id' | 'createdAt' | 'offers'>) => axios.post<List>(`${API_BASE}/lists`, list),
  addOffer: (listId: string, offerId: string) => axios.post<ListOffer>(`${API_BASE}/lists/${listId}/offers`, { offerId }),
  removeOffer: (listId: string, listOfferId: string) => axios.delete(`${API_BASE}/lists/${listId}/offers/${listOfferId}`),
};

export const ratingsAPI = {
  getByListOffer: (listOfferId: string) => axios.get<Rating[]>(`${API_BASE}/ratings/list-offer/${listOfferId}`),
  create: (rating: Omit<Rating, 'id' | 'createdAt'>) => axios.post<Rating>(`${API_BASE}/ratings`, rating),
};

export const scrapeAPI = {
  fetchData: (url: string) => axios.post<{ title: string; price: number; platform: string; url: string }>(`${API_BASE}/scrape`, { url }),
};

export const authAPI = {
  checkPhone: (phone: string) => axios.post<{ exists: boolean; isInitialized: boolean; profile: any }>(`${API_BASE}/auth/check-phone`, { phone }),
  setupPin: (phone: string, pin: string) => axios.post<{ token: string; profile: any }>(`${API_BASE}/auth/setup-pin`, { phone, pin }),
  login: (phone: string, pin: string) => axios.post<{ token: string; profile: any }>(`${API_BASE}/auth/login`, { phone, pin }),
  updateProfile: (id: string, firstName: string, lastName: string) => axios.put(`${API_BASE}/auth/profile`, { id, firstName, lastName }),
};

export const groupsAPI = {
  create: (name: string, description: string, createdBy: string) => axios.post(`${API_BASE}/groups`, { name, description, createdBy }),
  getUserGroups: (userId: string) => axios.get<any[]>(`${API_BASE}/groups/user/${userId}`),
  addMember: (groupId: string, phone: string) => axios.post(`${API_BASE}/groups/${groupId}/members`, { phone }),
  getMembers: (groupId: string) => axios.get<any[]>(`${API_BASE}/groups/${groupId}/members`),
  addOffer: (groupId: string, offerId: string, proposedBy: string, isOfficial: boolean) => 
    axios.post(`${API_BASE}/groups/${groupId}/offers`, { offerId, proposedBy, isOfficial }),
  getOffers: (groupId: string) => axios.get<any[]>(`${API_BASE}/groups/${groupId}/offers`),
};
