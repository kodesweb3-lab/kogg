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
        'flex min-h-screen flex-col justify-between bg-obsidian-base text-[var(--text-primary)] relative',
        pageClassName
      )}
      style={{
        backgroundImage: `
          radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%),
          var(--obsidian-base)
        `,
      }}
    >
      {/* Sigil pattern as separate layer */}
      <div className="sigil-pattern" />
      
      {/* Layered atmospheric background - kept for compatibility */}
      <div className="atmosphere-layer opacity-0" />
      <div className="steam-layer opacity-30" />
      <div className="castle-silhouette opacity-20" />
      <div className="dacian-pattern" />
      
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
