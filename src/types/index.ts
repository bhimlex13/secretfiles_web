// src/types/index.ts

export interface Story {
  _id: string;
  title: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  tags: string[];
  createdAt: string;
}