import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import './ClientImages.css';

import axiosInstance from '../auth/api';

function Image({ image, deleteImage, onSave }) {
  const [caption, setCaption] = useState(image.caption || '');
  const [saving, setSaving] = useState(false);

  const onCaptionChange = event => {
    const value = event.target.value;
    setCaption(value);
  };

  const saveCaption = async image => {
    setSaving(true);
    try {
      const res = await axiosInstance.put(
        `/images/${image.id}`,
        { ...image, caption },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`
          }
        }
      );

      if (res.status >= 300) {
        throw new Error('Failed to save caption ' + res.statusText);
      } else {
        onSave(caption);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save, please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="client-image-wrapper">
      <img
        className="client-image"
        key={image.id}
        src={
          process.env.REACT_APP_API_URL +
          image.url +
          `?access_token=${localStorage.getItem('id_token')}`
        }
        alt={caption}
      />
      <textarea
        rows={2}
        className="form-control"
        placeholder="Caption"
        value={caption}
        onChange={onCaptionChange}
      ></textarea>
      <div className="btn-group mr-2" role="group">
        <button
          className="btn btn-primary"
          disabled={(image.caption || '') === caption}
          onClick={() => saveCaption(image)}
        >
          {saving ? 'Saving...' : 'Save Caption'}
        </button>

        <button
          className="btn btn-danger"
          type="button"
          onClick={() => deleteImage(image.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function ClientImages({ images, onChange, clientId }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onDrop(accepted, rejected, event) {
    if (uploading) {
      return;
    }
    setUploading(true);

    const file = accepted[0];
    const formData = new FormData();
    formData.append(file.name, file);

    try {
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

      if (res.status >= 300) {
        throw new Error('Failed to upload client image');
      } else {
        onChange([...images, res.data]);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to upload client image, please try again');
    } finally {
      setUploading(false);
    }

    setUploading(false);
  }

  async function deleteImage(imageId) {
    setDeleting(true);

    try {
      const res = await axiosInstance.delete(`/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      });

      if (res.status >= 300) {
        throw new Error('Failed to delete image');
      }

      onChange(images.filter(image => image.id !== imageId));
    } catch (e) {
      alert('Failed to delete image, please try again');
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  const saveCaption = image => newCaption => {
    const newImage = {
      ...image,
      caption: newCaption
    };

    const index = images.indexOf(image);

    const newImages = [...images];
    newImages[index] = newImage;

    onChange(images);
  };

  return (
    <React.Fragment>
      <div>
        {deleting
          ? 'Deleting...'
          : images &&
            images.map(image => (
              <Image
                image={image}
                deleteImage={deleteImage}
                onSave={saveCaption(image)}
              />
            ))}
      </div>
      <Dropzone accept="image/jpeg, image/png" onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="client-image-dropzone">
            <input {...getInputProps()} />
            {uploading
              ? 'Uploading...'
              : 'To upload new images, drag and drop them here or click here to select.'}
          </div>
        )}
      </Dropzone>
    </React.Fragment>
  );
}
