class ClientMapper {
  static entityToDto(image) {
    if (!image) {
      return null;
    }
    return {
      id: image.id,
      caption: image.caption,
      url: `/images/${image.id}`,
      mimeType: image.mime_type,
    };
  }
}

module.exports = ClientMapper;
