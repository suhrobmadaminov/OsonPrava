import { BlogCard } from './BlogCard';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  readingTime: string;
}

interface BlogListProps {
  posts: BlogPost[];
  locale: string;
}

export function BlogList({ posts, locale }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} {...post} locale={locale} />
      ))}
    </div>
  );
}
