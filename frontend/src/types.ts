export interface Offer {
  id: string;
  title: string;
  url: string;
  price: number;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  rooms: number;
  platform: string;
  createdAt: string;
}

export interface List {
  id: string;
  name: string;
  ownerName: string;
  createdAt: string;
  offers?: ListOffer[];
}

export interface ListOffer {
  id: string;
  listId: string;
  offerId: string;
  title: string;
  url: string;
  price: number;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  rooms: number;
  platform: string;
}

export interface Rating {
  id: string;
  listOfferId: string;
  raterName: string;
  locationRating: number;
  priceRating: number;
  amenitiesRating: number;
  comments: string;
  isFor: boolean;
  createdAt: string;
}
