import destr from 'destr';
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
  console.log('Processing manifest with searchTerm:', searchTerm);

  // 1. Search for the asset by its title
  const asset = manifest.Files.find((file) => {
    const title = path.basename(file.Path);
    return title === searchTerm;
  });

  if (!asset) {
    throw new Error('Asset not found');
  }

  console.log('Found asset:', asset);

  // 2. Collect all the entries linked to the asset
  const assetChunkId = asset.ChunkId.slice(0, 16);
  const decimalChunkId = BigInt(`0x${assetChunkId}`).toString();
  const assetDependencies = manifest.Dependencies.ChunkIDToDependencies[decimalChunkId];

  console.log('Asset decimal chunk ID:', decimalChunkId);
  console.log('Asset dependencies:', assetDependencies);

  // 3. Recursively collect all the dependencies of the asset and its dependencies
  const allDependencies = new Set();
  collectDependencies(decimalChunkId, manifest.Dependencies.ChunkIDToDependencies, allDependencies);

  console.log('All dependencies:', allDependencies);

  // 4. Build a new manifest containing the fetched asset and its dependencies
  const processedManifest = {
    Files: [asset],
    Dependencies: {
      packageID: manifest.Dependencies.packageID,
      ChunkIDToDependencies: {},
    },
  };

  allDependencies.forEach((decimalChunkId) => {
    processedManifest.Dependencies.ChunkIDToDependencies[decimalChunkId] =
      manifest.Dependencies.ChunkIDToDependencies[decimalChunkId];
  });

  console.log('Processed manifest:', processedManifest);

  return processedManifest;
}

function collectDependencies(chunkId, chunkIdToDependencies, allDependencies) {
  if (allDependencies.has(chunkId)) {
    console.log('Dependency already processed:', chunkId);
    return;
  }

  allDependencies.add(chunkId);
  console.log('Processing dependency:', chunkId);

  const chunkIdData = chunkIdToDependencies[chunkId];
  console.log('Chunk ID data:', chunkIdData);

  if (chunkIdData) {
    const { dependencies } = chunkIdData;
    console.log('Dependencies:', dependencies);

    if (dependencies) {
      dependencies.forEach((dependencyChunkId) => {
        collectDependencies(dependencyChunkId.toString(), chunkIdToDependencies, allDependencies);
      });
    }
  }
}
