// This scoops data out of the auth0 rules and puts into the JWT so we can use it.

function (user, context, callback) {
    const namespace = 'https://carpal.org.au';
    const assignedRoles = (context.authorization || {}).roles;
    
    let idTokenClaims = context.idToken || {};
    let accessTokenClaims = context.accessToken || {};
    
    function setClaim(claimId, value) {
      idTokenClaims[`${namespace}/${claimId}`] = value;
      accessTokenClaims[`${namespace}/${claimId}`] = value;
    }
  
    setClaim("roles", assignedRoles);
    
    const roleLookup = assignedRoles.reduce((soFar, role) => {
      soFar[role] = true;
      return soFar;
    }, {});
    
    if (roleLookup.male) {
      setClaim("gender", "male");
    } else if (roleLookup.female) {
      setClaim("gender", "female");
    }
    
    if (roleLookup.suv) {
      setClaim("car", "suv");
    } else {
      setClaim("car", "noSUV");
    }
  
    context.idToken = idTokenClaims;
    context.accessToken = accessTokenClaims;
  
    callback(null, user, context);
  }