import moment from 'moment';
import { Ride } from './model';

export default function isRideInPast(ride: Ride) {
  return moment(ride.pickupTimeAndDate).isBefore(moment.now());
}
