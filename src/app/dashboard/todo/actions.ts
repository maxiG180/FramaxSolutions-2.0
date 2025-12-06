'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTasks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assignee.eq.${user.id},assignee.is.null`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    return data
}

export async function getProfiles() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .order('full_name')

    if (error) {
        console.error('Error fetching profiles:', error)
        return []
    }

    return data
}

export async function createTask(title: string, assignee: string | null, tags: string[], alertInterval: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            title,
            status: 'Todo',
            assignee: assignee, // null means 'Everyone'
            tags: tags,
            priority: 'Medium',
            due_date: new Date().toISOString(),
            alert_interval: alertInterval,
            last_alert_sent_at: null
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/todo')
    return { data }
}

export async function toggleTask(id: number, completed: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Allow toggling if assigned to user OR assigned to everyone (null)
    // We need to check permission first or just try update with filter
    const { error } = await supabase
        .from('tasks')
        .update({ status: completed ? 'Done' : 'Todo' })
        .eq('id', id)
        .or(`assignee.eq.${user.id},assignee.is.null`)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/todo')
    return { success: true }
}

export async function deleteTask(id: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Allow deleting if assigned to user OR assigned to everyone (null)
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .or(`assignee.eq.${user.id},assignee.is.null`)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/todo')
    return { success: true }
}
