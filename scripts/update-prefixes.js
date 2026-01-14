/**
 * Migration Script: Update Document Prefixes
 *
 * This script updates document prefixes in the database:
 * - QTE- → ORC- (quotes)
 * - INV- → FAT- (invoices)
 *
 * Usage: node scripts/update-prefixes.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function updatePrefixes() {
    console.log('🚀 Starting migration: Update Document Prefixes\n');

    // Read .env.local file
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Parse environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    });

    // Initialize Supabase client
    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Error: Missing Supabase credentials in .env.local');
        console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Update quotes
        console.log('📝 Updating quote numbers (QTE- → ORC-)...');
        const { data: quotes, error: quotesError } = await supabase
            .from('quotes')
            .select('id, quote_number')
            .like('quote_number', 'QTE-%');

        if (quotesError) {
            throw quotesError;
        }

        console.log(`   Found ${quotes?.length || 0} quotes to update`);

        for (const quote of quotes || []) {
            const newNumber = quote.quote_number.replace('QTE-', 'ORC-');
            const { error } = await supabase
                .from('quotes')
                .update({ quote_number: newNumber })
                .eq('id', quote.id);

            if (error) {
                console.error(`   ❌ Failed to update quote ${quote.quote_number}:`, error.message);
            } else {
                console.log(`   ✅ Updated: ${quote.quote_number} → ${newNumber}`);
            }
        }

        // Update invoices
        console.log('\n📄 Updating invoice numbers (INV- → FAT-)...');
        const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('id, invoice_number')
            .like('invoice_number', 'INV-%');

        if (invoicesError) {
            throw invoicesError;
        }

        console.log(`   Found ${invoices?.length || 0} invoices to update`);

        for (const invoice of invoices || []) {
            const newNumber = invoice.invoice_number.replace('INV-', 'FAT-');
            const { error } = await supabase
                .from('invoices')
                .update({ invoice_number: newNumber })
                .eq('id', invoice.id);

            if (error) {
                console.error(`   ❌ Failed to update invoice ${invoice.invoice_number}:`, error.message);
            } else {
                console.log(`   ✅ Updated: ${invoice.invoice_number} → ${newNumber}`);
            }
        }

        // Summary
        console.log('\n✨ Migration completed successfully!');
        console.log(`   Quotes updated: ${quotes?.length || 0}`);
        console.log(`   Invoices updated: ${invoices?.length || 0}`);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migration
updatePrefixes();
