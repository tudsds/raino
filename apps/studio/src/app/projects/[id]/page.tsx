'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectDetail } from '@/components/projects/project-detail';
import { LoadingState } from '@/components/ui/loading-state';
import type { Status } from '@/components/StatusBadge';

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status: Status;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
  };
}

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data: ProjectData = await res.json();
        setProject(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProject();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return <ProjectDetail project={project} />;
}
