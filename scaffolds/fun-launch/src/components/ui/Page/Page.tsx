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
        'flex min-h-screen flex-col justify-between bg-dacian-steel-dark text-mystic-steam-parchment relative film-grain vignette',
        pageClassName
      )}
    >
      {/* Layered atmospheric background */}
      <div className="atmosphere-layer" />
      <div className="steam-layer" />
      <div className="castle-silhouette" />
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
