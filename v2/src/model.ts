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

export interface RideDriver {
  id: string;
  confirmed: boolean;
  name: string;
  updatedAt: Date;
}

export interface Ride {
  client: OptionalClient;
  status: RideStatus;
  locationFrom: Location;
  locationTo: Location;
  driver: RideDriver;
  driverGender: Gender;
  carType: CarType;
  hasMps: boolean;
  description: string;
  facilitatorEmail: string;
  pickupTimeAndDate: Date;
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
