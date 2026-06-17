import prisma from '../config/database';
import { ForbiddenError, NotFoundError } from './errors';
import { CollaboratorPermissions } from '../types/collaborator';

/**
 * Checks if user has access to edit a specific section of a memorial page.
 * Owners always have full access. Collaborators are checked against their permissions.
 */
export async function checkSectionAccess(
  pageId: string,
  userId: string,
  section: keyof CollaboratorPermissions
): Promise<void> {
  const page = await prisma.memorialPage.findUnique({
    where: { id: pageId },
    select: { ownerId: true },
  });

  if (!page) {
    throw new NotFoundError('Памятная страница не найдена');
  }

  // Owners always have full access
  if (page.ownerId === userId) return;

  // Check collaborator permissions
  const collaborator = await prisma.collaborator.findFirst({
    where: {
      memorialPageId: pageId,
      userId,
      acceptedAt: { not: null },
    },
  });

  if (!collaborator) {
    throw new ForbiddenError('У вас нет прав для редактирования этой страницы');
  }

  const permissions = collaborator.permissions as unknown as CollaboratorPermissions;
  if (!permissions[section]) {
    throw new ForbiddenError(`У вас нет прав для редактирования раздела "${section}"`);
  }
}
