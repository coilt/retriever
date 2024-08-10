// app/retriever/RetrieverClient.js
'use client';

import { useState } from 'react';
import AssetCategory from '../../models/AssetCategory';

function RetrieverClient({ assetPaths }) {
  const [assetTitle, setAssetTitle] = useState('');
  const [assetCategory, setAssetCategory] = useState(null);
  const [dependencies, setDependencies] = useState([]);

  async function handleSearch() {
    console.log('Search button clicked');
    console.log('Asset title:', assetTitle);

    try {
      // Find the asset path by title
      const assetPath = assetPaths.find((path) => path.title === assetTitle);
      console.log('Asset path:', assetPath);

      if (assetPath) {
        const chunkId = assetPath.chunkId;
        const decimalId = parseInt(chunkId.slice(0, 16), 16);
        console.log('Decimal ID:', decimalId);

        // Find the asset category by decimal ID
        const category = await AssetCategory.findOne({ id: decimalId.toString() }).exec();
        console.log('Asset category:', category);

        if (category) {
          setAssetCategory(category);

          // Fetch the dependencies recursively
          const fetchedDependencies = await fetchDependencies(category.dependencies);
          console.log('Fetched dependencies:', fetchedDependencies);
          setDependencies(fetchedDependencies);
        } else {
          console.log('No asset category found');
          setAssetCategory(null);
          setDependencies([]);
        }
      } else {
        console.log('No asset path found');
        setAssetCategory(null);
        setDependencies([]);
      }
    } catch (error) {
      console.error('Error searching for asset:', error);
    }
  }

  async function fetchDependencies(dependencyIds) {
    console.log('Fetching dependencies:', dependencyIds);

    if (!dependencyIds || dependencyIds.length === 0) {
      console.log('No dependencies to fetch');
      return [];
    }

    const dependencies = await AssetCategory.find({ id: { $in: dependencyIds } }).exec();
    console.log('Fetched dependencies:', dependencies);

    const dependenciesWithChildren = await Promise.all(
      dependencies.map(async (dependency) => {
        const children = await fetchDependencies(dependency.dependencies);
        return { ...dependency.toObject(), children };
      })
    );

    console.log('Dependencies with children:', dependenciesWithChildren);
    return dependenciesWithChildren;
  }

  return (
    <div>
      <input
        type="text"
        value={assetTitle}
        onChange={(e) => setAssetTitle(e.target.value)}
        placeholder="Enter asset title"
      />
      <button onClick={handleSearch}>Search</button>

      {assetCategory && (
        <div>
          <h2>Asset Category: {assetCategory.id}</h2>
          <h3>Dependencies:</h3>
          <ul>
            {dependencies.map((dependency) => (
              <li key={dependency.id}>
                {dependency.id}
                {dependency.children.length > 0 && (
                  <ul>
                    {dependency.children.map((child) => (
                      <li key={child.id}>{child.id}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {assetCategory === null && <p>No asset category found for the entered title.</p>}
    </div>
  );
}

export default RetrieverClient;
