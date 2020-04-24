export type Gender = 'male' | 'female';
export type CarType = 'suv' | 'noSUV';
export type RideStatus = 'OPEN' | 'CONFIRMED' | 'ENDED' | 'CANCELLED';

export interface Location {
  latitude: string;
  longitude: string;
  suburb: string;
  postCode: string;
  placeName: string;
}

export interface Ride {
  clientId: string;
  facilitatorEmail: string;
  pickupTimeAndDate: Date;
  locationFrom: Location;
  locationTo: Location;
  driverGender: Gender;
  carType: CarType;
  status: RideStatus;
  hasMps: boolean;
  description: string;
}

export interface OptionalClient {
  id?: number;
  name?: string;
  description?: string;
  phoneNumber?: string;
  preferredDriverGender?: Gender;
  preferredCarType?: CarType;
  homeLocation?: Location;
  hasMps?: boolean;
}

type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

export type Client = Complete<OptionalClient>;

export interface Image {
  id?: string;
  mimeType: string;
  caption?: string;
  content?: string;
}
