import type { User } from '@supabase/supabase-js'

export const ADMIN_USER_ID = 'c89843cd-b551-4925-b777-6c5c5cd3cb65'

export function isAdminUser(user: User | null | undefined): boolean {
  return user?.id === ADMIN_USER_ID
}
