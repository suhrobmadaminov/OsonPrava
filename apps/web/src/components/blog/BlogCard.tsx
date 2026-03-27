import Link from 'next/link';
import Image from 'next/image';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  readingTime: string;
  locale: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  image,
  date,
  readingTime,
  locale,
}: BlogCardProps) {
  return (
    <Link href={`/${locale}/blog/${slug}`} className="group">
      <article className="card-duo overflow-hidden transition-all hover:-translate-y-2">
        {image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5">
          <div className="mb-3 flex items-center gap-3 text-xs font-bold text-gray-400">
            <time>{date}</time>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>{readingTime}</span>
          </div>
          <h3 className="mb-2 text-lg font-extrabold text-gray-900 transition-colors group-hover:text-duo-green">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm text-gray-500">{excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
