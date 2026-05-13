import { createClient } from "./client"

export type UserRole = "admin" | "trainer"

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

// Get current user profile with role
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

// Get all profiles (admin only)
export async function getAllProfiles(): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !profiles) return []

  return profiles.map(profile => ({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }))
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)

  return !error
}

// Delete user (admin only) - this will cascade delete the profile
export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  // Note: We can only delete the profile, not the auth.users entry from client
  // The user will need to be deleted from Supabase dashboard or via admin API
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)

  return !error
}

// Sign out
export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

// Create new user (admin only) - uses Supabase Auth Admin
export async function createUser(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  // Sign up the user - the trigger will create the profile
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // If user was created but needs email confirmation, still return success
  // The trigger will create the profile automatically
  return { success: true }
}
