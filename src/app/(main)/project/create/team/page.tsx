'use client';

import { useAccount } from 'wagmi';

import CreateTeamForm from '@/components/project/create/CreateTeamForm';

export default function CreateProjectPage() {
  const { isConnected } = useAccount();

  return (
    <div className='container mx-auto'>
      <CreateTeamForm />
    </div>
  );
}
