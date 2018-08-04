const RidesMapper = require('../../main/rides/RideMapper');

class RideTestRepository {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
  }

  findOneByClientEmail(email, connection){
    return this._databaseManager.query(`SELECT * FROM rides WHERE client = '${email}'`, connection)
      .then(result => result instanceof Array && RidesMapper.entityToDto(result[0]));
  }
}


module.exports = RideTestRepository;
