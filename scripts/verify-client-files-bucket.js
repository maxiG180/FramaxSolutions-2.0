/**
 * Script to verify that the client-files bucket exists in Supabase
 *
 * Run this with: node scripts/verify-client-files-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyBucket() {
    console.log('🔍 Checking for client-files bucket...\n');

    try {
        // Try to list buckets (requires service role key or proper permissions)
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.warn('⚠️  Could not list buckets (this is normal with anon key)');
            console.warn('   Error:', listError.message);
            console.log('\n📋 Trying alternative method...\n');
        } else if (buckets) {
            console.log('📦 Available buckets:');
            buckets.forEach(bucket => {
                const icon = bucket.id === 'client-files' ? '✅' : '📁';
                console.log(`   ${icon} ${bucket.id} (${bucket.public ? 'public' : 'private'})`);
            });

            const clientFilesExists = buckets.some(b => b.id === 'client-files');
            if (clientFilesExists) {
                console.log('\n✅ client-files bucket EXISTS!');
                return true;
            } else {
                console.log('\n❌ client-files bucket NOT FOUND');
                console.log('\n📝 To create it, run:');
                console.log('   supabase/migrations/20250115_create_client_files_bucket.sql');
                return false;
            }
        }

        // Alternative: Try to list files in the bucket (will fail if bucket doesn't exist)
        const { data: files, error: filesError } = await supabase.storage
            .from('client-files')
            .list('', { limit: 1 });

        if (filesError) {
            if (filesError.message.includes('not found') || filesError.message.includes('does not exist')) {
                console.log('❌ client-files bucket does NOT exist');
                console.log('\n📝 To create it:');
                console.log('   1. Go to Supabase Dashboard → Storage');
                console.log('   2. Create new bucket: "client-files" (private)');
                console.log('   3. Or run: supabase/migrations/20250115_create_client_files_bucket.sql');
                return false;
            } else {
                console.log('⚠️  Unexpected error:', filesError.message);
                console.log('   The bucket might exist but you lack permissions to list files');
                console.log('   Check your RLS policies');
                return null;
            }
        }

        console.log('✅ client-files bucket exists and is accessible!');
        if (files && files.length > 0) {
            console.log(`📁 Found ${files.length} file(s) in the bucket`);
        } else {
            console.log('📁 Bucket is empty (this is normal for a new bucket)');
        }
        return true;

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

async function testUpload() {
    console.log('\n🧪 Testing upload to client-files bucket...\n');

    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const testPath = 'test_client/.keep';

    const { data, error } = await supabase.storage
        .from('client-files')
        .upload(testPath, testFile, { upsert: true });

    if (error) {
        console.error('❌ Test upload failed:', error.message);
        console.error('   Status:', error.statusCode);
        console.error('   Details:', error.error || 'No additional details');

        if (error.message.includes('not found')) {
            console.log('\n💡 Solution: Create the client-files bucket in Supabase Dashboard');
        } else if (error.message.includes('policies')) {
            console.log('\n💡 Solution: Check storage policies for client-files bucket');
        }

        return false;
    }

    console.log('✅ Test upload successful!');
    console.log('   File created at:', testPath);

    // Clean up test file
    const { error: deleteError } = await supabase.storage
        .from('client-files')
        .remove([testPath]);

    if (deleteError) {
        console.warn('⚠️  Could not delete test file (you may need to remove it manually)');
    } else {
        console.log('🧹 Test file cleaned up');
    }

    return true;
}

// Run verification
(async () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  Client Files Bucket Verification Tool    ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const exists = await verifyBucket();

    if (exists) {
        await testUpload();
        console.log('\n✅ All checks passed! The bucket is ready to use.');
    } else if (exists === false) {
        console.log('\n❌ Setup required - see instructions above');
    }

    console.log('\n════════════════════════════════════════════\n');
})();
