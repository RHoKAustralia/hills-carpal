const DatabaseManager = require('../../main/database/DatabaseManager');
const RideStatus = require('../../main/rides/RideStatus');
const CreateRideService = require('../../main/rides/CreateRideService');
const FindRideTestRepository = require('./RideTestRepository');
const RandomUtils = require('../RandomUtils');
const moment = require('moment');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const assert = chai.assert;
chai.use(chaiExclude);

let createRideService;
let rideRequest;
let databaseManager;
let mockDatabaseManager;
let findRideTestRepository;
let connection;
let loginData;
let pickupTimeAndDateInUTC;

before(async () => {
  databaseManager = new DatabaseManager();
  connection = databaseManager.createConnection();
  mockDatabaseManager = new DatabaseManager();
  mockDatabaseManager.createConnection = () => connection;
  mockDatabaseManager.closeConnection = () => Promise.resolve();
});

after(async () => {
  await databaseManager.closeConnection(connection);
});

beforeEach(async () => {
  await databaseManager.beginTransaction(connection);

  createRideService = new CreateRideService(mockDatabaseManager);
  findRideTestRepository = new FindRideTestRepository(databaseManager);
});

afterEach(async () => {
  await databaseManager.rollback(connection);
});

beforeEach(function setupData() {
  loginData = { email: RandomUtils.randomEmail() };
  pickupTimeAndDateInUTC = moment();
  const clientEmail = `client.test.${Date.now()}@carpal.com`;
  rideRequest = {
    carType: 'suv',
    hasMps: false,
    client: clientEmail,
    deleted: 0,
    description: 'wanna surf',
    driverGender: 'male',
    fbLink: 'http://facebook.com/profile/facilitator.test.1',
    locationFrom: {
      latitude: 1234,
      longitude: 4567,
      placeName: 'home',
      suburb: 'Bondi Junction',
      postcode: '2010'
    },
    locationTo: {
      latitude: 9999,
      longitude: 7777,
      placeName: 'beach',
      suburb: 'Bondi',
      postcode: '2011'
    },
    pickupTimeAndDateInUTC: pickupTimeAndDateInUTC.format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    ),
    status: RideStatus.OPEN
  };
});

describe('SQL', function() {
  it('should insert and retrieve ride', async function() {
    await createRideService.createRide(rideRequest, loginData);
    let storedRide = await findRideTestRepository.findOneByClientEmail(
      rideRequest.client,
      connection
    );

    assert.deepEqualExcluding(storedRide, rideRequest, [
      'id',
      'datetime',
      'pickupTimeAndDateInUTC',
      'facilitatorId'
    ]);
    assert.equal(storedRide.facilitatorId, loginData.email);
    assert.equal(
      storedRide.pickupTimeAndDateInUTC.setMilliseconds(0),
      pickupTimeAndDateInUTC.toDate().setMilliseconds(0)
    );

    it("shouldn't be mandatory to provide a facebook event link", async () => {
      let requestWithoutFacebookEventLink = Object.assign({}, rideRequest);
      delete requestWithoutFacebookEventLink.fbLink;

      await createRideService.createRide(
        requestWithoutFacebookEventLink,
        loginData
      );
      let storedRide = await findRideTestRepository.findOneByClientEmail(
        requestWithoutFacebookEventLink.client,
        connection
      );

      assert.deepEqualExcluding(storedRide, requestWithoutFacebookEventLink, [
        'id',
        'datetime',
        'pickupTimeAndDateInUTC',
        'facilitatorId',
        'fbLink'
      ]);
      assert.equal(storedRide.facilitatorId, loginData.email);
      assert.equal(
        storedRide.pickupTimeAndDateInUTC.setMilliseconds(0),
        pickupTimeAndDateInUTC.toDate().setMilliseconds(0)
      );

      assert.equal(storedRide.fbLink, null);
    });
  });
});
