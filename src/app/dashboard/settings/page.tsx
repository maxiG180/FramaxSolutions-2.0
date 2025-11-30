"use client";

import { useState, useEffect } from "react";
import { User, Bell, Lock, Globe, Save, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateProfile, updatePassword } from "./actions";

type SettingsTab = "profile" | "notifications" | "security" | "domain";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const supabase = createClient();

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
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleProfileUpdate = async (formData: FormData) => {
        setSaving(true);
        setMessage(null);

        const result = await updateProfile(formData);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        }
        setSaving(false);
    };

    const handlePasswordUpdate = async (formData: FormData) => {
        setSaving(true);
        setMessage(null);

        const result = await updatePassword(formData);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Password updated successfully' });
            // Optional: Clear form
            (document.getElementById('password-form') as HTMLFormElement)?.reset();
        }
        setSaving(false);
    };

    const tabs = [
        { id: "profile" as SettingsTab, label: "Profile", icon: User },
        { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
        { id: "security" as SettingsTab, label: "Security", icon: Lock },
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
                    {message && (
                        <div className={`p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

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
                                                        setMessage({ type: 'error', text: `Error uploading image: ${uploadError.message}` });
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
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                            <h2 className="text-xl font-bold border-b border-white/10 pb-4">Notification Settings</h2>
                            <p className="text-white/40">Notification settings are not yet implemented.</p>
                        </div>
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
