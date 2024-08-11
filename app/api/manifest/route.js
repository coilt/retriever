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

async function processManifest(manifest, searchTerm) {
  // 1. Search for the asset by its title
  const asset = manifest.Files.find((file) => {
    const title = path.basename(file.Path);
    return title === searchTerm;
  });

  if (!asset) {
    throw new Error('Asset not found');
  }

  // 2. Build a new manifest containing the fetched asset and its dependencies
  const processedManifest = {
    Files: [asset],
    Dependencies: {
      packageID: manifest.Dependencies.packageID,
      ChunkIDToDependencies: manifest.Dependencies.ChunkIDToDependencies[asset.ChunkId],
    },
  };

  return processedManifest;
}
