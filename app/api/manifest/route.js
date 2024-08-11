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
  console.log('Processing manifest...');
  
  // 1. Search for the asset by its title
  const asset = manifest.Files.find((file) => {
    const title = path.basename(file.Path);
    console.log('Checking asset:', title);
    return title === searchTerm;
  });

  if (!asset) {
    console.error('Asset not found');
    throw new Error('Asset not found');
  }

  console.log('Found asset:', asset);

  // 2. Extract packageID using the provided regular expression
  const extractPackageID = (content) => {
    const regex = /"packageID"\s*:\s*"?(\d+)"?/;
    const match = content.match(regex);
    return match ? match[1] : null;
  };

  const packageID = extractPackageID(JSON.stringify(manifest));

  if (!packageID) {
    console.error('packageID not found');
    throw new Error('packageID not found');
  }

  console.log('Extracted packageID:', packageID);

  // 3. Convert the first 16 characters of the asset's ChunkId from hexadecimal to base-10
  const chunkIdHex = asset.ChunkId.slice(0, 16);
  const chunkIdBase10 = parseInt(chunkIdHex, 16);

  console.log('Converted ChunkId:', chunkIdHex, '->', chunkIdBase10);

  // 4. Build a new manifest containing the fetched asset and its dependencies
  const processedManifest = {
    Files: [asset],
    Dependencies: {
      packageID: packageID,
      ChunkIDToDependencies: {
        [chunkIdBase10]: manifest.Dependencies.ChunkIDToDependencies[asset.ChunkId],
      },
    },
  };

  console.log('Processed manifest:', processedManifest);

  return processedManifest;
}
