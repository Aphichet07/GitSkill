
import { Schema, model, Document } from 'mongoose';

interface IRepoGroup extends Document {
  groupName: string;    // เช่น "Data En"
  userId: number;       // ID ของ User (จาก Postgres)
  repos: string[];      // เก็บเป็น Full Name ของ Repo เช่น ["user/repo-A", "user/repo-C"]
  createdAt: Date;
}

const repoGroupSchema = new Schema<IRepoGroup>({
  groupName: { type: String, required: true, index: true },
  userId: { type: Number, required: true, index: true },
  repos: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

export const RepoGroup = model<IRepoGroup>('RepoGroup', repoGroupSchema);