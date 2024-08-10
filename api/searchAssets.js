// app/retriever/api/searchAssets.js
import { connectToDatabase } from '../lib/db';
import AssetPath from '../models/AssetPath';
import Dependency from '../models/Dependency';
import ChunkIdToDependency from '../models/ChunkIdToDependency';

export async function searchAssets(searchTerm) {
  try {
    await connectToDatabase();

    const assetResults = await AssetPath.find({
      Path: { $regex: searchTerm, $options: 'i' },
    }).lean();

    const chunkIds = assetResults.map((asset) => asset.ChunkId);

    const dependencyResults = await Dependency.find({
      Files: { $elemMatch: { ChunkId: { $in: chunkIds } } },
    }).lean();

    const chunkIdToDependencyResults = await ChunkIdToDependency.find({
      chunkId: { $in: chunkIds },
    }).lean();

    return {
      assetResults,
      dependencyResults,
      chunkIdToDependencyResults,
    };
  } catch (error) {
    throw new Error('Error searching assets');
  }
}
