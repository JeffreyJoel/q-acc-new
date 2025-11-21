'use client';

import EditTeamForm from '@/components/project/edit/EditTeamForm';

const EditTeamPage = ({ params }: { params: { projectId: string } }) => {
  return (
    <div className='container mx-auto'>
      <EditTeamForm projectId={params.projectId} />
    </div>
  );
};

export default EditTeamPage;
