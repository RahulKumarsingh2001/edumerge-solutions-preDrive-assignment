import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }
});

sectionSchema.index({ name: 1, departmentId: 1 }, { unique: true });

export default mongoose.model('Section', sectionSchema);
