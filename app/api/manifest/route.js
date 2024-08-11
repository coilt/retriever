import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { manifest, searchTerm } = await request.json();
    console.log('Received manifest:', manifest);
    console.log('Received searchTerm:', searchTerm);

    // Process the manifest and search for the specified asset
    const result = await processManifest(manifest, searchTerm);
    console.log('Processed manifest:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(request) {
  console.log('Received GET request');
  return new Response(JSON.stringify({ message: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function processManifest(manifest, searchTerm) {
  console.log('Processing manifest with searchTerm:', searchTerm);
  console.log('Received manifest:', manifest);
  
  // 1. Search for the asset by its title
  const asset = manifest.Files.find((file) => {
    const title = path.basename(file.Path);
    console.log('Checking asset:', title);
    return title === searchTerm;
  });

  if (!asset) {
    console.warn('Asset not found for searchTerm:', searchTerm);
    throw new Error('Asset not found');
  }

  console.log('Found asset:', asset);

  // 2. Collect all the entries linked to the asset
  const assetChunkId = asset.ChunkId;
  const assetDependencies = manifest.Dependencies.ChunkIDToDependencies[assetChunkId];
  console.log('Asset dependencies:', assetDependencies);

  // 3. Convert the ChunkID from hex to decimal
  const decimalChunkId = parseInt(assetChunkId, 16);
  console.log('Decimal ChunkID:', decimalChunkId);

  // 4. Recursively collect all the dependencies of the asset and its dependencies
  const allDependencies = new Set();
  collectDependencies(decimalChunkId, manifest.Dependencies.ChunkIDToDependencies, allDependencies);
  console.log('All dependencies:', allDependencies);

  // 5. Build a new manifest containing the fetched asset and its dependencies
  const processedManifest = {
    Files: [asset],
    Dependencies: {
      packageID: manifest.Dependencies.packageID,
      ChunkIDToDependencies: {},
    },
  };

  allDependencies.forEach((chunkId) => {
    const hexChunkId = chunkId.toString(16);
    processedManifest.Dependencies.ChunkIDToDependencies[hexChunkId] =
      manifest.Dependencies.ChunkIDToDependencies[hexChunkId];
  });

  console.log('Processed manifest:', processedManifest);
  return processedManifest;
}

function collectDependencies(chunkId, chunkIdToDependencies, allDependencies) {
  if (allDependencies.has(chunkId)) {
    console.log('Dependency already collected:', chunkId);
    return;
  }

  allDependencies.add(chunkId);
  console.log('Collecting dependency:', chunkId);

  const dependencies = chunkIdToDependencies[chunkId]?.dependencies;
  if (dependencies) {
    console.log('Dependencies found for ChunkID:', chunkId);
    dependencies.forEach((dependencyChunkId) => {
      collectDependencies(dependencyChunkId, chunkIdToDependencies, allDependencies);
    });
  } else {
    console.log('No dependencies found for ChunkID:', chunkId);
  }
}
