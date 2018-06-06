module.exports.mapToDto = (rides) => {
  return (rides || []).map(ride => ({
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
    "facilitatorId": ride.facilitatorEmail,
    "id": ride.id
  }))
};
