"use client"
import { Suspense } from "react";
import EditProjectForm from "@/components/project/edit/EditProjectFormNew";

const LoadingFallback = () => (
  <div className="container mx-auto bg-neutral-800 w-full h-[500px] flex items-center justify-center text-[25px] font-bold text-neutral-300 rounded-2xl mt-28">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-400"></div>
      <p>Loading project data...</p>
    </div>
  </div>
);

const EditProjectPage = ({ params }: { params: { projectId: string } }) => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <EditProjectForm projectId={params.projectId} />
        </Suspense>
    )
}

export default EditProjectPage; 