class RideMapper {
  static entityToDto(ride) {
    if(!ride){
      return null;
    }
    return {
      "client": ride.client,
      "pickupTimeAndDateInUTC": new Date(ride.pickupTimeAndDateInUTC),
      "locationFrom": {
        "latitude": ride.locationFrom.x,
        "longitude": ride.locationFrom.y,
        "suburb": ride.suburbFrom,
        "postcode": ride.postCodeFrom,
        "placeName": ride.placeNameFrom
      },
      "locationTo": {
        "latitude": ride.locationTo.x,
        "longitude": ride.locationTo.y,
        "suburb": ride.suburbTo,
        "postcode": ride.postCodeTo,
        "placeName": ride.placeNameTo
      },
      "fbLink": ride.fbLink,
      "driverGender": ride.driverGender,
      "carType": ride.carType,
      "status": ride.status,
      "deleted": parseInt(ride.deleted + ''),
      "facilitatorId": ride.facilitatorId || ride.facilitatorEmail,
      "description": ride.description,
      "id": ride.id
    }
  }

  static dtoToEntity(ride, facilitatorId) {
    if(!ride){
      return null;
    }
    return {
      client: `${ride.client}`,
      pickupTimeAndDateInUTC: new Date(ride.pickupTimeAndDateInUTC),
      locationFrom: {
        latitude: ride.locationFrom.latitude,
        longitude: ride.locationFrom.longitude,
        suburb: ride.locationFrom.suburb,
        placeName: ride.locationFrom.placeName,
        postcode: ride.locationFrom.postcode,
      },
      locationTo: {
        latitude: ride.locationTo.latitude,
        longitude: ride.locationTo.longitude,
        suburb: ride.locationTo.suburb,
        placeName: ride.locationTo.placeName,
        postcode: ride.locationTo.postcode,
      },
      fbLink: ride.fbLink,
      driverGender: ride.driverGender,
      carType: ride.carType,
      status: ride.status,
      deleted: 0,
      facilitatorId: facilitatorId,
      description: ride.description
    }
  }
}

module.exports = RideMapper;
