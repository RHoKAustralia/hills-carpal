const RideMapper = require('../../main/rides/RideMapper');
const RandomUtils = require('../RandomUtils');
const RideStatus = require('../../main/rides/RideStatus');
const RideEntityBuilder = require('./RideEntityBuilder');

const chai = require('chai');
const chaiExclude = require('chai-exclude');
const assert = chai.assert;
const moment = require('moment');
chai.use(chaiExclude);


describe('RideMapper', async () => {
  it('should convert dto to entity', async function () {
    const pickupTimeAndDateInUTC = moment();
    const facilitatorId = RandomUtils.randomEmail();
    const dto = {
      'carType': 'suv',
      'client': RandomUtils.randomEmail(),
      'deleted': 0,
      'description': RandomUtils.randomString(10),
      'driverGender': (RandomUtils.randomNumber(2) % 2) ? 'male' : 'female',
      'fbLink': 'http://facebook.com/profile/' + RandomUtils.randomString(10),
      'locationFrom': {
        "latitude": RandomUtils.randomNumber(4),
        "longitude": RandomUtils.randomNumber(4),
        "placeName": RandomUtils.randomString(10),
        "suburb": RandomUtils.randomString(10),
        "postcode": RandomUtils.randomNumber(4)
      },
      'locationTo': {
        "latitude": RandomUtils.randomNumber(4),
        "longitude": RandomUtils.randomNumber(4),
        "placeName": RandomUtils.randomString(10),
        "suburb": RandomUtils.randomString(10),
        "postcode": RandomUtils.randomNumber(4)
      },
      'pickupTimeAndDateInUTC': pickupTimeAndDateInUTC.format('YYYY-MM-DD HH:mm:ss.SSS'),
      'status': RideStatus.OPEN
    };

    const entity = RideMapper.dtoToEntity(dto, facilitatorId);

    assert.deepEqual(entity, {
      client: dto.client,
      pickupTimeAndDateInUTC: new Date(dto.pickupTimeAndDateInUTC),
      locationFrom: {
        latitude: dto.locationFrom.latitude,
        longitude: dto.locationFrom.longitude,
        suburb: dto.locationFrom.suburb,
        placeName: dto.locationFrom.placeName,
        postcode: dto.locationFrom.postcode,
      },
      locationTo: {
        latitude: dto.locationTo.latitude,
        longitude: dto.locationTo.longitude,
        suburb: dto.locationTo.suburb,
        placeName: dto.locationTo.placeName,
        postcode: dto.locationTo.postcode,
      },
      fbLink: dto.fbLink,
      driverGender: dto.driverGender,
      carType: dto.carType,
      status: dto.status,
      deleted: 0,
      facilitatorId: facilitatorId,
      description: dto.description
    });
  });

  it('should convert entity to dto', async function () {
    // given
    const entity = RideEntityBuilder.randomRideEntity();

    // then
    const dto = RideMapper.entityToDto(entity);

    // then
    assert.deepEqual(dto, {
      client: entity.client,
      pickupTimeAndDateInUTC: new Date(entity.pickupTimeAndDateInUTC),
      locationFrom: {
        latitude: entity.locationFrom.x,
        longitude: entity.locationFrom.y,
        suburb: entity.suburbFrom,
        postcode: entity.postCodeFrom,
        placeName: entity.placeNameFrom
      },
      locationTo: {
        latitude: entity.locationTo.x,
        longitude: entity.locationTo.y,
        suburb: entity.suburbTo,
        postcode: entity.postCodeTo,
        placeName: entity.placeNameTo
      },
      fbLink: entity.fbLink,
      driverGender: entity.driverGender,
      carType: entity.carType,
      status: entity.status,
      deleted: entity.deleted,
      facilitatorId: entity.facilitatorId,
      description: entity.description,
      id: entity.id
    });
  });

});



