import { StaffUser } from './types'

// Stubbed auth. Every request is treated as this staff user.
export function getCurrentUser(): StaffUser {
  return { id: 'staff-01', name: 'Jordan Ruiz', role: 'staff' }
}