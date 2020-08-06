import moment from 'moment';
import _ from 'lodash';
import { Connection } from 'mysql';

import DatabaseManager from '../database/database-manager';
import { Gender, CarType, RideStatus, Ride } from '../../model';

interface ListQuery {
  fromNow?: boolean;
  driverId?: string;
  driverRestrictions?: {
    gender?: Gender;
    carType?: CarType;
  };
  status?: RideStatus;
  sort?: string[];
  sortDirection?: 'asc' | 'desc';
  size?: number;
  page?: number;
}

const validSorts = [
  'clientName',
  'pickupTimeAndDate',
  'locationFrom',
  'locationTo',
  'status',
  'driverName',
];

export const validSortLookup = _(validSorts)
  .keyBy()
  .mapValues((x) => true)
  .value();

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
                                      moment(ride.pickupTimeAndDate)
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
      moment(ride.pickupTimeAndDate).utc().format('YYYY-MM-DD HH:mm:ss')
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

  listForDriver(driverId: string, connection: Connection): Promise<Ride[]> {
    return this.list({ driverId }, connection);
  }

  listForFacilitator(
    connection: Connection,
    sort?: string[],
    sortDirection?: 'asc' | 'desc',
    size?: number,
    page?: number
  ): Promise<Ride[]> {
    return this.list(
      { fromNow: false, sort, sortDirection, size, page },
      connection
    );
  }

  countForFacilitator(connection: Connection): Promise<number> {
    return this.count({ fromNow: false }, connection);
  }

  async list(
    {
      fromNow = false,
      sort,
      sortDirection = 'asc',
      size = 10,
      page = 0,
    }: ListQuery,
    connection: Connection
  ): Promise<Ride[]> {
    let where = [];

    if (fromNow) {
      where.push('rides.pickupTimeAndDateInUTC >= NOW()');
    }

    const query = `
      SELECT 
        rides.id, rides.facilitatorEmail, rides.pickupTimeAndDateInUTC AS pickupTimeAndDate, rides.description, rides.hasMps,
        rides.driverGender, rides.carType, rides.status,
        dr.driver_id AS driverId, dr.confirmed AS driverConfirmed, dr.updated_at AS updatedAt, dr.driver_name AS driverName,
        rides.clientId, clients.name AS clientName, clients.phoneNumber AS clientPhoneNumber, clients.description AS clientDescription,
        locationFrom.name AS placeNameFrom, locationFrom.postCode AS postCodeFrom, locationFrom.point AS locationFrom, locationFrom.suburb AS suburbFrom,
        locationTo.name AS placeNameTo, locationTo.postCode AS postCodeTo, locationTo.point AS locationTo, locationTo.suburb AS suburbTo
      FROM ${this.dbName}.rides
      INNER JOIN ${
        this.dbName
      }.locations locationFrom ON rides.locationFrom = locationFrom.id
      INNER JOIN ${
        this.dbName
      }.locations locationTo ON rides.locationTo = locationTo.id
      LEFT JOIN ${this.dbName}.driver_ride dr ON dr.ride_id = rides.id
      LEFT JOIN ${this.dbName}.clients clients ON clients.id = rides.clientId
      ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
      ${
        sort
          ? `ORDER BY ${sort
              .map((sortColumn) => sortColumn)
              .join(', ')} ${sortDirection.toUpperCase()}`
          : ''
      }
      LIMIT ${size}
      OFFSET ${page * size}
    `;

    console.log(query);

    const rides = await this.databaseManager.query(query, connection);

    return rides.map(
      (sqlRide) =>
        ({
          client: {
            id: sqlRide.clientId,
            name: sqlRide.clientName,
            phoneNumber: sqlRide.clientPhoneNumber,
            clientDescription: sqlRide.clientDescription,
          },
          driver: {
            id: sqlRide.driverId,
            confirmed: sqlRide.driverConfirmed,
            updatedAt: sqlRide.updatedAt,
            name: sqlRide.driverName,
          },
          facilitatorEmail: sqlRide.facilitatorEmail,
          pickupTimeAndDate: sqlRide.pickupTimeAndDate,
          locationFrom: {
            latitude: sqlRide.locationFrom.y,
            longitude: sqlRide.locationFrom.x,
            suburb: sqlRide.suburbFrom,
            postCode: sqlRide.postCodeFrom,
            placeName: sqlRide.placeNameFrom,
          },
          locationTo: {
            latitude: sqlRide.locationTo.y,
            longitude: sqlRide.locationTo.x,
            suburb: sqlRide.suburbTo,
            postCode: sqlRide.postCodeTo,
            placeName: sqlRide.placeNameTo,
          },
          driverGender: sqlRide.driverGender,
          carType: sqlRide.carType,
          status: sqlRide.status,
          hasMps: sqlRide.hasMps,
          description: sqlRide.description,
        } as Ride)
    );
  }

  async count(
    { fromNow = false }: ListQuery,
    connection: Connection
  ): Promise<number> {
    let where = [];

    if (fromNow) {
      where.push('rides.pickupTimeAndDateInUTC >= NOW()');
    }

    const query = `
      SELECT 
        count(rides.id) AS count
      FROM ${this.dbName}.rides
      ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
    `;

    console.log(query);

    const rides = await this.databaseManager.query(query, connection);

    return rides[0].count;
  }
}
