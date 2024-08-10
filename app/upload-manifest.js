// pages/upload-manifest.js
"use client";
import { useState } from 'react';

export default function UploadManifestPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    setIsUploading(true);
    setMessage('');

    try {
      const response = await fetch('/api/upload-manifest', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading manifest:', error);
      setMessage('Error uploading manifest');
    }

    setIsUploading(false);
  };

  return (
    <div>
      <h1>Upload Manifest</h1>
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Manifest'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}