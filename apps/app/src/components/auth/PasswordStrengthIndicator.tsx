interface PasswordStrengthIndicatorProps {
  password: string;
}

function getStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-duo-red' };
  if (score <= 4) return { level: 2, label: 'Medium', color: 'bg-duo-yellow' };
  return { level: 3, label: 'Strong', color: 'bg-duo-green' };
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { level, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= level ? color : 'bg-gray-200 dark:bg-dark-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        level === 1 ? 'text-duo-red' : level === 2 ? 'text-duo-yellow' : 'text-duo-green'
      }`}>
        {label}
      </p>
    </div>
  );
}
