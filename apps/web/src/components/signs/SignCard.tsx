import Image from 'next/image';

interface SignCardProps {
  name: string;
  description: string;
  image: string;
}

export function SignCard({ name, description, image }: SignCardProps) {
  return (
    <div className="card-duo flex flex-col items-center p-5 text-center">
      <div className="relative mb-4 h-24 w-24">
        <Image src={image} alt={name} fill className="object-contain" />
      </div>
      <h3 className="mb-1 text-sm font-extrabold text-gray-900">{name}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
