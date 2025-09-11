'use client';

import { FC } from 'react';
import { ProjectProvider } from '@/contexts/project.context';
import ProjectDetails from './ProjectDetails';
import { IProject } from '@/types/project.type';

interface IProjectViewProps {
  slug: string;
  initialData?: IProject;
}

export const ProjectView: FC<IProjectViewProps> = ({ slug, initialData }) => {
  return (
    <ProjectProvider slug={slug} initialData={initialData}>
      <ProjectDetails/>
    </ProjectProvider>
  );
};
