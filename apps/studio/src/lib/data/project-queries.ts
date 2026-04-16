import { prisma } from '@raino/db';

export async function getProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
    include: {
      spec: true,
      bom: { include: { rows: true } },
      quotes: true,
      intakeMessages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function getProject(projectId: string, organizationId: string) {
  return prisma.project.findUnique({
    where: { id: projectId, organizationId },
    include: {
      spec: true,
      architecture: true,
      bom: { include: { rows: true } },
      quotes: { orderBy: { createdAt: 'desc' } },
      ingestion: true,
      artifacts: true,
      jobs: { orderBy: { createdAt: 'desc' } },
      auditEntries: { orderBy: { createdAt: 'desc' } },
      handoffs: { orderBy: { createdAt: 'desc' } },
      intakeMessages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function createProject(data: {
  name: string;
  description?: string;
  organizationId: string;
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      organizationId: data.organizationId,
      status: 'intake',
    },
  });
}

export async function updateProjectStatus(projectId: string, status: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
}

export async function getProjectForUser(projectId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId: userId },
    include: {
      memberships: {
        include: { organization: { include: { projects: { where: { id: projectId } } } } },
      },
    },
  });

  if (!user) return null;

  for (const membership of user.memberships) {
    const project = membership.organization.projects[0];
    if (project) {
      return getProject(project.id, membership.organizationId);
    }
  }
  return null;
}

export async function getProjectsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId: userId },
    include: {
      memberships: {
        include: { organization: { include: { projects: { orderBy: { updatedAt: 'desc' } } } } },
      },
    },
  });

  if (!user) return [];

  const allProjects = [];
  for (const membership of user.memberships) {
    for (const project of membership.organization.projects) {
      allProjects.push({
        ...project,
        organizationId: membership.organizationId,
      });
    }
  }
  return allProjects;
}

export async function verifyProjectOwnership(
  projectId: string,
  userId: string,
): Promise<
  | {
      authorized: true;
      project: NonNullable<Awaited<ReturnType<typeof getProject>>>;
    }
  | { authorized: false }
> {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId: userId },
    include: {
      memberships: { select: { organizationId: true } },
    },
  });

  if (!user) return { authorized: false };

  const userOrgIds = user.memberships.map((m) => m.organizationId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });

  if (!project) return { authorized: false };

  if (!userOrgIds.includes(project.organizationId)) {
    return { authorized: false };
  }

  const fullProject = await getProject(projectId, project.organizationId);
  if (!fullProject) return { authorized: false };

  return { authorized: true, project: fullProject };
}

export async function getUserOrgId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { supabaseUserId: userId },
    include: { memberships: { take: 1 } },
  });

  if (!user || user.memberships.length === 0) return null;

  const membership = user.memberships[0];
  return membership?.organizationId ?? null;
}
