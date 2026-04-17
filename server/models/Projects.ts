import { Schema, model, Document } from 'mongoose';

interface IProject extends Document {
  name: string;
  categoryIds: Schema.Types.ObjectId[]; // เก็บได้หลายหมวดหมู่
  userId: number;
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }], 
  userId: { type: Number, required: true, index: true }
});

export const Project = model<IProject>('Project', projectSchema);