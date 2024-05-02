import { NextApiRequest, NextApiResponse } from 'next';
import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { GenderPreference, CarType } from '../../common/model';
import getConfig from 'next/config';
import DatabaseManager from './database/database-manager';
import DriverRepository from './driver-repository';
import FacilitatorRepository from './facilitator-repository';
import { Connection } from 'mysql2/promise';

const { publicRuntimeConfig } = getConfig();

type Role = 'admin' | 'driver' | 'facilitator';

const databaseManager = new DatabaseManager();
const driverRepository = new DriverRepository(databaseManager);
const facilitatorRepository = new FacilitatorRepository(databaseManager);

const client = jwksClient({
  jwksUri: 'https://hills-carpal.au.auth0.com/.well-known/jwks.json',
});

interface Claims {
  userId: string;
  email: string;
  roles: Role[];
  name: string;
  driverGender?: 'male' | 'female';
  carType?: CarType;
}

export async function requireDriverPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  connection: Connection,
  claims?: Claims
) {
  if (!claims) {
    claims = await verifyJwt(req);
  }

  const isAdmin = hasRole('admin', claims);

  if (
    !(await isDriver(claims, connection)) &&
    !isAdmin &&
    !(await isFacilitator(claims, connection))
  ) {
    console.log(
      'WARNING: unauthorised attempt to access driver-only api: ' +
        req.method +
        ' ' +
        req.url
    );
    res.status(403).send('Unauthorized');
    return false;
  }

  return true;
}

export async function requireFacilitatorPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  connection: Connection,
  claims?: Claims
) {
  if (!claims) {
    claims = await verifyJwt(req);
  }

  const isAdmin = hasRole('admin', claims);

  if (!isAdmin && !isFacilitator(claims, connection)) {
    console.log(
      'WARNING: unauthorised attempt to access facilitator-only api: ' +
        req.method +
        ' ' +
        req.url
    );
    res.status(401).send('Unauthorized');
    return false;
  }

  return true;
}

const isDriver = async (claims: Claims, connection: Connection) => {
  return (
    hasRole('driver', claims) ||
    (await driverRepository.isDriver(claims.userId, connection))
  );
};

const isFacilitator = async (claims: Claims, connection: Connection) => {
  return (
    hasRole('driver', claims) ||
    (await facilitatorRepository.isFacilitator(claims.userId, connection))
  );
};

export function hasRole(role: Role, claims?: Claims) {
  if (!claims?.roles) {
    return false;
  }

  return claims.roles.indexOf(role) >= 0;
}

export async function verifyJwt(
  req: NextApiRequest
): Promise<Claims | undefined> {
  try {
    const authHeader =
      req.headers.Authorization ||
      req.headers.authorization ||
      req.query['access_token'];

    if (!authHeader) {
      return;
    }

    const domain = process.env.DOMAIN || 'carpal.org.au';
    const authHeaderParts = (authHeader as string).split(' ');
    const tokenValue = authHeaderParts[1] || authHeaderParts[0];

    let decodedToken: any = await new Promise((resolve, reject) =>
      jsonwebtoken.verify(
        tokenValue,
        (
          header: jsonwebtoken.JwtHeader,
          callback: (error?: Error, value?: string) => void
        ) => {
          client.getSigningKey(header.kid, (err: Error, key: any) => {
            if (err) {
              callback(err);
            } else {
              const signingKey = key.publicKey || key.rsaPublicKey;
              callback(null, signingKey);
            }
          });
        },
        {},
        (err: Error, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        }
      )
    );

    if (process.env.REACT_APP_UNSAFE_GOD_MODE === 'true') {
      decodedToken = {
        ...decodedToken,
        // [`https://${domain}/gender`]: 'male',
        [`https://${domain}/roles`]: [
          // 'driver',
          // 'admin',
          'facilitator',
          // 'test',
          // 'prod',
          // 'training',
        ],
      };
    }
    const claims: Claims = {
      userId: decodedToken.sub,
      email: decodedToken.email,
      roles: decodedToken[`https://${domain}/roles`],
      name: decodedToken.name,
    };

    if (claims.roles.indexOf('driver') >= 0) {
      claims.driverGender = decodedToken[`https://${domain}/gender`];
      claims.carType = decodedToken[`https://${domain}/car`];
    }

    return claims;
  } catch (err) {
    console.error('catch error. Invalid token', err);
    throw err;
  }
}
