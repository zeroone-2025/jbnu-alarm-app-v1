import type { TeamRole } from '@/_types/team';

export function canEditTeam(role: TeamRole): boolean {
  return role === 'captain' || role === 'executive';
}

export function canDeleteTeam(role: TeamRole): boolean {
  return role === 'captain';
}

export function canRemoveMember(currentRole: TeamRole, targetRole: TeamRole): boolean {
  if (currentRole === 'captain') return targetRole !== 'captain';
  if (currentRole === 'executive') return targetRole === 'member';
  return false;
}

export function canChangeRole(role: TeamRole): boolean {
  return role === 'captain';
}

export function canViewInvitation(role: TeamRole): boolean {
  return role === 'captain' || role === 'executive';
}

export function canRegenerateInvitation(role: TeamRole): boolean {
  return role === 'captain';
}

export function canTransferCaptain(role: TeamRole): boolean {
  return role === 'captain';
}
