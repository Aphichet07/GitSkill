import { Schema, model, Document } from 'mongoose';

export interface IRepoData {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string;
  stars: number;
  isAnalyzed: boolean;
  updatedAt: string;
}

export interface IRepoGroup extends Document {
  groupName: string;    // เช่น "Data En"
  userId: number;       // ID ของ User (จาก Postgres)
  repos: IRepoData[];   // เปลี่ยนเป็นเก็บ Object ของ Repo
  createdAt: Date;
}

const repoGroupSchema = new Schema<IRepoGroup>({
  groupName: { type: String, required: true, index: true },
  userId: { type: Number, required: true, index: true },
  repos: [{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    url: { type: String, required: true },
    language: { type: String, default: 'Unknown' },
    stars: { type: Number, default: 0 },
    isAnalyzed: { type: Boolean, default: true },
    updatedAt: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const RepoGroup = model<IRepoGroup>('RepoGroup', repoGroupSchema);