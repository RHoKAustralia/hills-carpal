export type Gender = 'male' | 'female' | 'any';
export type CarType = 'suv' | 'noSUV' | 'All';
export type RideStatus = 'OPEN' | 'CONFIRMED' | 'ENDED' | 'CANCELLED';

export interface Location {
  id?: number;
  latitude: number;
  longitude: number;
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

interface RideCommon {
  id?: number;
  status: RideStatus;
  locationFrom: Location;
  locationTo: Location;
  driver: RideDriver;
  driverGender: Gender;
  carType: CarType;
  hasMps: boolean;
  description: string;
  facilitatorEmail: string;
  pickupTimeAndDate: string;
}

export interface Ride extends RideCommon {
  client: OptionalClient;
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

export interface RideInput extends RideCommon {
  clientId: number;
}
