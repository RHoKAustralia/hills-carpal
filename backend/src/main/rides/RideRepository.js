'use strict';

const moment = require('moment');

class RideRepository {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
  }

  create(ride, connection) {
    const escape = (data) => connection.escape(data);
    const locationFrom = `POINT(${ride.locationFrom.latitude}, ${ride.locationFrom.longitude})`;
    const locationTo = `POINT(${ride.locationTo.latitude}, ${ride.locationTo.longitude})`;
    let query = `INSERT INTO rides(client,
                                  facilitatorEmail,
                                  pickupTimeAndDateInUTC,
                                  locationFrom,
                                  locationTo,
                                  fbLink,
                                  driverGender,
                                  carType,
                                  status,
                                  deleted,
                                  suburbFrom,
                                  placeNameFrom,
                                  postCodeFrom,
                                  suburbTo,
                                  placeNameTo,
                                  postCodeTo,
                                  description) 
                         VALUES 
                                  (${
      [escape(ride.client),
        escape(ride.facilitatorId),
        escape(moment(ride.pickupTimeAndDateInUTC).format('YYYY-MM-DD HH:mm:ss')),
        locationFrom,
        locationTo,
        escape(ride.fbLink),
        escape(ride.driverGender),
        escape(ride.carType),
        escape(ride.status),
        escape(ride.deleted),
        escape(ride.locationFrom.suburb),
        escape(ride.locationFrom.placeName),
        escape(ride.locationFrom.postcode),
        escape(ride.locationTo.suburb),
        escape(ride.locationTo.placeName),
        escape(ride.locationTo.postcode),
        escape(ride.description)
      ].join(',')})`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  update(id, ride, connection) {
    if (!id) {
      throw new Error('No id specified when updating ride.');
    }
    const escape = (data) => connection.escape(data);
    const locationFrom = `POINT(${ride.locationFrom.latitude}, ${ride.locationFrom.longitude})`;
    const locationTo = `POINT(${ride.locationTo.latitude}, ${ride.locationTo.longitude})`;
    let query = `UPDATE rides SET client = ${escape(ride.client)},
                                  facilitatorEmail = ${escape(ride.facilitatorId)},
                                  pickupTimeAndDateInUTC = ${escape(moment(ride.pickupTimeAndDateInUTC).format('YYYY-MM-DD HH:mm:ss'))},
                                  locationFrom = ${locationFrom},
                                  locationTo = ${locationTo},
                                  fbLink = ${escape(ride.fbLink)},
                                  driverGender = ${escape(ride.driverGender)},
                                  carType = ${escape(ride.carType)},
                                  status = ${escape(ride.status)},
                                  deleted = ${ride.deleted},
                                  suburbFrom = ${escape(ride.locationFrom.suburb)},
                                  placeNameFrom = ${escape(ride.locationFrom.placeName)},
                                  postCodeFrom = ${escape(ride.locationFrom.postcode)},
                                  suburbTo = ${escape(ride.locationTo.suburb)},
                                  placeNameTo = ${escape(ride.locationTo.placeName)},
                                  postCodeTo = ${escape(ride.locationTo.postcode)},
                                  description = ${escape(ride.description)} 
                                WHERE
                                  id = ${id}`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  findOne(jsonQuery, connection) {
    return this.list(jsonQuery, connection)
      .then(results => results[0] || null);
  }

  /**
   * @param jsonQuery:
   *    toLongitude {number}
   *    toLatitude {number}
   *    fromLongitude {number}
   *    fromLatitude {number}
   *    driverGenders {string[]}
   *    facilitatorId {string}
   *    includePickupTimeInPast {boolean}
   * @param connection
   */
  list(jsonQuery, connection) {
    const escape = (data) => connection.escape(data);
    let where = [];
    if (jsonQuery.toLongitude && jsonQuery.toLatitude && jsonQuery.fromLongitude && jsonQuery.fromLatitude) {
      where.push(`ST_Contains(ST_Envelope(ST_GeomFromText('LINESTRING(${jsonQuery.toLongitude} ${jsonQuery.toLatitude}, ${jsonQuery.fromLongitude} ${jsonQuery.fromLatitude})')), locationFrom)`);
    }
    if (!jsonQuery.includePickupTimeInPast) {
      where.push('pickupTimeAndDateInUTC >= NOW()')
    }
    if (jsonQuery.id) {
      where.push(`id = ${jsonQuery.id}`)
    }
    if (jsonQuery.driverGenders && jsonQuery.driverGenders.length) {
      let genders = jsonQuery.driverGenders.map(g => ` driverGender = '${g}'`).join(' or ');
      where.push(genders.length === 1 ? genders : `(${genders})`)
    }
    if (jsonQuery.facilitatorId) {
      where.push(`facilitatorEmail = ${escape(jsonQuery.facilitatorId)}`)
    }

    let query = `SELECT * FROM rides ${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY pickupTimeAndDateInUTC ASC;`;
    console.log(query);
    return this._databaseManager.query(query, connection)
      .then(rides =>
        rides.map(ride => {
          // Workaround to map facilitatorEmail from database to the facilitatorId in the entity
          ride.facilitatorId = ride.facilitatorId || ride.facilitatorEmail;
          delete ride.facilitatorEmail;
          return ride;
        })
      )
  }
}

module.exports = RideRepository;
