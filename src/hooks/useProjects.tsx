import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Address } from 'viem';

import { Abc } from '@/app/api/projects/abc/[address]/route';
import {
  createProject,
  fetchProjectById,
  fetchProjectBySlug,
  fetchAllProjects,
  updateProjectById,
  fetchProjectByUserId,
  fetchProjectsCountByUserId,
  fetchProjectMetadata,
} from '@/services/project.service';
import { IProjectCreation } from '@/types/project.type';

/**
 * Hook to fetch all projects
 */
export const useFetchAllProjects = () => {
  return useQuery({
    queryKey: ['allProjects'],
    queryFn: async () => {
      return await fetchAllProjects();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

/**
 * Hook to fetch a project by ID
 * @param id - The project ID
 * @param address - Optional wallet address
 */
export const useFetchProjectById = (id: number, address?: Address) => {
  return useQuery({
    queryKey: ['project', id, address],
    queryFn: async () => {
      return await fetchProjectById(id, address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!id, // Only run if ID is provided
  });
};

/**
 * Hook to fetch a project by slug
 * @param slug - The project slug
 * @param address - Optional wallet address
 */
export const useFetchProjectBySlug = (slug: string, address?: Address) => {
  return useQuery({
    queryKey: ['project', 'slug', slug, address],
    queryFn: async () => {
      return await fetchProjectBySlug(slug, address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!slug, // Only run if slug is provided
  });
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: IProjectCreation) => createProject(project),
    onSuccess: () => {
      // Invalidate relevant queries when a project is created
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
    },
  });
};

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      newProjectData,
    }: {
      projectId: number;
      newProjectData: any;
    }) => updateProjectById(projectId, newProjectData),
    onSuccess: (_, variables) => {
      // Invalidate queries related to the updated project
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
    },
  });
};

/**
 * Hook to fetch a project by user ID
 * @param userId - The user ID
 */
export const useFetchProjectByUserId = (userId: number) => {
  return useQuery({
    queryKey: ['project', 'user', userId],
    queryFn: async () => {
      return await fetchProjectByUserId(userId);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!userId, // Only run if userId is provided
  });
};

/**
 * Hook to fetch projects count by user ID
 * @param userId - The user ID
 */
export const useFetchProjectsCountByUserId = (userId: number) => {
  return useQuery({
    queryKey: ['projectsCount', 'user', userId],
    queryFn: async () => {
      return await fetchProjectsCountByUserId(userId);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!userId, // Only run if userId is provided
  });
};

/**
 * Hook to fetch project metadata by slug
 * @param slug - The project slug
 * @param address - Optional wallet address
 */
export const useFetchProjectMetadata = (slug: string, address?: Address) => {
  return useQuery({
    queryKey: ['projectMetadata', slug, address],
    queryFn: async () => {
      return await fetchProjectMetadata(slug, address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!slug, // Only run if slug is provided
  });
};

export const useFetchAbcData = (projectAddress?: string) => {
  return useQuery<Abc | null>({
    queryKey: ['abcData', projectAddress],
    queryFn: async () => {
      if (!projectAddress) return null;
      const response = await fetch(`/api/projects/abc/${projectAddress}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!projectAddress,
  });
};
