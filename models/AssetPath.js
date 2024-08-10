// models/AssetPath.js
import mongoose from 'mongoose';

const AssetPathSchema = new mongoose.Schema({
  Path: String,
  ChunkId: String,
});

const AssetPath = mongoose.model('AssetPath', AssetPathSchema);

export default AssetPath;
