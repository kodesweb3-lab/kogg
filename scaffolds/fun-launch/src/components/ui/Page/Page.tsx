import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

interface IProps {
  containerClassName?: string;
  pageClassName?: string;
}

const Page: React.FC<React.PropsWithChildren<IProps>> = ({
  containerClassName,
  children,
  pageClassName,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col text-[var(--text-primary)] relative',
        'h-[100dvh] max-h-[100dvh] overflow-hidden',
        'lg:h-auto lg:min-h-screen lg:max-h-none lg:overflow-visible lg:justify-between',
        pageClassName
      )}
      style={{ background: 'var(--cyber-bg)' }}
    >
      <div className="atmosphere-layer" />
      <div className="cyber-grid" />
      <div className="dacian-pattern" />
      <div className="steam-layer" />
      <div className="sigil-pattern" />

      <Header />
      <div
        className={cn(
          'flex flex-1 flex-col items-center min-h-0 overflow-y-auto overflow-x-hidden lg:overflow-visible',
          'px-3 md:px-4 pt-3 pb-24 lg:pb-16 md:pt-4 relative z-10',
          containerClassName
        )}
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          paddingBottom: 'max(5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="lg:max-w-6xl w-full">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Page;
