'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const fullName = formData.get('fullName') as string
    const avatarUrl = formData.get('avatarUrl') as string

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'User not found' }
    }

    // Update public.profiles
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            discord_webhook_url: formData.get('discordWebhookUrl') as string,
            role: formData.get('role') as string,
            updated_at: new Date().toISOString(),
        })

    if (profileError) {
        return { error: profileError.message }
    }

    // Update auth.users metadata (optional, but good for consistency)
    const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
    })

    if (authError) {
        return { error: authError.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: "Passwords do not match" }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}
