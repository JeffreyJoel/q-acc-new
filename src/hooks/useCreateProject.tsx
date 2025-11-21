import { useMutation } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { requestGraphQL } from '@/helpers/request';
import { CREATE_PROJECT } from '@/queries/project.query';
import { IProjectCreation } from '@/types/project.type';

export const useCreateProject = () => {
  const { address } = useAccount();
  return useMutation({
    mutationKey: ['project', 'create', address],
    mutationFn: async (project: IProjectCreation) => {
      return await requestGraphQL(
        CREATE_PROJECT,
        {
          project,
        },
        {
          auth: true,
        }
      );
    },
  });
};
