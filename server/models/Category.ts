import { Schema, model, Document } from 'mongoose';

interface ICategory extends Document {
  name: string;
  userId: number; // ID จาก Postgres
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  userId: { type: Number, required: true, index: true }
});

export const Category = model<ICategory>('Category', categorySchema);