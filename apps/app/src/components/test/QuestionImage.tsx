import { useState } from 'react';

interface Props {
  src: string;
}

export default function QuestionImage({ src }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <img
          src={src}
          alt="Question"
          className="w-full h-48 object-contain bg-gray-100 dark:bg-dark-border rounded-xl"
          loading="lazy"
        />
      </div>

      {/* Fullscreen modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <img src={src} alt="Question" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  );
}
