import axios from 'axios';
import { Offer, List, ListOffer, Rating } from './types';

const API_BASE = 'http://localhost:3002/api';

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
