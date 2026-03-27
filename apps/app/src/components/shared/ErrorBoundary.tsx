import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryInner extends Component<Props & { fallback: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function ErrorFallback() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-6">
      <div className="text-6xl">😢</div>
      <h2 className="text-xl font-bold">{t('common.error')}</h2>
      <button onClick={() => window.location.reload()} className="btn-primary">
        {t('common.retry')}
      </button>
    </div>
  );
}

export default function ErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundaryInner fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundaryInner>
  );
}
