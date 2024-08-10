// models/AssetPath.js
import mongoose from "mongoose";

const AssetPathSchema = new mongoose.Schema({
  path: String,
  chunkId: String,
  title: String,
});

AssetPathSchema.pre('save', function (next) {
  const pathParts = this.path.split('/');
  this.title = pathParts[pathParts.length - 1].split('.')[0];
  next();
});

const AssetPath = mongoose.model('AssetPath', AssetPathSchema);

export default AssetPath;