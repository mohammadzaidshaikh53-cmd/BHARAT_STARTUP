// app/community/questions/page.js
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*, user:author_id (id, raw_user_meta_data)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!error) setQuestions(data || []);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Community Q&A</h1>
          {user && <Link href="/community/questions/new"><Button variant="primary">Ask a Question</Button></Link>}
        </div>
        <div className="space-y-4">
          {questions.map(q => (
            <Link key={q.id} href={`/community/questions/${q.id}`} className="block">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold">{q.title}</h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{q.content}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <Avatar name={q.user?.raw_user_meta_data?.full_name || 'User'} size={20} />
                  <span>{q.user?.raw_user_meta_data?.full_name || 'Anonymous'}</span>
                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}