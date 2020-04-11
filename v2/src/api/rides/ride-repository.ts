import moment from 'moment';

import DatabaseManager from '../database/database-manager';
import { Connection } from 'mysql';
import { Gender, CarType, RideStatus } from '../../model';

interface ListQuery {
  fromNow?: boolean;
  driverId?: string;
  driverRestrictions?: {
    gender?: Gender;
    carType?: CarType;
  };
  status?: RideStatus;
}

export default class RideRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  create(ride, connection) {
    const escape = (data) => connection.escape(data);
    const locationFrom = `POINT(${ride.locationFrom.latitude}, ${ride.locationFrom.longitude})`;
    const locationTo = `POINT(${ride.locationTo.latitude}, ${ride.locationTo.longitude})`;
    let query = `INSERT INTO ${this.dbName}.rides(clientId,
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
                                  hasMps,
                                  description) 
                         VALUES 
                                  (${[
                                    escape(ride.clientId),
                                    escape(ride.facilitatorId),
                                    escape(
                                      moment(ride.pickupTimeAndDateInUTC)
                                        .utc()
                                        .format('YYYY-MM-DD HH:mm:ss')
                                    ),
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
                                    escape(ride.hasMps),
                                    escape(ride.description),
                                  ].join(',')})`;
    console.log(query);

    return this.databaseManager.query(query, connection);
  }

  update(id, ride, connection) {
    if (!id) {
      throw new Error('No id specified when updating ride.');
    }

    console.log(
      moment(ride.pickupTimeAndDateInUTC).utc().format('YYYY-MM-DD HH:mm:ss')
    );

    this.databaseManager.beginTransaction(connection);

    const escape = (data) => connection.escape(data);
    const locationFrom = `POINT(${ride.locationFrom.latitude}, ${ride.locationFrom.longitude})`;
    const locationTo = `POINT(${ride.locationTo.latitude}, ${ride.locationTo.longitude})`;
    let query = `UPDATE ${this.dbName}.rides SET clientId = ${escape(
      ride.clientId
    )},
		facilitatorEmail = ${escape(ride.facilitatorId)},
		pickupTimeAndDateInUTC = ${escape(
      moment(ride.pickupTimeAndDateInUTC).utc().format('YYYY-MM-DD HH:mm:ss')
    )},
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
		hasMps = ${escape(ride.hasMps)},
		description = ${escape(ride.description)} 
	WHERE
		id = ${id}`;

    let extraQuery = '';

    //Check if driver has interacted with a ride
    if (ride.driver) {
      extraQuery = `
        ;insert into ${
          this.dbName
        }.driver_ride(driver_id, ride_id, driver_name, confirmed, updated_at) VALUES (${[
        escape(ride.driver.driver_id),
        escape(id),
        escape(ride.driver.driver_name),
        escape(ride.driver.confirmed ? 1 : 0),
      ]}, NOW()) ON DUPLICATE KEY UPDATE confirmed=${escape(
        ride.driver.confirmed ? 1 : 0
      )}`;
    } else {
      extraQuery = `;delete from ${
        this.dbName
      }.driver_ride WHERE ride_id = ${escape(id)}`;
    }

    console.log(query + extraQuery);

    return this.databaseManager
      .query(query + extraQuery, connection)
      .then(() => this.databaseManager.commit(connection))
      .catch(() => this.databaseManager.rollback(connection));
  }

  findOne(jsonQuery, connection) {
    return this.list(jsonQuery, connection).then(
      (results) => results[0] || null
    );
  }

  listForDriver(driverId: string, connection: Connection) {
    return this.list({ driverId }, connection);
  }

  list(jsonQuery: ListQuery, connection: Connection) {
    const escape = (data) => connection.escape(data);
    let where = [];

    if (jsonQuery.fromNow) {
      where.push('rides.pickupTimeAndDateInUTC >= NOW()');
    }

    if (jsonQuery.driverRestrictions?.gender) {
      where.push(
        `rides.driverGender = '${escape(jsonQuery.driverRestrictions?.gender)}'`
      );
    }

    if (jsonQuery.driverRestrictions?.carType) {
      where.push(
        `rides.carType = '${escape(jsonQuery.driverRestrictions?.carType)}'`
      );
    }

    if (jsonQuery.status) {
      where.push(`rides.status = ${escape(jsonQuery.status)}`);
    }

    if (jsonQuery.driverId) {
      where.push(`dr.driver_id = ${escape(jsonQuery.driverId)}`);
    }

    const leftJoinForDriver = `LEFT JOIN ${this.dbName}.driver_ride dr ON dr.ride_id = rides.id`;
    const leftJoinForClient = `LEFT JOIN ${this.dbName}.clients clients ON clients.id = rides.clientId`;

    const query = `
      SELECT rides.id, rides.facilitatorEmail, rides.pickupTimeAndDateInUTC, rides.placeNameFrom, rides.postCodeFrom,
        rides.locationFrom, rides.placeNameTo, rides.postCodeTo, rides.locationTo, rides.description, rides.hasMps, rides.clientId,
        clients.name AS clientName, rides.driverGender, rides.carType, rides.status, dr.driver_id, dr.confirmed, dr.updated_at,
        dr.driver_name, clients.phoneNumber AS clientPhoneNumber, clients.description AS clientDescription
      FROM 
        ${this.dbName}.rides
      ${leftJoinForClient}
      ${leftJoinForDriver}
      ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
      ORDER BY pickupTimeAndDateInUTC ASC;`;

    console.log(query);

    return this.databaseManager.query(query, connection);
  }
}

module.exports = RideRepository;
