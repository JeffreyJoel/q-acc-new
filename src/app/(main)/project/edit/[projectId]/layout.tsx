'use client';
import { ProjectCreationProvider } from '@/contexts/projectCreation.context';

export default function EditLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { projectId: string };
}>) {
  return (
    <ProjectCreationProvider projectId={params.projectId}>
      <section>{children}</section>
    </ProjectCreationProvider>
  );
}
