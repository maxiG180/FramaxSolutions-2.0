'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Folder = {
    id: string;
    name: string;
    color: string;
    bg: string;
    items: number;
    created_at: string;
}

export type File = {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    folder: string;
    folder_id: string | null;
    url: string;
    storage_path: string;
}

// Get all folders for the current user
export async function getFolders(): Promise<{ folders: Folder[], error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { folders: [], error: 'Not authenticated' }
    }

    const { data: folders, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching folders:', error)
        return { folders: [], error: error.message }
    }

    // Get file counts for each folder
    const { data: files } = await supabase
        .from('files')
        .select('folder_id')
        .eq('user_id', user.id)

    const fileCounts = files?.reduce((acc, file) => {
        if (file.folder_id) {
            acc[file.folder_id] = (acc[file.folder_id] || 0) + 1
        }
        return acc
    }, {} as Record<string, number>) || {}

    const foldersWithCounts = folders?.map(folder => ({
        id: folder.id,
        name: folder.name,
        color: folder.color,
        bg: folder.bg,
        items: fileCounts[folder.id] || 0,
        created_at: folder.created_at
    })) || []

    return { folders: foldersWithCounts }
}

// Create a new folder
export async function createFolder(name: string, color: string = 'text-gray-400', bg: string = 'bg-gray-400/10'): Promise<{ folder?: Folder, error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { data, error } = await supabase
        .from('folders')
        .insert({
            user_id: user.id,
            name,
            color,
            bg
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating folder:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/docs')

    return {
        folder: {
            id: data.id,
            name: data.name,
            color: data.color,
            bg: data.bg,
            items: 0,
            created_at: data.created_at
        }
    }
}

// Delete a folder
export async function deleteFolder(id: string): Promise<{ error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting folder:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/docs')
    return {}
}

// Get files, optionally filtered by folder
export async function getFiles(folderId?: string): Promise<{ files: File[], error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { files: [], error: 'Not authenticated' }
    }

    let query = supabase
        .from('files')
        .select('*, folders(name)')
        .eq('user_id', user.id)

    if (folderId) {
        query = query.eq('folder_id', folderId)
    }

    const { data: files, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching files:', error)
        return { files: [], error: error.message }
    }

    // Get public URLs for files
    const filesWithUrls = await Promise.all(files?.map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(file.storage_path)

        return {
            id: file.id,
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size),
            date: formatDate(file.created_at),
            folder: (file.folders as any)?.name || 'Unsorted',
            folder_id: file.folder_id,
            url: publicUrl,
            storage_path: file.storage_path
        }
    }) || [])

    return { files: filesWithUrls }
}

// Upload a file
export async function uploadFile(formData: FormData): Promise<{ file?: File, error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const uploadedFile = formData.get('file')
    const folderId = formData.get('folderId') as string | null

    if (!uploadedFile || !(uploadedFile instanceof Blob)) {
        console.error('Server Action: No file provided');
        return { error: 'No file provided' }
    }

    // Get file name
    const fileName = uploadedFile instanceof File ? uploadedFile.name : 'unknown'

    // Determine file type
    const fileType = getFileType(fileName)

    // Create storage path
    const timestamp = Date.now()
    const storagePath = `${user.id}/${folderId || 'unsorted'}/${timestamp}_${fileName}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, uploadedFile)

    if (uploadError) {
        console.error('Server Action: Error uploading file to storage:', uploadError)
        return { error: uploadError.message }
    }

    // Get folder name if applicable
    let folderName = 'Unsorted'
    if (folderId) {
        const { data: folder } = await supabase
            .from('folders')
            .select('name')
            .eq('id', folderId)
            .single()

        if (folder) {
            folderName = folder.name
        }
    }

    // Create database record
    const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
            user_id: user.id,
            folder_id: folderId,
            name: fileName,
            type: fileType,
            size: uploadedFile.size,
            storage_path: storagePath
        })
        .select()
        .single()

    if (dbError) {
        console.error('Server Action: Error creating file record:', dbError)
        // Clean up uploaded file
        await supabase.storage.from('documents').remove([storagePath])
        return { error: dbError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath)

    revalidatePath('/dashboard/docs')

    return {
        file: {
            id: fileRecord.id,
            name: fileRecord.name,
            type: fileRecord.type,
            size: formatFileSize(fileRecord.size),
            date: formatDate(fileRecord.created_at),
            folder: folderName,
            folder_id: fileRecord.folder_id,
            url: publicUrl,
            storage_path: storagePath
        }
    }
}

// Delete a file
export async function deleteFile(id: string, storagePath: string): Promise<{ error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([storagePath])

    if (storageError) {
        console.error('Error deleting file from storage:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (dbError) {
        console.error('Error deleting file record:', dbError)
        return { error: dbError.message }
    }

    revalidatePath('/dashboard/docs')
    return {}
}

// Helper functions
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getFileType(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video'
    if (['mp3', 'wav', 'm4a'].includes(ext || '')) return 'audio'
    if (['pdf'].includes(ext || '')) return 'pdf'
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'sheet'
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'zip'
    if (['doc', 'docx'].includes(ext || '')) return 'doc'
    if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'css', 'html', 'xml', 'yml', 'yaml'].includes(ext || '')) return 'code'
    return 'file'
}

// Create database record for a file uploaded client-side
export async function createFileRecord(fileData: {
    name: string,
    type: string,
    size: number,
    storage_path: string,
    folder_id: string | null
}): Promise<{ file?: File, error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Get folder name if applicable
    let folderName = 'Unsorted'
    if (fileData.folder_id) {
        const { data: folder } = await supabase
            .from('folders')
            .select('name')
            .eq('id', fileData.folder_id)
            .single()

        if (folder) {
            folderName = folder.name
        }
    }

    // Create database record
    const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
            user_id: user.id,
            folder_id: fileData.folder_id,
            name: fileData.name,
            type: fileData.type,
            size: fileData.size,
            storage_path: fileData.storage_path
        })
        .select()
        .single()

    if (dbError) {
        console.error('Error creating file record:', dbError)
        return { error: dbError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileData.storage_path)

    revalidatePath('/dashboard/docs')

    return {
        file: {
            id: fileRecord.id,
            name: fileRecord.name,
            type: fileRecord.type,
            size: formatFileSize(fileRecord.size),
            date: formatDate(fileRecord.created_at),
            folder: folderName,
            folder_id: fileRecord.folder_id,
            url: publicUrl,
            storage_path: fileData.storage_path
        }
    }
}
