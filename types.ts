export interface Mix {
  id: string;
  url: string;
  title: string;
  prompt: string;
  createdAt: number;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

export interface MixFormData {
  url: string;
  title: string;
  prompt: string;
}