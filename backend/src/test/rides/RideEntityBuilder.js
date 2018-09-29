const RandomUtils = require('../RandomUtils');
const RideStatus = require('../../main/rides/RideStatus');

const now = new Date();

class RideEntityBuilder {
  static randomRideEntity() {
    const client = `client.${Date.now()}`;
    const facilitator = `facilitator.${Date.now()}`;
    return {
      carType: "suv",
      client: `${client}@${RandomUtils.randomString(5)}.com`,
      deleted: 0,
      driverGender: (Math.random() * 1000) % 2 ? "male" : "female",
      facilitatorId: `${facilitator}@${RandomUtils.randomString(5)}.com`,
      fbLink: `http://facebook.com/profile/${client}`,
      locationFrom: {
        latitude: RandomUtils.randomNumber(4),
        longitude: RandomUtils.randomNumber(4),
        placeName: RandomUtils.randomString(10),
        postcode: RandomUtils.randomNumber(4).toString(),
        suburb: RandomUtils.randomString(10)
      },
      locationTo: {
        latitude: RandomUtils.randomNumber(4),
        longitude: RandomUtils.randomNumber(4),
        placeName: RandomUtils.randomString(10),
        postcode: RandomUtils.randomNumber(4).toString(),
        suburb: RandomUtils.randomString(10)
      },
      pickupTimeAndDateInUTC: new Date(new Date(now.setMilliseconds(0)).setDate(now.getDate() + 5)),
      status: RideStatus.OPEN,
      description: RandomUtils.randomString(10),
    }
  }
}

module.exports = RideEntityBuilder;