const moment = require('moment');

class RideMapper {
  static entityToDto(ride) {
    if (!ride) {
      return null;
    }

    return Object.assign(
      {},
      {
        clientId: ride.clientId,
        client: ride.clientName,
        pickupTimeAndDateInUTC: moment(ride.pickupTimeAndDateInUTC).utc(),
        locationFrom: {
          latitude: ride.locationFrom.x,
          longitude: ride.locationFrom.y,
          suburb: ride.suburbFrom,
          postcode: ride.postCodeFrom,
          placeName: ride.placeNameFrom
        },
        locationTo: {
          latitude: ride.locationTo.x,
          longitude: ride.locationTo.y,
          suburb: ride.suburbTo,
          postcode: ride.postCodeTo,
          placeName: ride.placeNameTo
        },
        driverGender: ride.driverGender,
        carType: ride.carType,
        status: ride.status,
        deleted: parseInt(ride.deleted + ''),
        facilitatorId: ride.facilitatorId || ride.facilitatorEmail,
        description: ride.description,
        hasMps: !!ride.hasMps, // force bool
        id: ride.id,
        clientPhoneNumber: ride.clientPhoneNumber,
        clientDescription: ride.clientDescription
      },
      ride.driver_id
        ? {
            driver: {
              driver_id: ride.driver_id,
              confirmed: ride.confirmed,
              updated_at: ride.updated_at,
              ride_id: ride.id,
              driver_name: ride.driver_name
            }
          }
        : {}
    );
  }

  static dtoToEntity(ride, facilitatorId) {
    if (!ride) {
      return null;
    }
    return {
      clientId: ride.clientId,
      pickupTimeAndDateInUTC: moment.utc(ride.pickupTimeAndDateInUTC),
      locationFrom: {
        latitude: ride.locationFrom.latitude,
        longitude: ride.locationFrom.longitude,
        suburb: ride.locationFrom.suburb,
        placeName: ride.locationFrom.placeName,
        postcode: ride.locationFrom.postcode
      },
      locationTo: {
        latitude: ride.locationTo.latitude,
        longitude: ride.locationTo.longitude,
        suburb: ride.locationTo.suburb,
        placeName: ride.locationTo.placeName,
        postcode: ride.locationTo.postcode
      },
      driverGender: ride.driverGender,
      carType: ride.carType,
      status: ride.status,
      deleted: 0,
      facilitatorId: facilitatorId,
      hasMps: !!ride.hasMps, // force bool
      description: ride.description,
      clientPhoneNumber: ride.clientPhoneNumber,
      clientDescription: ride.clientDescription,
      driver: ride.driver
    };
  }
}

module.exports = RideMapper;
