import { Schema, model, Document } from 'mongoose';

interface IAnalysis extends Document {
  postId: number;       // ID ที่อ้างอิงจาก Postgres
  analysisResult: any;  // ข้อมูล JSON จากการวิเคราะห์
  status: string;
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>({
  postId: { type: Number, required: true, index: true },
  analysisResult: { type: Schema.Types.Mixed, required: true }, 
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

const Analysis = model<IAnalysis>('Analysis', analysisSchema);

export default Analysis;