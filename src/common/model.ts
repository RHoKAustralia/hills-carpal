export type GenderPreference = 'male' | 'female' | 'any';
export type CarType = 'All' | 'suv' | 'noSUV';
export type RideStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'ENDED'
  | 'CANCELLED'
  | 'LOCKED'
  | 'NOT_READY';

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
  preferredDriverGender?: GenderPreference;
  preferredCarType?: CarType;
  homeLocation?: Location;
  hasMps?: boolean;
  inactive?: boolean;
}

export type Complete<T> = {
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

export type Gender = 'Male' | 'Female' | 'Other';

export interface OptionalDriver {
  id?: number;
  givenName?: string;
  familyName?: string;
  email?: string;
  mobile?: string;
  driverGender?: Gender;
  hasSuv?: boolean;
  driverRego?: string;
  mpsPermit?: string;
  auth0Id?: string;
  inactive?: boolean;
}

export type Driver = Complete<OptionalDriver>;

export interface OptionalFacilitator {
  id?: number;
  givenName?: string;
  familyName?: string;
  email?: string;
  mobile?: string;
  auth0Id?: string;
  inactive?: boolean;
}

export type Facilitator = Complete<OptionalFacilitator>;

export type WhoAmI = {
  auth0Id: string;
  driver?: {
    hasSuv: boolean;
    gender: Gender;
    inactive: boolean;
  };
  facilitator?: {
    inactive: boolean;
  };
};
