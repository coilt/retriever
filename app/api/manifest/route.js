import path from 'path'

export async function POST(request) {
  try {
    const { manifest, searchTerm } = await request.json()
    console.log('Received manifest:', manifest)
    console.log('Received searchTerm:', searchTerm)

    // Process the manifest and search for the specified asset
    const result = await processManifest(manifest, searchTerm)
    console.log('Processed manifest:', result)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

async function processManifest(manifest, searchTerm) {
  const log = []
  log.push(`Processing manifest with searchTerm: ${searchTerm}`)
  log.push(`Manifest: ${JSON.stringify(manifest)}`)

  // 1. Search for the asset by its title
  const asset = manifest.Files.find((file) => {
    const title = path.basename(file.Path)
    return title === searchTerm
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  log.push(`Found asset: ${JSON.stringify(asset)}`)

  // 2. Collect all the entries linked to the asset
  const assetChunkId = asset.ChunkId.slice(0, 16)
  const decimalChunkId = BigInt(`0x${assetChunkId}`).toString()

  log.push(`decimalChunkId value: ${decimalChunkId}`)
  log.push(`Searching for decimalChunkId: ${decimalChunkId}`)

  // Check if decimalChunkId is a string
  if (typeof decimalChunkId === 'string') {
    log.push(`decimalChunkId is a string: ${decimalChunkId}`)
  } else {
    log.push(`decimalChunkId is not a string: ${decimalChunkId}`)
  }
  
  const assetDependencies = manifest.Dependencies.ChunkIDToDependencies[`"${decimalChunkId}"`];

  // Add the log statement here
  for (const chunkId in manifest.Dependencies.ChunkIDToDependencies) {
    log.push(`Type of chunkId: ${typeof chunkId}, Value: ${chunkId}`);
  }

  log.push(`Asset dependencies: ${JSON.stringify(assetDependencies)}`);

  if (assetDependencies) {
    log.push(`Found matching chunkId: ${decimalChunkId}`)
    log.push(`Asset dependencies: ${JSON.stringify(assetDependencies)}`)
  } else {
    log.push(
      `No matching dependencies found for decimalChunkId: ${decimalChunkId}`
    )
  }


  function collectDependencies(chunkId, chunkIdToDependencies, allDependencies, log) {
    if (allDependencies.has(chunkId)) {
      return;
    }
  
    allDependencies.add(chunkId);
  
    const dependencies = chunkIdToDependencies[chunkId];
    if (dependencies && dependencies.dependencies) {
      for (const dependencyId of dependencies.dependencies) {
        collectDependencies(dependencyId.toString(), chunkIdToDependencies, allDependencies, log);
      }
    }
  }



  // 3. Recursively collect all the dependencies of the asset and its dependencies
  const allDependencies = new Set()
  if (assetDependencies) {
    collectDependencies(
      decimalChunkId,
      manifest.Dependencies.ChunkIDToDependencies,
      allDependencies,
      log
    )
  }

  log.push(`All dependencies: ${JSON.stringify(Array.from(allDependencies))}`)

  // 4. Build a new manifest containing the fetched asset and its dependencies
  const processedManifest = {
    Files: [asset],
    Dependencies: {
      packageID: manifest.Dependencies.packageID,
      ChunkIDToDependencies: {},
    },
  }

  allDependencies.forEach((decimalChunkId) => {
    const chunkIdData =
      manifest.Dependencies.ChunkIDToDependencies[decimalChunkId]
    if (chunkIdData) {
      processedManifest.Dependencies.ChunkIDToDependencies[decimalChunkId] =
        chunkIdData
    }
  })

  // Add the asset's chunk ID and its data to the processed manifest if available
  if (assetDependencies) {
    processedManifest.Dependencies.ChunkIDToDependencies[decimalChunkId] =
      assetDependencies
  }

  log.push(`Processed manifest: ${JSON.stringify(processedManifest)}`)

  return { processedManifest, log }
}
