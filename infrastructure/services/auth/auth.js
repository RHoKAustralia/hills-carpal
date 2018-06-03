const jwt = require('jsonwebtoken');

// Set in `enviroment` of serverless.yml
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_PUBLIC_KEY = process.env.AUTH0_CLIENT_PUBLIC_KEY;

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, callback) => {
    console.log('event', event);
    if (!event.authorizationToken) {
        return callback('Unauthorized');
    }

    const tokenParts = event
        .authorizationToken
        .split(' ');
    const tokenValue = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
        // no auth token!
        return callback('Unauthorized');
    }
    const options = {
        audience: AUTH0_CLIENT_ID
    };

    try {
        jwt.verify(tokenValue, AUTH0_CLIENT_PUBLIC_KEY, options, (verifyError, decoded) => {
            if (verifyError) {
                console.log('verifyError', verifyError);
                // 401 Unauthorized
                console.log(`Token invalid. ${verifyError}`);
                return callback('Unauthorized');
            }
            // is custom authorizer function
            console.log('valid from customAuthorizer', decoded);
            const role = decoded['https://carpal.org.au/role'];
            if (['driver', 'facilitator', 'admin'].indexOf(role) >= 0) {
                return callback(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
            } else {
                return callback('Unauthorized');
            }
        });
    } catch (err) {
        console.log('catch error. Invalid token', err);
        return callback('Unauthorized');
    }

    // if for any reason you get here...
    return callback('Unauthorized');
};