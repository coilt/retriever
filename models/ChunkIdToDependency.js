// models/ChunkIdToDependency.js
import mongoose from 'mongoose';

const ChunkIdToDependencySchema = new mongoose.Schema({
  chunkId: String,
  uncompressedSize: Number,
  exportObjects: Number,
  requiredValueSomehow: Number,
  uniqueIndex: Number,
  dependencies: [String],
});

 

const ChunkIdToDependency = mongoose.model('ChunkIdToDependency', ChunkIdToDependencySchema);

export default ChunkIdToDependency;

 

 
 