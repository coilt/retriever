// app/retriever/page.js
import connectToDatabase from '../../lib/db';
import RetrieverClient from './RetrieverClient';
import AssetCategory from '../../models/AssetCategory';
import AssetPath from '../../models/AssetPath';

async function Retriever() {
  try {
    await connectToDatabase();

    // Fetch asset paths from the database using Mongoose
    const assetPaths = await AssetPath.find().exec();

    return <RetrieverClient assetPaths={assetPaths} />;
  } catch (error) {
    console.error('Error fetching asset paths:', error);
    return <div>Error occurred while fetching asset paths.</div>;
  }
}

export default Retriever;
