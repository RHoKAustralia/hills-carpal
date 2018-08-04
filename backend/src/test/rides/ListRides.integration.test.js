const DatabaseManager = require('../../main/database/DatabaseManager');
const ListRidesController = require('../../main/rides/ListRidesService');
const FindRideTestRepository = require('./RideTestRepository');
const RideEntityBuilder = require('./RideEntityBuilder');
const RideRepository = require('../../main/rides/RideRepository');
const RandomUtils = require('../RandomUtils');

let listRideController;
let databaseManager;
let mockDatabaseManager;
let findRideTestRepository;
let rideRepository;
let connection;

const chai = require('chai');
const chaiExclude = require('chai-exclude');
const assert = chai.assert;
chai.use(chaiExclude);

before(async () => {
  databaseManager = new DatabaseManager();
  mockDatabaseManager = new DatabaseManager();
  connection = databaseManager.createConnection();
  mockDatabaseManager.createConnection = () => connection;
  mockDatabaseManager.closeConnection = () => Promise.resolve(null);
});

after(async () => {
  await databaseManager.closeConnection(connection);
});

beforeEach(async () => {
  await databaseManager.beginTransaction(connection);

  listRideController = new ListRidesController(mockDatabaseManager);
  findRideTestRepository = new FindRideTestRepository(databaseManager);
  rideRepository = new RideRepository(databaseManager);
});

afterEach(async () => {
  await databaseManager.rollback(connection);
});

describe('When listing rides', async () => {
  it('should show rides for facilitator', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'facilitator'};
    const email = loginData.email;
    const ride1 = randomRideWithFacilitator(email);
    const ride2 = randomRideWithFacilitator(email);
    await databaseContainsRides(ride1, ride2);

    // when
    const rides = await listRideController.listRides({}, loginData);

    assert.deepEqualExcluding(rides, [ride1, ride2], 'id');
  });

  it('should show all rides for admin', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'admin'};
    const ride1 = RideEntityBuilder.randomRideEntity();
    const ride2 = RideEntityBuilder.randomRideEntity();
    await databaseContainsRides(ride1, ride2);

    // when
    const rides = (await listRideController.listRides({}, loginData)).map(removeId);

    assert.deepInclude(rides, ride1);
    assert.deepInclude(rides, ride2);
  });

  it('should show all rides for driver', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'driver', driverGender: 'male'};
    const ride1 = randomRideWithGender('male');
    const ride2 = randomRideWithGender('female');
    const ride3 = randomRideWithGender('any');
    await databaseContainsRides(ride1, ride2, ride3);

    // when
    const rides = (await listRideController.listRides({}, loginData)).map(removeId);

    assert.deepInclude(rides, ride1);
    assert.deepInclude(rides, ride3);
    assert.notDeepInclude(rides, ride2);
    // assert.deepEqualExcluding(rides, [ride1, ride3], 'id');
  });

  async function databaseContainsRides(...rides) {
    for (let ride of rides) {
      await rideRepository.create(ride, connection);
    }
  }

  function removeId(ride){
    delete ride.id;
    return ride;
  }

  function randomRideWithGender(gender) {
    const ride = RideEntityBuilder.randomRideEntity();
    ride.driverGender = gender;
    return ride;
  }

  function randomRideWithFacilitator(facilitatorId) {
    const ride = RideEntityBuilder.randomRideEntity();
    ride.facilitatorId = facilitatorId;
    return ride;
  }
});



