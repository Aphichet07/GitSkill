import { Schema, model, Document, Types } from 'mongoose';

export interface IAnalysis extends Document {
  projectId: Types.ObjectId; 
  userId: number;
  summation: string;
  skills: {
    language: string;
    points: number;
  }[];
  recommendation: string;
  deepcode: string;
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>({
  projectId: { type: Schema.Types.ObjectId, ref: 'RepoGroup', required: true },
  userId: { type: Number, required: true, index: true },
  summation: { type: String, required: true },
  skills: [{
    language: { type: String, required: true },
    points: { type: Number, required: true }
  }],
  recommendation: { type: String },
  deepcode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Analysis = model<IAnalysis>('Analysis', analysisSchema);