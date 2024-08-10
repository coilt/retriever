// app/retriever/RetrieverClient.js
'use client';

import { useState } from 'react';
import AssetPath from '@/models/AssetPath';
import ChunkIdToDependency from '@/models/ChunkIdToDependency';
import Dependency from '@/models/Dependency';

function RetrieverClient({ assetPath, dependencies, chunkIdToDependencies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  function handleSearch() {
    if (assetPaths && dependencies && chunkIdToDependencies) {
      const asset = assetPaths.find((asset) =>
        asset.Path.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
      if (asset) {
        const assetResult = {
          Path: asset.Path,
          Title: asset.Path.split('/').pop(),
          ChunkId: asset.ChunkId,
        };
  
        const dependencyResult = dependencies.Files.find(
          (file) => file.ChunkId === asset.ChunkId
        );
  
        const chunkIdToDependencyResult = chunkIdToDependencies.find(
          (chunk) => chunk.chunkId === asset.ChunkId
        );
  
        setSearchResults({
          assetResult,
          dependencyResult,
          chunkIdToDependencyResult,
        });
      } else {
        setSearchResults(null);
      }
    } else {
      setSearchResults(null);
    }
  }

  return (
    <div>
      <h2>Search Asset:</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter asset name"
      />
      <button onClick={handleSearch}>Search</button>

      {searchResults && (
        <div>
          <h3>Search Results:</h3>
          <div>
            <h4>Asset Path:</h4>
            <p>Path: {searchResults.assetResult.Path}</p>
            <p>Title: {searchResults.assetResult.Title}</p>
            <p>Chunk ID: {searchResults.assetResult.ChunkId}</p>
          </div>
          {searchResults.dependencyResult && (
            <div>
              <h4>Dependency:</h4>
              <p>Dependencies Chunk ID: {searchResults.dependencyResult.ChunkId}</p>
              <p>Package ID: {dependencies.Dependencies.packageID}</p>
            </div>
          )}
          {searchResults.chunkIdToDependencyResult && (
            <div>
              <h4>Chunk ID to Dependency:</h4>
              <p>Asset ID: {searchResults.chunkIdToDependencyResult.chunkId}</p>
              <p>Size: {searchResults.chunkIdToDependencyResult.uncompressedSize}</p>
              <p>Exported Objects: {searchResults.chunkIdToDependencyResult.exportObjects}</p>
              <p>Unique Index: {searchResults.chunkIdToDependencyResult.uniqueIndex}</p>
              <p>Dependencies: {JSON.stringify(searchResults.chunkIdToDependencyResult.dependencies)}</p>
            </div>
          )}
        </div>
      )}

      {searchResults === null && <p>No results found.</p>}
    </div>
  );
}

export default RetrieverClient;
