import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger, SecurityEventType } from '@/utils/logger';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        // Verify Vercel Cron Secret authorization
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            logger.logUnauthorizedAccess('/api/cron/send-discord-alerts', undefined);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.logSecurityEvent(SecurityEventType.CRON_EXECUTION, {
            endpoint: '/api/cron/send-discord-alerts',
        });

        const supabase = await createClient();

        // Fetch fallback webhook URL (first non-null found)
        const { data: fallbackProfile } = await supabase
            .from('profiles')
            .select('discord_webhook_url')
            .neq('discord_webhook_url', null)
            .limit(1)
            .single();
        const fallbackUrl = fallbackProfile?.discord_webhook_url;

        // Validate Discord webhook URL format
        const discordWebhookSchema = z
            .string()
            .url()
            .regex(/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/);

        if (fallbackUrl) {
            const validation = discordWebhookSchema.safeParse(fallbackUrl);
            if (!validation.success) {
                logger.logWarning('Invalid fallback Discord webhook URL format', {
                    endpoint: '/api/cron/send-discord-alerts',
                });
            }
        }

        // Fetch tasks with alert_interval set
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select(`
                *,
                assignee:profiles!assignee(
                    discord_webhook_url,
                    full_name
                )
            `)
            .neq('alert_interval', 'None')
            .neq('status', 'Done');

        if (error) {
            logger.logApiError('/api/cron/send-discord-alerts', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ message: 'No tasks to alert' });
        }

        const results = [];

        for (const task of tasks) {
            // Check if alert is due
            const now = new Date();
            const lastSent = task.last_alert_sent_at ? new Date(task.last_alert_sent_at) : null;
            let shouldSend = false;

            if (!lastSent) {
                shouldSend = true;
            } else {
                const diffMs = now.getTime() - lastSent.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                switch (task.alert_interval) {
                    case '12h':
                        shouldSend = diffHours >= 12;
                        break;
                    case '24h':
                        shouldSend = diffHours >= 24;
                        break;
                    case '1w':
                        shouldSend = diffHours >= 168; // 24 * 7
                        break;
                }
            }

            if (shouldSend) {
                // Check if assignee has webhook URL or use fallback
                const assignee = task.assignee as any;
                const targetUrl = assignee?.discord_webhook_url || fallbackUrl;

                if (targetUrl) {
                    // Validate webhook URL before sending
                    const urlValidation = discordWebhookSchema.safeParse(targetUrl);
                    if (!urlValidation.success) {
                        logger.logWarning('Invalid Discord webhook URL for task', {
                            endpoint: '/api/cron/send-discord-alerts',
                            taskId: task.id,
                        });
                        results.push({ taskId: task.id, status: 'skipped', reason: 'invalid webhook url' });
                        continue;
                    }

                    try {
                        let mention = '';
                        if (assignee) {
                            mention = assignee.full_name.toLowerCase().includes('francisco') ? '<@1301992654396985465>' :
                                assignee.full_name.toLowerCase().includes('maksym') ? '<@249214815371788289>' : '';
                        } else {
                            // Everyone matches
                            mention = '<@1301992654396985465> <@249214815371788289>';
                        }

                        // Send Discord message
                        const response = await fetch(targetUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: mention,
                                embeds: [{
                                    title: '🔔 Task Reminder',
                                    description: task.title,
                                    color: 0x2563eb,
                                    footer: { text: `Framax Solutions • ${new Date().toLocaleDateString()}` }
                                }]
                            })
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            logger.logApiError('/api/cron/send-discord-alerts', new Error(`Discord API error: ${response.status}`), {
                                taskId: task.id,
                                statusCode: response.status,
                            });
                            results.push({ taskId: task.id, status: 'failed', error: `Discord API error: ${response.status} ${errorText}` });
                            continue; // Skip DB update
                        }

                        // Update last_alert_sent_at
                        await supabase
                            .from('tasks')
                            .update({ last_alert_sent_at: now.toISOString() })
                            .eq('id', task.id);

                        results.push({ taskId: task.id, status: 'sent' });
                    } catch (err) {
                        logger.logApiError('/api/cron/send-discord-alerts', err, { taskId: task.id });
                        results.push({ taskId: task.id, status: 'failed', error: err });
                    }
                } else {
                    results.push({ taskId: task.id, status: 'skipped', reason: 'no webhook url found' });
                }
            } else {
                results.push({ taskId: task.id, status: 'skipped', reason: 'not due yet' });
            }
        }

        return NextResponse.json({ results });
    } catch (err: any) {
        logger.logApiError('/api/cron/send-discord-alerts', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

