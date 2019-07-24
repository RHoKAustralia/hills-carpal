class ClientMapper {
  static entityToDto(client) {
    if (!client) {
      return null;
    }
    return {
      name: client.name,
      description: client.description,
      locationHome: {
        latitude: client.locationHome.x,
        longitude: client.locationHome.y,
        placeName: client.placeNameHome
      },
      driverGender: client.driverGender,
      carType: client.carType,
      hasMps: !!client.hasMps, // force bool
      phoneNumber: client.phoneNumber,
      id: client.id,
      images: client.images
    };
  }

  static dtoToEntity(client) {
    if (!client) {
      return null;
    }
    return {
      name: client.name,
      description: client.description,
      locationHome: {
        latitude: client.locationHome.latitude,
        longitude: client.locationHome.longitude,
        placeName: client.locationHome.placeName
      },
      driverGender: client.driverGender,
      carType: client.carType,
      hasMps: !!client.hasMps, // force bool
      phoneNumber: client.phoneNumber
    };
  }
}

module.exports = ClientMapper;
