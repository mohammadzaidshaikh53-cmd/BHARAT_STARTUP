// app/community/questions/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NewQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login?redirect=/community/questions/new');
      else setUser(session.user);
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('questions').insert({
      title,
      content,
      author_id: user.id,
      tags: tags.split(',').map(t => t.trim()),
      status: 'open',
    });
    if (!error) {
      router.push('/community/questions');
    } else {
      alert('Error posting question');
    }
    setSubmitting(false);
  };

  if (!user) return <Container className="py-12">Checking authentication...</Container>;

  return (
    <Container className="py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2 dark:bg-gray-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            className="w-full border rounded-lg p-2 dark:bg-gray-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g., startup, funding, marketing"
            className="w-full border rounded-lg p-2 dark:bg-gray-800"
          />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Question'}
        </Button>
      </form>
    </Container>
  );
}