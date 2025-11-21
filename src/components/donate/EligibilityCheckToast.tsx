import { useFetchActiveRoundDetails } from '@/hooks/useRounds';

export const EligibilityCheckToast = () => {
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();
  let low_cap, high_cap;

  if (activeRoundDetails) {
    if (
      'roundPOLCapPerUserPerProjectWithGitcoinScoreOnly' in activeRoundDetails
    ) {
      low_cap =
        activeRoundDetails?.roundPOLCapPerUserPerProjectWithGitcoinScoreOnly ||
        1000;
    }

    high_cap = activeRoundDetails?.roundPOLCapPerUserPerProject || 15000;
  }

  return (
    <div className='flex p-4 rounded-lg border-[1px] border-peach-400 bg-peach-100 gap-2 font-redHatText text-neutral-800 flex-col'>
      <h1 className='font-medium'>Caps enable a fair launch!</h1>
      <p className='pb-2 '>
        Individual caps allow more people to participate in the important early
        stage of a project's token economy.
      </p>
      <div className='pb-2 '>
        <ul className='list-disc px-4'>
          <li>
            {' '}
            You can spend approximately $1,000 when unverified or verified with
            Human Passport.
          </li>
          <li>
            You can spend approximately $25,000 when verified with Privado zkID.
          </li>
        </ul>
      </div>
    </div>
  );
};
