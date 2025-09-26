import { useQuery } from '@tanstack/react-query';

import { requestGraphQL } from '@/helpers/request';
import { GET_PROJECT_BY_ID } from '@/queries/project.query';
import { IProject } from '@/types/project.type';

interface ProjectByIdResponse {
  projectById: IProject;
}

export const useFetchProjectById = (projectId: string) => {
  return useQuery<IProject, Error>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await requestGraphQL<ProjectByIdResponse>(GET_PROJECT_BY_ID, {
        id: parseFloat(projectId),
      });
      return res.projectById;
    },
    enabled: !!projectId,
  });
};
