import moment, { Moment } from 'moment';
import _ from 'lodash';
import { Connection } from 'mysql';

import DatabaseManager from '../database/database-manager';
import {
  Gender,
  CarType,
  RideStatus,
  Ride,
  RideInput,
  RideDriver,
} from '../../../common/model';
import LocationRepository from '../location-repository';

interface ListQuery {
  filters?: {
    fromNow?: boolean;
    driverId?: string;
    gender?: Gender[];
    carType?: CarType[];
    status?: RideStatus;
    date?: {
      from: Moment;
      to: Moment;
    };
    facilitatorEmail?: string;
  };
  sort?: string[];
  sortDirection?: 'asc' | 'desc';
  size?: number;
  page?: number;
  rideId?: number;
}

const validSorts = [
  'clientName',
  'pickupTimeAndDate',
  'locationFrom',
  'locationTo',
  'status',
  'driverName',
];

const MYSQL_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const validSortLookup = _(validSorts)
  .keyBy()
  .mapValues((x) => true)
  .value();

export default class RideRepository {
  private dbName: string;
  private locationRepository: LocationRepository;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
    this.locationRepository = new LocationRepository(databaseManager);
  }

  async create(ride: RideInput, connection: Connection): Promise<number> {
    const escape = (data) => connection.escape(data);

    try {
      connection.beginTransaction();

      const locationFromId = await this.locationRepository.create(
        ride.locationFrom,
        connection
      );
      const locationToId = await this.locationRepository.create(
        ride.locationTo,
        connection
      );

      let query = `INSERT INTO ${this.dbName}.rides(clientId,
                                  facilitatorEmail,
                                  pickupTimeAndDateInUTC,
                                  locationFrom,
                                  locationTo,
                                  status,
                                  description) 
                         VALUES 
                                  (${[
                                    escape(ride.clientId),
                                    escape(ride.facilitatorEmail),
                                    escape(
                                      moment(ride.pickupTimeAndDate)
                                        .utc()
                                        .format('YYYY-MM-DD HH:mm:ss')
                                    ),
                                    locationFromId,
                                    locationToId,
                                    escape(ride.status),
                                    escape(ride.description),
                                  ].join(',')})`;
      // console.log(query);

      await this.databaseManager.query(query, connection);

      const id = (
        await this.databaseManager.query(
          'SELECT LAST_INSERT_ID() AS lastInsertId',
          connection
        )
      )[0]['lastInsertId'];

      connection.commit();

      return id;
    } catch (e) {
      connection.rollback();
      throw e;
    }
  }

  async setStatus(
    id: number,
    status: RideStatus,
    driverId: string,
    driverName: string,
    connection: Connection
  ) {
    if (!id) {
      throw new Error('No id specified when updating ride.');
    }

    const escape = (data) => connection.escape(data);

    try {
      await this.databaseManager.beginTransaction(connection);
      let extraQuery: string | null = null;
      let query = `UPDATE ${this.dbName}.rides 
      SET 
        status = ${escape(status)}
      WHERE
        id = ${id};`;

      if (status === 'CONFIRMED') {
        extraQuery = `
            insert into ${
              this.dbName
            }.driver_ride(driver_id, ride_id, driver_name, confirmed, updated_at) VALUES (${[
          escape(driverId),
          escape(id),
          escape(driverName),
          escape(1),
        ]}, NOW()) ON DUPLICATE KEY UPDATE confirmed=${escape(1)};`;
      } else if (status === 'OPEN') {
        extraQuery = `delete from ${
          this.dbName
        }.driver_ride WHERE ride_id = ${escape(id)};`;
      }
      // console.log(query + extraQuery);

      await this.databaseManager.query(query, connection);
      extraQuery && (await this.databaseManager.query(extraQuery, connection));
      this.databaseManager.commit(connection);
    } catch (e) {
      this.databaseManager.rollback(connection);
      throw e;
    }
  }

  async update(id: number, ride: RideInput, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating ride.');
    }

    try {
      await this.databaseManager.beginTransaction(connection);

      const escape = (data) => connection.escape(data);

      const existing = await this.get(id, connection);

      await this.locationRepository.update(
        existing.locationFrom.id,
        ride.locationFrom,
        connection
      );
      await this.locationRepository.update(
        existing.locationTo.id,
        ride.locationTo,
        connection
      );
      let query = `UPDATE ${this.dbName}.rides 
        SET 
          clientId = ${escape(ride.clientId)},
          facilitatorEmail = ${escape(ride.facilitatorEmail)},
          pickupTimeAndDateInUTC = ${escape(
            moment(ride.pickupTimeAndDate).utc().format('YYYY-MM-DD HH:mm:ss')
          )},
          status = ${escape(ride.status)},
          description = ${escape(ride.description)} 
        WHERE
          id = ${id}`;

      let extraQuery = '';

      //Check if driver has interacted with a ride
      if (ride?.driver?.id) {
        extraQuery = `
              ;insert into ${
                this.dbName
              }.driver_ride(driver_id, ride_id, driver_name, confirmed, updated_at) VALUES (${[
          escape(ride.driver.id),
          escape(id),
          escape(ride.driver.name),
          escape(ride.driver.confirmed ? 1 : 0),
        ]}, NOW()) ON DUPLICATE KEY UPDATE confirmed=${escape(
          ride.driver.confirmed ? 1 : 0
        )}`;
      } else {
        extraQuery = `;delete from ${
          this.dbName
        }.driver_ride WHERE ride_id = ${escape(id)}`;
      }

      // console.log(query + extraQuery);

      await this.databaseManager.query(query + extraQuery, connection);
      this.databaseManager.commit(connection);

      return this.get(id, connection);
    } catch (e) {
      this.databaseManager.rollback(connection);
      throw e;
    }
  }

  listForDriver(
    driverId: string,
    status: RideStatus,
    connection: Connection
  ): Promise<Ride[]> {
    return this.list(
      {
        filters: { driverId, status },
        sortDirection: 'asc',
        sort: ['pickupTimeAndDateInUTC'],
      },
      connection
    );
  }

  listForFacilitator(
    connection: Connection,
    sort?: string[],
    sortDirection?: 'asc' | 'desc',
    facilitatorEmail?: string,
    size?: number,
    page?: number
  ): Promise<Ride[]> {
    return this.list(
      {
        filters: { fromNow: false, facilitatorEmail },
        sort,
        sortDirection,
        size,
        page,
      },
      connection
    );
  }

  countForFacilitator(
    connection: Connection,
    facilitatorEmail: string
  ): Promise<number> {
    return this.count(
      { filters: { fromNow: false, facilitatorEmail } },
      connection
    );
  }

  async get(rideId: number, connection: Connection): Promise<Ride | undefined> {
    const rides = await this.list({ rideId }, connection);

    return rides.length > 0 ? rides[0] : undefined;
  }

  async list(
    {
      sort,
      sortDirection = 'asc',
      size = 10,
      page = 0,
      rideId,
      filters: {
        fromNow = false,
        carType,
        gender,
        status,
        driverId,
        date,
        facilitatorEmail,
      } = {
        fromNow: false,
      },
    }: ListQuery,
    connection: Connection
  ): Promise<Ride[]> {
    let where = [];

    if (fromNow) {
      where.push('rides.pickupTimeAndDateInUTC >= NOW()');
    }

    if (rideId) {
      where.push(`rides.id = ${escape(rideId.toString())}`);
    }

    if (carType) {
      where.push(
        '(' +
          carType
            .map((thisCarType) => `clients.carType = '${escape(thisCarType)}'`)
            .join(' OR ') +
          ')'
      );
    }

    if (gender) {
      where.push(
        '(' +
          gender
            .map(
              (thisGender) => `clients.driverGender = '${escape(thisGender)}'`
            )
            .join(' OR ') +
          ')'
      );
    }

    if (status) {
      where.push(`( rides.status = '${escape(status)}' )`);
    }

    if (driverId) {
      where.push(`( dr.driver_id = '${driverId}' )`);
    }

    if (date?.from) {
      where.push(
        `( rides.pickupTimeAndDateInUTC >= '${date?.from
          .utc()
          .format(MYSQL_DATE_FORMAT)}' )`
      );
    }

    if (date?.to) {
      where.push(
        `( rides.pickupTimeAndDateInUTC <= '${date?.to
          .utc()
          .format(MYSQL_DATE_FORMAT)}' )`
      );
    }

    if (facilitatorEmail) {
      where.push(`( rides.facilitatorEmail = '${escape(facilitatorEmail)}' )`);
    }

    const query = `
      SELECT 
        rides.id, rides.facilitatorEmail, rides.pickupTimeAndDateInUTC AS pickupTimeAndDate, rides.description, clients.hasMps AS clientHasMps,
        clients.driverGender AS clientDriverGender, clients.carType AS clientCarType, rides.status,
        dr.driver_id AS driverId, dr.confirmed AS driverConfirmed, dr.updated_at AS updatedAt, dr.driver_name AS driverName,
        rides.clientId, clients.name AS clientName, clients.phoneNumber AS clientPhoneNumber, clients.description AS clientDescription,
        locationFrom.id AS locationIdFrom, locationFrom.name AS placeNameFrom, locationFrom.postCode AS postCodeFrom, locationFrom.point AS locationFrom, locationFrom.suburb AS suburbFrom,
        locationTo.id AS locationIdTo, locationTo.name AS placeNameTo, locationTo.postCode AS postCodeTo, locationTo.point AS locationTo, locationTo.suburb AS suburbTo
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

    // console.log(query);

    const rides = await this.databaseManager.query(query, connection);

    // console.log(rides);

    return rides.map(
      (sqlRide) =>
        ({
          id: sqlRide.id,
          client: {
            id: sqlRide.clientId,
            name: sqlRide.clientName,
            phoneNumber: sqlRide.clientPhoneNumber,
            clientDescription: sqlRide.clientDescription,
            preferredDriverGender: sqlRide.clientDriverGender,
            preferredCarType: sqlRide.clientCarType,
            hasMps: sqlRide.clientHasMps,
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
            id: sqlRide.locationIdFrom,
            latitude: sqlRide.locationFrom.y,
            longitude: sqlRide.locationFrom.x,
            suburb: sqlRide.suburbFrom,
            postCode: sqlRide.postCodeFrom,
            placeName: sqlRide.placeNameFrom,
          },
          locationTo: {
            id: sqlRide.locationIdTo,
            latitude: sqlRide.locationTo.y,
            longitude: sqlRide.locationTo.x,
            suburb: sqlRide.suburbTo,
            postCode: sqlRide.postCodeTo,
            placeName: sqlRide.placeNameTo,
          },
          status: sqlRide.status,
          description: sqlRide.description,
        } as Ride)
    );
  }

  async count(
    { filters: { fromNow = false, facilitatorEmail } }: ListQuery,
    connection: Connection
  ): Promise<number> {
    let where = [];

    if (fromNow) {
      where.push('( rides.pickupTimeAndDateInUTC >= NOW() )');
    }

    if (facilitatorEmail) {
      where.push(`( rides.facilitatorEmail = '${escape(facilitatorEmail)}' )`);
    }

    const query = `
      SELECT 
        count(rides.id) AS count
      FROM ${this.dbName}.rides
      ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
    `;

    // console.log(query);

    const rides = await this.databaseManager.query(query, connection);

    return rides[0].count;
  }
}
