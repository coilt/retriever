// parseManifest.js
import fs from 'fs';
import connectToDatabase from './db.js';
import AssetCategory from './models/AssetCategory.js';
import AssetPath from './models/AssetPath.js';

// Read the manifest.json file
const manifestData = fs.readFileSync('path/to/manifest.json');
const manifest = JSON.parse(manifestData);

// Function to convert hex to decimal
function hexToDec(hex) {
  return parseInt(hex, 16);
}

// Function to store asset categories and paths in the database
async function storeAssetData() {
  try {
    await connectToDatabase();

    // Store asset paths
    for (const file of manifest.Files) {
      const chunkId = file.ChunkId;
      await AssetPath.create({
        path: file.Path,
        chunkId,
      });
    }

    // Store asset categories
    for (const [categoryId, category] of Object.entries(manifest.Dependencies.ChunkIDToDependencies)) {
      const decimalId = hexToDec(categoryId.slice(0, 16));
      await AssetCategory.create({
        id: decimalId.toString(),
        uncompressedSize: category.uncompressedSize,
        exportObjects: category.exportObjects,
        requiredValueSomehow: category.requiredValueSomehow,
        uniqueIndex: category.uniqueIndex,
        dependencies: category.dependencies,
      });
    }

    console.log('Asset data stored successfully.');
  } catch (error) {
    console.error('Error storing asset data:', error);
  } finally {
    process.exit(0);
  }
}

// Call the function to store asset data
storeAssetData();
