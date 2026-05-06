// components/community/DiscussionThread.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export function DiscussionThread({ contentType, contentId, currentUserId }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const fetchDiscussions = useCallback(async () => {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        id, parent_id, body, created_at, author_id,
        users!author_id (id, raw_user_meta_data)
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    if (error) console.error(error);
    else setDiscussions(data || []);
    setLoading(false);
  }, [contentType, contentId]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const buildThreadTree = (flatList) => {
    const map = new Map();
    const roots = [];
    flatList.forEach(d => { map.set(d.id, { ...d, children: [] }); });
    flatList.forEach(d => {
      const node = map.get(d.id);
      if (d.parent_id && map.has(d.parent_id)) map.get(d.parent_id).children.push(node);
      else roots.push(node);
    });
    return roots;
  };

  const renderComment = (comment, depth = 0) => (
    <div key={comment.id} className={cn('mt-3', depth > 0 && 'ml-8 pl-3 border-l-2 border-gray-200')}>
      <div className="flex gap-2">
        <Avatar name={comment.users?.raw_user_meta_data?.full_name || 'User'} size={28} />
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <span className="text-xs font-semibold">
              {comment.users?.raw_user_meta_data?.full_name || 'Anonymous'}
            </span>
            <p className="text-sm mt-1">{comment.body}</p>
          </div>
          <div className="flex gap-2 text-xs text-gray-500 mt-1">
            <button onClick={() => setReplyTo(comment.id)} className="hover:text-orange-600">
              Reply
            </button>
            <button
              onClick={async () => {
                await supabase.rpc('cast_vote', {
                  p_target_type: 'discussion',
                  p_target_id: comment.id,
                  p_vote_type: 1,
                });
                fetchDiscussions();
              }}
            >
              👍 Upvote
            </button>
          </div>
        </div>
      </div>
      {comment.children?.map(child => renderComment(child, depth + 1))}
    </div>
  );

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUserId) return;
    setSubmitting(true);
    const { error } = await supabase.from('discussions').insert({
      content_type: contentType,
      content_id: contentId,
      author_id: currentUserId,
      body: newComment,
      parent_id: replyTo,
    });
    if (!error) {
      setNewComment('');
      setReplyTo(null);
      fetchDiscussions();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="py-4 text-center">Loading comments...</div>;

  const threaded = buildThreadTree(discussions);

  return (
    <div className="mt-10 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Discussion ({discussions.length})</h3>
      {currentUserId && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={replyTo ? 'Write your reply...' : 'Add a comment...'}
            className="w-full p-3 border rounded-lg dark:bg-gray-800"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            {replyTo && <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel reply</Button>}
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {threaded.map(root => renderComment(root))}
      </div>
    </div>
  );
}