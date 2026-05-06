'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Avatar } from '@/components/common/Avatar';
import { StarIcon } from '@heroicons/react/24/solid';

export function ProfileCard({ userId, showBio = false, showRating = false }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio, rating, is_verified')
        .eq('id', userId)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  if (loading || !profile) return null;

  return (
    <div className="flex items-center gap-3">
      <Avatar name={profile.full_name || profile.username} src={profile.avatar_url} size={40} />
      <div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-text-primary">{profile.full_name || profile.username}</span>
          {profile.is_verified && (
            <span className="text-accent-primary text-xs">✓</span>
          )}
        </div>
        {showRating && profile.rating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <StarIcon className="w-3 h-3 text-yellow-500" />
            <span>{profile.rating}</span>
          </div>
        )}
        {showBio && profile.bio && (
          <p className="text-xs text-text-tertiary mt-1">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}