export function canAccessProject(
  userId: number,
  userRole: string,
  ownerUserId: number,
  isMember: boolean,
) {
  return userRole === "admin" || userId === ownerUserId || isMember;
}

export function canManageProjectMembers(userId: number, userRole: string, ownerUserId: number) {
  return userRole === "admin" || userId === ownerUserId;
}

export function canUseProjectAgent(
  userRole: string,
  isProjectMember: boolean,
  isEarlyAccessDeveloper = false,
) {
  return userRole === "admin" || isProjectMember || isEarlyAccessDeveloper;
}
