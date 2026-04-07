/**
 * Utility to force refresh the Supabase schema cache
 *
 * Call this function if you're getting "Could not find column" errors
 * after running migrations.
 *
 * This typically happens when:
 * - New migrations were applied while the app was running
 * - The Supabase client cached an old version of the schema
 *
 * Usage in browser console:
 * ```
 * import { refreshSupabaseSchema } from '@/utils/supabase/refresh-schema';
 * refreshSupabaseSchema();
 * ```
 */

export async function refreshSupabaseSchema() {
  console.log('🔄 Refreshing Supabase schema cache...');

  // Clear localStorage items related to Supabase
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    console.log(`  Removing: ${key}`);
    localStorage.removeItem(key);
  });

  console.log('✅ Schema cache cleared!');
  console.log('📍 Please refresh the page (Ctrl+Shift+R) to reload with fresh schema.');

  return {
    cleared: keysToRemove.length,
    keys: keysToRemove
  };
}

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).refreshSupabaseSchema = refreshSupabaseSchema;
}
