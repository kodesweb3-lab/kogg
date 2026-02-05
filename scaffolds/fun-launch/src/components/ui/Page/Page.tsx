import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

interface IProps {
  containerClassName?: string;
  pageClassName?: string;
  /** Use narrow content width (editorial) */
  narrow?: boolean;
  /** Omit bottom nav (e.g. for full-screen pages) */
  noBottomNav?: boolean;
}

const Page: React.FC<React.PropsWithChildren<IProps>> = ({
  containerClassName,
  children,
  pageClassName,
  narrow = false,
  noBottomNav = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col text-[var(--text-primary)] relative',
        'min-h-[100dvh]',
        'lg:min-h-screen',
        pageClassName
      )}
      style={{ background: 'var(--bg-base)' }}
    >
      <Header />
      <main
        className={cn(
          'flex-1 flex flex-col w-full min-h-0',
          'overflow-y-auto overflow-x-hidden',
          noBottomNav ? 'pb-8 lg:pb-12' : 'pb-24 lg:pb-12',
          containerClassName
        )}
        style={{
          paddingLeft: 'max(var(--content-padding), env(safe-area-inset-left))',
          paddingRight: 'max(var(--content-padding), env(safe-area-inset-right))',
          paddingTop: 'var(--content-padding)',
          paddingBottom: noBottomNav ? 'max(2rem, env(safe-area-inset-bottom))' : 'max(5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div
          className={cn(
            'w-full mx-auto flex flex-col',
            narrow ? 'max-w-[var(--content-narrow)]' : 'max-w-[var(--content-max-width)]'
          )}
        >
          {children}
        </div>
      </main>
      {!noBottomNav && <BottomNav />}
    </div>
  );
};

export default Page;
