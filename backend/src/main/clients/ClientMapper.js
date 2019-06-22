class ClientMapper {
  static entityToDto(client) {
    if(!client){
      return null;
    }
    return {
      "name": client.name,
      "description": client.description,
      "id": client.id
    }
  }

  static dtoToEntity(client) {
    if(!client){
      return null;
    }
    return {
      name: client.name,
      description: client.description
    }
  }
}

module.exports = ClientMapper;
