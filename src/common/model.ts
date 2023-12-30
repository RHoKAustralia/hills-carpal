export type Gender = 'male' | 'female' | 'any';
export type CarType = 'All' | 'suv' | 'noSUV';
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
  description: string;
  facilitatorEmail: string;
  pickupTimeAndDate: string;
  rideCreatedTimeAndDate: Date;
}

export interface Ride extends RideCommon {
  client: OptionalClient;
}

export interface OptionalClient {
  id?: number;
  name?: string;
  clientDescription?: string;
  phoneNumber?: string;
  preferredDriverGender?: Gender;
  preferredCarType?: CarType;
  homeLocation?: Location;
  hasMps?: boolean;
  inactive?: boolean;
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

export type SatisfactionLevel = 'good' | 'ok' | 'couldBeBetter';
export type PickupLateness = 'onTime' | 'fiveMinutesLate' | 'didNotHappen';
export type MobilityPermit = 'start' | 'end' | 'both' | 'neither';

/**
 * Payload for the complete ride endpoint
 */
export interface CompletePayload {
  lateness: PickupLateness;
  satisfaction: SatisfactionLevel;
  communicationsIssues?: string;
  mobilityPermitUsedPickup: boolean;
  mobilityPermitUsedDropOff: boolean;
  mobilityPermitUsedOtherAddress?: string;
  reimbursementAmount: number;
  anythingElse?: string;
}

export interface Driver {
  id: number;
  givenName: string;
  familyName: string;
  email: string;
  mobile: string;
  driverGender: 'Male' | 'Female' | 'Other';
  hasSuv: boolean;
  driverName: string;
  driverRego: string;
  mpsPermit: string;
}