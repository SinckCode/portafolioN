export interface Project {
  id: number;
  title: string;
  slug?: string;
  description: string;
  details: string;
  technologies: string[];
  type: string;
  date: string;
  repos: {
    frontend?: string;
    backend?: string;
    hardware?: string;
    deploy?: string;
  };
  demo?: string;
  demos?: string[];
  video?: string;
  videos?: string[];
  images: string[];
  api?: string | { videojuegos?: string; empresas?: string };
  credentials?: { email: string; password: string };
  featured?: boolean;
  category?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: User;
  category: Category;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  instructor: User;
  category: Category;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: CourseModule[];
  price: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  requirements: string[];
  whatYouLearn: string[];
  createdAt: string;
}

export interface CourseModule {
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  title: string;
  slug: string;
  type: 'video' | 'text' | 'quiz';
  content: string;
  videoUrl?: string;
  duration?: number;
  isFree: boolean;
  order: number;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'subscriber';
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  targetType: 'post' | 'course';
  targetId: string;
  parentId?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'project' | 'post' | 'course';
  color?: string;
  icon?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Enrollment {
  _id: string;
  user: string;
  course: Course;
  overallProgress: number;
  startedAt: string;
  completedAt?: string;
  certificateId?: string;
}

export interface Certificate {
  _id: string;
  user: User;
  course: Course;
  certificateNumber: string;
  issuedAt: string;
  verificationUrl: string;
}
