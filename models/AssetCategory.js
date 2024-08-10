// models/AssetCategory.js
import mongoose from "mongoose";

const AssetCategorySchema = new mongoose.Schema({
  id: String,
  uncompressedSize: Number,
  exportObjects: Number,
  requiredValueSomehow: Number,
  uniqueIndex: Number,
  dependencies: [String],
});

const AssetCategory = mongoose.model('AssetCategory', AssetCategorySchema);

export default AssetCategory;