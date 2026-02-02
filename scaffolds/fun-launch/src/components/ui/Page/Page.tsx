import Header from '@/components/Header';
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
        'flex min-h-screen flex-col justify-between text-[var(--text-primary)] relative',
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
          'flex flex-1 flex-col items-center px-3 md:px-4 pt-3 pb-12 md:pt-4 md:pb-16 relative z-10',
          containerClassName
        )}
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          paddingBottom: 'max(3rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="lg:max-w-6xl w-full">{children}</div>
      </div>
    </div>
  );
};

export default Page;
