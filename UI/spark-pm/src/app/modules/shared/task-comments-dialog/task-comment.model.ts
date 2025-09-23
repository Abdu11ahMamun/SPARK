export interface TaskComment {
  id: number;
  taskId: number;
  commentText: string;
  authorUserId?: number | null;
  createdAt: string; // ISO timestamp
}
