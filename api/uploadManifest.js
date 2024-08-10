import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../lib/db';
import AssetPath from '../models/AssetPath';
import Dependency from '../models/Dependency';
import ChunkIdToDependency from '../models/ChunkIdToDependency';

async function uploadManifestToDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Read the manifest.json file
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Clear existing data (optional)
    await AssetPath.deleteMany({});
    await Dependency.deleteMany({});
    await ChunkIdToDependency.deleteMany({});

    // Insert asset paths
    await AssetPath.insertMany(manifestData.Files);

    // Insert dependencies
    await Dependency.create({
      Files: manifestData.Files,
      Dependencies: manifestData.Dependencies,
    });

    // Insert chunk ID to dependencies
    const chunkIdToDependencies = Object.entries(manifestData.Dependencies.ChunkIDToDependencies).map(
      ([chunkId, data]) => ({
        chunkId,
        ...data,
      })
    );
    await ChunkIdToDependency.insertMany(chunkIdToDependencies);

    console.log('Manifest data uploaded to the database successfully.');
  } catch (error) {
    console.error('Error uploading manifest data to the database:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
  }
}

uploadManifestToDatabase();
