'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return []
    }

    return data
}

export async function createNote() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('notes')
        .insert({
            title: 'New Note',
            content: '',
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/notes')
    return { data }
}

export async function updateNote(id: number, updates: { title?: string; content?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/notes')
    return { success: true }
}

export async function deleteNote(id: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/notes')
    return { success: true }
}
