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
        'flex min-h-screen flex-col justify-between bg-obsidian-base text-text-primary relative sigil-pattern',
        pageClassName
      )}
      style={{
        backgroundImage: `
          radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%),
          var(--obsidian-base)
        `,
      }}
    >
      {/* Layered atmospheric background - kept for compatibility */}
      <div className="atmosphere-layer opacity-0" />
      <div className="steam-layer opacity-30" />
      <div className="castle-silhouette opacity-20" />
      <div className="dacian-pattern" />
      
      <Header />
      <div
        className={cn(
          'flex flex-1 flex-col items-center px-1 md:px-3 pt-4 pb-16 relative z-10',
          containerClassName
        )}
      >
        <div className="lg:max-w-7xl w-full">{children}</div>
      </div>
    </div>
  );
};

export default Page;
