// pages/api/upload-manifest.js
import { uploadManifestToDatabase } from './uploadManifest';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await uploadManifestToDatabase();
      res.status(200).json({ message: 'Manifest uploaded successfully' });
    } catch (error) {
      console.error('Error uploading manifest:', error);
      res.status(500).json({ message: 'Error uploading manifest' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}