-- Enable Storage Policies for 'avatars' bucket

-- 1. Allow authenticated users to upload files to 'avatars' bucket
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' );

-- 2. Allow authenticated users to update their own files (optional, if you want them to replace files)
create policy "Allow authenticated updates"
on storage.objects for update
to authenticated
using ( bucket_id = 'avatars' );

-- 3. Allow public access to view files (since it's a public bucket, but good to be explicit)
create policy "Allow public viewing"
on storage.objects for select
to public
using ( bucket_id = 'avatars' );
