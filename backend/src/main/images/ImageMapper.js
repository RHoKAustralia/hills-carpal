class ClientMapper {
  static entityToDto(image) {
    if (!image) {
      return null;
    }
    return {
      id: image.id,
      caption: image.caption,
      url: `/images/${image.id}`,
      mimeType: image.mime_type
    };
  }

  static dtoToEntity(dto) {
    return {
      id: dto.id,
      caption: dto.caption,
      mime_type: dto.mimeType
    };
  }
}

module.exports = ClientMapper;
