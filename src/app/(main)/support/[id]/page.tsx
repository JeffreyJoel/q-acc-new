'use client';
import { redirect, useParams } from 'next/navigation';

// import DonateIndex from '@/components/donate/DonateIndex';
import DonateIndex from '@/components/donate/DonateIndex';
import { DonateProvider } from '@/contexts/donation.context';
// import { isProductReleased } from '@/config/configuration';
// import Routes from '@/lib/constants/Routes';
import { useFetchActiveRoundDetails } from '@/hooks/useRounds';

const DonateRoute = () => {
  const params = useParams();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();
  const isRoundActive = !!activeRoundDetails;
  const slug = Array.isArray(params.id) ? params.id[0] : params.id;
  return isRoundActive ? (
    <DonateProvider slug={slug}>
      <DonateIndex />
    </DonateProvider>
  ) : null;
};

export default DonateRoute;
