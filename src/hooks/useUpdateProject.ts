import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestGraphQL } from '@/helpers/request';
import { UPDATE_PROJECT_BY_ID } from '@/queries/project.query';
import { IProject, IProjectCreation } from '@/types/project.type';

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['project', 'update', projectId],
    mutationFn: async (project: Partial<IProjectCreation>) => {
      return await requestGraphQL(
        UPDATE_PROJECT_BY_ID,
        {
          projectId: parseFloat(projectId),
          newProjectData: project,
        },
        {
          auth: true,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
