import React, { useState } from 'react';
import Dropzone from 'react-dropzone';

import axiosInstance from '../auth/api';

export default function ClientImages({ images, onNewImage, clientId }) {
  const [uploading, setUploading] = useState(false);

  async function onDrop(accepted, rejected, event) {
    if (uploading) {
      return;
    }
    setUploading(true);

    const file = accepted[0];
    const formData = new FormData();
    formData.append(file.name, file);

    const res = await axiosInstance.post(
      `/clients/${clientId}/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    onNewImage(res.data);

    setUploading(false);
  }

  async function deleteImage(imageId) {

  }

  return (
    <React.Fragment>
      <div>
        {images &&
          images.map(image => (
            <div>
              <img
                className="client-image"
                key={image.id}
                src={process.env.REACT_APP_API_URL + image.url}
              />
              <button onClick={deleteImage(image.id)}>X</button>
            </div>
          ))}
      </div>
      <Dropzone accept="image/jpeg, image/png" onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {uploading
              ? 'Uploading...'
              : 'Try dropping some files here, or click to select files to upload.'}
          </div>
        )}
      </Dropzone>
    </React.Fragment>
  );
}
