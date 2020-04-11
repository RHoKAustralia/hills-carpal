export type Gender = 'male' | 'female';
export type CarType = 'suv' | 'noSUV';
export type RideStatus = 'OPEN' | 'CONFIRMED' | 'ENDED' | 'CANCELLED';

export interface Location {
  latitude: string;
  longitude: string;
  suburb: string;
  postcode: string;
  placeName: string;
}

export interface Ride {
  clientId: string;
  facilitatorEmail: string;
  pickupTimeAndDate: Date;
  locationFrom: Location;
  locationTo: Location;
  fbLink: string;
  driverGender: string;
  carType: string;
  status: string;
  deleted: boolean;
  suburbFrom: string;
  placeNameFrom: string;
  postCodeFrom: string;
  suburbTo: string;
  placeNameTo: string;
  postCodeTo: string;
  hasMps: boolean;
  description: string;
}

export interface Client {
  id: number;
  name: string;
  description: string;
  phoneNumber: string;
  preferredDriverGender: Gender;
  preferredCarType: CarType;
  locationHome: Location;
  placeNameHome: string;
  hasMps: boolean;
}

export interface Image {
  mime_type: string;
  caption: string
}