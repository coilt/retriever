// app/retriever/page.js
import fs from 'fs';
import path from 'path';
import RetrieverClient from './RetrieverClient';

async function getManifestData() {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return manifestData;
}

export async function generateStaticParams() {
  // Generate static paths if needed
  return [];
}

async function Retriever() {
  const manifestData = await getManifestData();

  return (
    <div>
      <RetrieverClient manifestData={manifestData} />
    </div>
  );
}

export default Retriever;
