import Explore from '@/components/Explore';
import Page from '@/components/ui/Page/Page';
import { PageTitle } from '@/components/ui/PageTitle';

export default function DiscoverPage() {
  return (
    <Page>
      <PageTitle
        title="Discover"
        description="Browse and filter tokens by type, volume, and more."
      />
      <div className="min-h-0 lg:min-h-screen">
        <Explore />
      </div>
    </Page>
  );
}
