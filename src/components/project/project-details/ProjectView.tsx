'use client';

import { FC } from 'react';

import { ProjectProvider } from '@/contexts/project.context';
import { IProject } from '@/types/project.type';

import ProjectDetails from './ProjectDetails';

interface IProjectViewProps {
  slug: string;
  initialData?: IProject;
}

export const ProjectView: FC<IProjectViewProps> = ({ slug, initialData }) => {
  return (
    <ProjectProvider slug={slug} initialData={initialData}>
      <ProjectDetails />
    </ProjectProvider>
  );
};
