const DatabaseManager = require('../../main/database/DatabaseManager');
const RideStatus = require('../../main/rides/RideStatus');
const UpdateRideService = require('../../main/rides/UpdateRideService');
const FindRideTestRepository = require('./RideTestRepository');
const RideEntityBuilder = require('./RideEntityBuilder');
const RideRepository = require('../../main/rides/RideRepository');
const RandomUtils = require('../RandomUtils');
const RideMapper = require('../../main/rides/RideMapper');
const moment = require('moment');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const assert = chai.assert;
chai.use(chaiExclude);

let updateRideService;
let databaseManager;
let mockDatabaseManager;
let findRideTestRepository;
let connection;
let loginData;
let pickupTimeAndDateInUTC;
let rideRepository;

before(async () => {
  databaseManager = new DatabaseManager();
  mockDatabaseManager = new DatabaseManager();
  rideRepository = new RideRepository(databaseManager);
  connection = databaseManager.createConnection();
  mockDatabaseManager.createConnection = () => connection;
  mockDatabaseManager.closeConnection = () => Promise.resolve();
});

after(async () => {
  await databaseManager.closeConnection(connection);
});

beforeEach(async () => {
  await databaseManager.beginTransaction(connection);

  updateRideService = new UpdateRideService(mockDatabaseManager);
  findRideTestRepository = new FindRideTestRepository(databaseManager);
});

afterEach(async () => {
  await databaseManager.rollback(connection);
});

beforeEach(function setupData() {
  loginData = {email: RandomUtils.randomEmail()};
  pickupTimeAndDateInUTC = moment();
});

describe('SQL', function () {
  it('should update and retrieve ride', async function () {
    // given
    const ride = randomRideWithFacilitator(loginData.email);
    await databaseContainsRide(ride);
    const modifiedRide = modifyRide(ride);
    let storedRide = await findRideTestRepository.findOneByClientEmail(ride.client, connection);

    // when
    await updateRideService.updateRide(storedRide.id, modifiedRide, loginData);
    let modifiedRideFromDb = await findRideTestRepository.findOneByClientEmail(storedRide.client, connection);

    // then
    assert.deepEqualExcluding(modifiedRideFromDb, RideMapper.dtoToEntity(modifiedRide), ['id', 'datetime', 'facilitatorId', 'pickupTimeAndDateInUTC']);
    assert.equal(modifiedRideFromDb.facilitatorId, loginData.email);
    assert.equal(modifiedRideFromDb.pickupTimeAndDateInUTC.setMilliseconds(0), pickupTimeAndDateInUTC.toDate().setMilliseconds(0));
  });
});

function modifyRide(ride) {
  return {
    'carType': 'suv',
    'client': ride.client,
    'deleted': 0,
    'description': 'wanna surf',
    'driverGender': 'male',
    'fbLink': 'http://facebook.com/profile/facilitator.test.1',
    'locationFrom': {
      "latitude": 1234,
      "longitude": 4567,
      "placeName": "home",
      "suburb": "Bondi Junction",
      "postcode": "2010"
    },
    'locationTo': {
      "latitude": 9999,
      "longitude": 7777,
      "placeName": "beach",
      "suburb": "Bondi",
      "postcode": "2011"
    },
    'pickupTimeAndDateInUTC': pickupTimeAndDateInUTC.format('YYYY-MM-DD HH:mm:ss.SSS'),
    'status': RideStatus.OPEN
  };
}

async function databaseContainsRide(ride) {
  await rideRepository.create(ride, connection);
}

function randomRideWithFacilitator(facilitatorId) {
  const ride = RideEntityBuilder.randomRideEntity();
  ride.facilitatorId = facilitatorId;
  return ride;
}



