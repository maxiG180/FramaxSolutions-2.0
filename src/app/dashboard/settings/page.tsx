"use client";

import { useState, useEffect } from "react";
import { User, Bell, Lock, Globe, Save, Loader2, Calendar, Blocks } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateProfile, updatePassword, saveGoogleCalendarToken, deleteGoogleCalendarToken } from "./actions";
import { useGoogleLogin } from '@react-oauth/google';
import { useSearchParams } from 'next/navigation';

type SettingsTab = "profile" | "notifications" | "security" | "integrations" | "domain";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [showDiscordModal, setShowDiscordModal] = useState(false);
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    const [webhookInput, setWebhookInput] = useState("");

    const supabase = createClient();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as SettingsTab | null;

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profile);
                // Set Google Calendar token from profile
                if (profile?.google_calendar_token) {
                    setGoogleAccessToken(profile.google_calendar_token);
                }
                // Set Discord webhook URL
                if (profile?.discord_webhook_url) {
                    setDiscordWebhookUrl(profile.discord_webhook_url);
                }
            }
            setLoading(false);
        };
        getUser();

        // Set tab from URL parameter if provided
        if (tabParam && ['profile', 'notifications', 'security', 'integrations', 'domain'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleProfileUpdate = async (formData: FormData) => {
        setSaving(true);

        const result = await updateProfile(formData);

        setSaving(false);
    };

    const handlePasswordUpdate = async (formData: FormData) => {
        setSaving(true);

        const result = await updatePassword(formData);

        if (!result.error) {
            // Optional: Clear form
            (document.getElementById('password-form') as HTMLFormElement)?.reset();
        }
        setSaving(false);
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleAccessToken(tokenResponse.access_token);
            const result = await saveGoogleCalendarToken(tokenResponse.access_token);
        },
        onError: () => {
        },
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
    });

    const handleGoogleSignOut = async () => {
        const result = await deleteGoogleCalendarToken();
        if (!result.error) {
            setGoogleAccessToken(null);
        }
    };

    const tabs = [
        { id: "profile" as SettingsTab, label: "Profile", icon: User },
        { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
        { id: "security" as SettingsTab, label: "Security", icon: Lock },
        { id: "integrations" as SettingsTab, label: "Integrations", icon: Blocks },
        { id: "domain" as SettingsTab, label: "Domain & SEO", icon: Globe },
    ];

    if (loading) {
        return <div className="p-8 text-center text-white/40">Loading settings...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-white/60">Manage your agency preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeTab === tab.id
                                ? "bg-white/10 text-white"
                                : "hover:bg-white/5 text-white/60 hover:text-white"
                                }`}
                        >
                            <tab.icon className="w-5 h-5" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">


                    {/* Profile Section */}
                    {activeTab === "profile" && (
                        <form action={handleProfileUpdate}>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                                <h2 className="text-xl font-bold border-b border-white/10 pb-4">Agency Profile</h2>

                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden border-2 border-white/10 group-hover:border-blue-500 transition-colors">
                                            {profile?.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/40">
                                                    <User className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                            <span className="text-xs font-bold text-white">Change</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    setSaving(true);
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                                                    const filePath = `${fileName}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('avatars')
                                                        .upload(filePath, file);

                                                    if (uploadError) {
                                                        console.error("Upload error:", uploadError);
                                                        setSaving(false);
                                                        return;
                                                    }

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('avatars')
                                                        .getPublicUrl(filePath);

                                                    // Update local state immediately for preview
                                                    setProfile({ ...profile, avatar_url: publicUrl });

                                                    // Create a hidden input to send the URL with the form
                                                    const form = e.target.closest('form');
                                                    if (form) {
                                                        const input = document.createElement('input');
                                                        input.type = 'hidden';
                                                        input.name = 'avatarUrl';
                                                        input.value = publicUrl;
                                                        form.appendChild(input);
                                                    }
                                                    setSaving(false);
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-white">{profile?.full_name || "Agency Member"}</h3>
                                        <p className="text-sm text-white/40">Allowed: JPG, GIF or PNG. Max size of 800K</p>
                                    </div>
                                </div>

                                <input type="hidden" name="avatarUrl" value={profile?.avatar_url || ""} />
                                <input type="hidden" name="discordWebhookUrl" value={profile?.discord_webhook_url || ""} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Full Name</label>
                                        <input
                                            name="fullName"
                                            type="text"
                                            defaultValue={profile?.full_name || user?.user_metadata?.full_name || ""}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Contact Email</label>
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email || ""}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white/50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-white/60">Role</label>
                                        <select
                                            name="role"
                                            defaultValue={profile?.role || "Member"}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30 appearance-none"
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Notifications Section */}
                    {activeTab === "notifications" && (
                        <form action={handleProfileUpdate}>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                                <h2 className="text-xl font-bold border-b border-white/10 pb-4">Notification Settings</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div>
                                            <h3 className="font-medium text-white">Real-time Notifications</h3>
                                            <p className="text-sm text-white/60 mt-1">Get instant notifications for important updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="realtimeNotifications"
                                                defaultChecked={profile?.realtime_notifications ?? true}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div>
                                            <h3 className="font-medium text-white">Email Notifications</h3>
                                            <p className="text-sm text-white/60 mt-1">Receive email updates for tasks and events</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emailNotifications"
                                                defaultChecked={profile?.email_notifications ?? true}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Hidden fields to preserve other profile data */}
                                <input type="hidden" name="fullName" value={profile?.full_name || ""} />
                                <input type="hidden" name="avatarUrl" value={profile?.avatar_url || ""} />
                                <input type="hidden" name="role" value={profile?.role || ""} />
                                <input type="hidden" name="discordWebhookUrl" value={profile?.discord_webhook_url || ""} />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Notification Settings
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Section */}
                    {activeTab === "security" && (
                        <form id="password-form" action={handlePasswordUpdate}>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                                <h2 className="text-xl font-bold border-b border-white/10 pb-4">Security Settings</h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">New Password</label>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Confirm New Password</label>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Integrations Section */}
                    {activeTab === "integrations" && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-white/10 pb-4">Integrations</h2>

                            {/* Google Calendar */}
                            <div className="space-y-4 pb-6 border-b border-white/10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Google Calendar</h3>
                                            <p className="text-sm text-white/60 mt-1">
                                                {googleAccessToken
                                                    ? "Connected - Your calendar events are synced"
                                                    : "Connect your Google Calendar to view and manage events"}
                                            </p>
                                        </div>
                                    </div>
                                    {googleAccessToken ? (
                                        <button
                                            onClick={handleGoogleSignOut}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                                        >
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => googleLogin()}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
                                        >
                                            Connect
                                        </button>
                                    )}
                                </div>
                                {googleAccessToken && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-sm text-green-400">Active connection</span>
                                    </div>
                                )}
                            </div>

                            {/* Discord Webhook */}
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Bell className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Discord Webhook</h3>
                                            <p className="text-sm text-white/60 mt-1">
                                                {discordWebhookUrl
                                                    ? "Connected - Receiving task alerts in Discord"
                                                    : "Connect Discord to receive task alerts and notifications"}
                                            </p>
                                        </div>
                                    </div>
                                    {discordWebhookUrl ? (
                                        <button
                                            onClick={async () => {
                                                const formData = new FormData();
                                                formData.append('discordWebhookUrl', '');
                                                formData.append('fullName', profile?.full_name || '');
                                                formData.append('avatarUrl', profile?.avatar_url || '');
                                                formData.append('role', profile?.role || '');
                                                const result = await updateProfile(formData);
                                                if (!result.error) {
                                                    setDiscordWebhookUrl('');
                                                    setProfile({ ...profile, discord_webhook_url: '' });

                                                }
                                            }}
                                            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/30"
                                        >
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setWebhookInput(discordWebhookUrl || "");
                                                setShowDiscordModal(true);
                                            }}
                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                                        >
                                            Connect
                                        </button>
                                    )}
                                </div>
                                {profile?.discord_webhook_url && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-sm text-green-400">Active connection</span>
                                    </div>
                                )}
                            </div>

                            {/* Discord Modal */}
                            {showDiscordModal && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDiscordModal(false)}>
                                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="text-xl font-bold mb-4">Connect Discord Webhook</h3>
                                        <p className="text-sm text-white/60 mb-4">
                                            Create a webhook in your Discord server settings and paste the URL here to receive task alerts.
                                        </p>
                                        <input
                                            type="url"
                                            placeholder="https://discord.com/api/webhooks/..."
                                            value={webhookInput}
                                            onChange={(e) => setWebhookInput(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 mb-4"
                                        />
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => {
                                                    setShowDiscordModal(false);
                                                    setWebhookInput('');
                                                }}
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const formData = new FormData();
                                                    formData.append('discordWebhookUrl', webhookInput);
                                                    formData.append('fullName', profile?.full_name || '');
                                                    formData.append('avatarUrl', profile?.avatar_url || '');
                                                    formData.append('role', profile?.role || '');
                                                    const result = await updateProfile(formData);
                                                    if (!result.error) {
                                                        setShowDiscordModal(false);
                                                        setDiscordWebhookUrl(webhookInput);
                                                        setProfile({ ...profile, discord_webhook_url: webhookInput });

                                                    } else {
                                                    }
                                                }}
                                                disabled={!webhookInput}
                                                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Domain & SEO Section */}
                    {activeTab === "domain" && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-white/10 pb-4">Domain & SEO</h2>
                            <p className="text-white/40">Domain & SEO settings are not yet implemented.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
