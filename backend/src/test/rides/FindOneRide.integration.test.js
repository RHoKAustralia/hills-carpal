const DatabaseManager = require('../../main/database/DatabaseManager');
const FindOneRideService = require('../../main/rides/FindOneRideService');
const RideTestRepository = require('./RideTestRepository');
const RideEntityBuilder = require('./RideEntityBuilder');
const RideRepository = require('../../main/rides/RideRepository');
const RandomUtils = require('../RandomUtils');

let findOneRideService;
let databaseManager;
let mockDatabaseManager;
let rideRepository;
let connection;
let rideTestRepository;

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

  findOneRideService = new FindOneRideService(mockDatabaseManager);
  rideTestRepository = new RideTestRepository(mockDatabaseManager);
  rideRepository = new RideRepository(databaseManager);
});

afterEach(async () => {
  await databaseManager.rollback(connection);
});

describe('When find one ride', async () => {
  it('should show single ride that was created by facilitator', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'facilitator'};
    const email = loginData.email;
    const ride = randomRideWithFacilitator(email);
    const rideEntity = await databaseContainsRide(ride);

    // when
    const storedRide = await findOneRideService.findOne(rideEntity.id, loginData);

    // then
    assert.deepEqualExcluding(ride, storedRide, 'id');
  });

  it('should NOT show ride that was created by other facilitator', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'facilitator'};
    const ride = randomRideWithFacilitator(RandomUtils.randomEmail());
    const rideEntity = await databaseContainsRide(ride);

    // when
    const storedRide = await findOneRideService.findOne(rideEntity.id, loginData);

    // then
    assert.isNull(storedRide);
  });

  it('should show single ride when user is admin', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'admin'};
    const ride = randomRideWithFacilitator(RandomUtils.randomEmail());
    const rideEntity = await databaseContainsRide(ride);

    // when
    const storedRide = await findOneRideService.findOne(rideEntity.id, loginData);

    // then
    assert.deepEqualExcluding(ride, storedRide, 'id');
  });

  it('should not show single ride when user is driver', async function () {
    // given
    const loginData = {email: RandomUtils.randomEmail(), role: 'driver'};
    const ride = randomRideWithFacilitator(RandomUtils.randomEmail());
    const rideEntity = await databaseContainsRide(ride);

    // when
    const storedRide = await findOneRideService.findOne(rideEntity.id, loginData);

    // then
    assert.isNull(storedRide);
  });

  async function databaseContainsRide(ride) {
    await rideRepository.create(ride, connection);
    let rideEntity = rideTestRepository.findOneByClientEmail(ride.client);
    return rideEntity;
  }

  function randomRideWithFacilitator(facilitatorId) {
    const ride = RideEntityBuilder.randomRideEntity();
    ride.facilitatorId = facilitatorId;
    return ride;
  }
});



