import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Fetch tasks with alert_interval set
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
            console.error('Error fetching tasks:', error);
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
                    case '1h':
                        shouldSend = diffHours >= 1;
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
                // Check if assignee has webhook URL
                // Note: assignee is an object because of the join
                const assignee = task.assignee as any;

                if (assignee && assignee.discord_webhook_url) {
                    try {
                        // Send Discord message
                        await fetch(assignee.discord_webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: `🔔 **Task Alert**: ${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}\n<https://framax-solutions.vercel.app/dashboard/todo>`
                            })
                        });

                        // Update last_alert_sent_at
                        await supabase
                            .from('tasks')
                            .update({ last_alert_sent_at: now.toISOString() })
                            .eq('id', task.id);

                        results.push({ taskId: task.id, status: 'sent' });
                    } catch (err) {
                        console.error(`Failed to send alert for task ${task.id}`, err);
                        results.push({ taskId: task.id, status: 'failed', error: err });
                    }
                } else {
                    results.push({ taskId: task.id, status: 'skipped', reason: 'no webhook url' });
                }
            } else {
                results.push({ taskId: task.id, status: 'skipped', reason: 'not due yet' });
            }
        }

        return NextResponse.json({ results });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
