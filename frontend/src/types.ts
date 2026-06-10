export interface FamilyGroup {
  adults: number;
  children: number;
  roomConfig: string; // np. "1 duży", "2 pokoje"
}

export interface Offer {
  id: string;
  title: string;
  url: string;
  price: number;
  destination: string;
  startDate: string;
  endDate: string;
  familyGroups: FamilyGroup[];
  totalPeople: number;
  platform: string;
  createdAt: string;
  hotelRating?: number; // gwiazdki hotelu
  foodConfig?: string; // np. All Inclusive
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
  familyGroups: FamilyGroup[];
  totalPeople: number;
  platform: string;
  hotelRating?: number;
  foodConfig?: string;
}

export interface Rating {
  id: string;
  listOfferId: string;
  raterName: string;
  locationRating: number;
  priceRating: number;
  amenitiesRating: number;
  foodRating?: number;
  serviceRating?: number;
  comments: string;
  isFor: boolean;
  createdAt: string;
}

