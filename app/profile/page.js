// app/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch or create profile
  // ---------------------------------------------------------------------------
  async function fetchProfile() {
    setLoading(true);
    setMessage(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Try to get existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        const defaultUsername = user.email.split('@')[0];
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username: defaultUsername,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || null,
              member_since: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Failed to create profile:', insertError);
          setMessage({ type: 'error', text: 'Could not create profile. Please try again.' });
          setLoading(false);
          return;
        }
        data = newProfile;
        error = null;
      }

      if (error) {
        console.error('Profile fetch error:', error);
        setMessage({ type: 'error', text: error.message });
        setLoading(false);
        return;
      }

      setProfile(data);
      setFormData(data || {});
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  // ---------------------------------------------------------------------------
  // Avatar upload
  // ---------------------------------------------------------------------------
  async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Only image files are allowed.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ type: 'success', text: 'Avatar updated!' });
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Save profile changes
  // ---------------------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        preferences: formData.preferences || {},
        social_links: formData.social_links || {},
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setMessage({ type: 'success', text: 'Profile updated!' });
      setEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-bg-base px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header / Avatar Section */}
        <div className="bg-bg-raised rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar with upload */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-bg-elevated border-4 border-accent-primary/20">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-text-secondary">
                    {profile?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-accent-primary rounded-full p-2 cursor-pointer shadow-lg hover:bg-accent-primary/80 transition">
                <CameraIcon className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Spinner className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-text-primary">{profile?.full_name || profile?.username}</h1>
              <p className="text-text-secondary">@{profile?.username}</p>
              {profile?.bio && <p className="mt-2 text-text-secondary">{profile.bio}</p>}
              <div className="flex gap-2 mt-3 justify-center md:justify-start">
                <Button variant="primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-bg-raised p-4 rounded-xl border border-white/10">
            <p className="text-text-tertiary text-sm">Member since</p>
            <p className="text-text-primary font-medium">
              {profile?.member_since ? new Date(profile.member_since).toLocaleDateString() : 'Recently'}
            </p>
          </div>
          <div className="bg-bg-raised p-4 rounded-xl border border-white/10">
            <p className="text-text-tertiary text-sm">Rating</p>
            <p className="text-text-primary font-medium">
              {profile?.rating || 0} ★ ({profile?.total_reviews || 0} reviews)
            </p>
          </div>
          <div className="bg-bg-raised p-4 rounded-xl border border-white/10">
            <p className="text-text-tertiary text-sm">Location</p>
            <p className="text-text-primary font-medium">{profile?.location || 'Not set'}</p>
          </div>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-raised rounded-2xl max-w-lg w-full p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button onClick={() => setEditing(false)} className="text-text-tertiary hover:text-text-primary">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio || ''}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                    placeholder="Tell others about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-text-primary"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? <Spinner className="w-4 h-4" /> : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>

              {message && (
                <div className={`mt-4 p-2 rounded text-sm ${message.type === 'error' ? 'bg-status-error/20 text-status-error' : 'bg-green-500/20 text-green-500'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* General message display (non‑modal) */}
        {message && !editing && (
          <div className={`p-3 rounded-xl ${message.type === 'error' ? 'bg-status-error/20 text-status-error' : 'bg-green-500/20 text-green-500'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}