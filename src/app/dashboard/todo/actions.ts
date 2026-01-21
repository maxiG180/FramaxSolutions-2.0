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

    // Attempt to send immediate alert if applicable
    if (alertInterval !== 'None') {
        let targetUrl: string | null = null;
        let mention = '';

        if (assignee) {
            // Specific assignee
            const { data: profile } = await supabase
                .from('profiles')
                .select('discord_webhook_url, full_name')
                .eq('id', assignee)
                .single()

            if (profile) {
                targetUrl = profile.discord_webhook_url;
                mention = profile.full_name.toLowerCase().includes('francisco') ? '<@1301992654396985465>' :
                    profile.full_name.toLowerCase().includes('maksym') ? '<@249214815371788289>' : '';
            }
        } else {
            // Everyone
            mention = '<@1301992654396985465> <@249214815371788289>';
        }

        // Fallback if no URL found yet (either profile missing url or it's 'Everyone' and we need a default)
        if (!targetUrl) {
            const { data: fallback } = await supabase
                .from('profiles')
                .select('discord_webhook_url')
                .neq('discord_webhook_url', null)
                .limit(1)
                .single();
            targetUrl = fallback?.discord_webhook_url || null;
        }

        if (targetUrl) {
            try {
                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: mention,
                        embeds: [{
                            title: '🔔 Task Reminder',
                            description: title,
                            color: 0x2563eb,
                            footer: { text: `Framax Solutions • ${new Date().toLocaleDateString()}` }
                        }]
                    })
                })

                if (response.ok) {
                    // Update last_alert_sent_at so cron doesn't send duplicate immediately
                    await supabase
                        .from('tasks')
                        .update({ last_alert_sent_at: new Date().toISOString() })
                        .eq('id', data.id)
                }
            } catch (err) {
                console.error('Failed to send immediate discord alert', err)
                // We ignore the error here so the task is still created successfully.
                // The cron job will pick it up later.
            }
        }
    }



    revalidatePath('/dashboard/todo')
    return { data }
}

export async function updateTaskTitle(id: number, title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id)
        .or(`assignee.eq.${user.id},assignee.is.null`)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/todo')
    return { success: true }
}

export async function updateTaskAssignee(id: number, assignee: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('tasks')
        .update({ assignee })
        .eq('id', id)
        .or(`assignee.eq.${user.id},assignee.is.null`)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/todo')
    return { success: true }
}

export async function updateTaskStatus(id: number, status: 'Todo' | 'Doing' | 'Done') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .or(`assignee.eq.${user.id},assignee.is.null`)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/todo')
    return { success: true }
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

export async function updateTaskAlertInterval(id: number, alertInterval: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('tasks')
        .update({ alert_interval: alertInterval })
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
