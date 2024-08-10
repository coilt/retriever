// models/Dependency.js
import mongoose from 'mongoose'

const DependencySchema = new mongoose.Schema({
  Files: [
    {
      Path: String,
      ChunkId: String,
    },
  ],
  Dependencies: {
    packageID: Number,
    ChunkIDToDependencies: Object,
  },
})

const Dependency = mongoose.model('Dependency', DependencySchema)

export default Dependency
