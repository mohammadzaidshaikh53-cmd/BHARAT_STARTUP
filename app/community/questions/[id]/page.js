// app/community/questions/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DiscussionThread } from '@/components/community/DiscussionThread';

export default function QuestionDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const fetchData = async () => {
      const { data: q, error: qErr } = await supabase
        .from('questions')
        .select('*, user:author_id (id, raw_user_meta_data)')
        .eq('id', id)
        .single();
      if (qErr) return router.push('/community/questions');
      setQuestion(q);

      const { data: ans } = await supabase
        .from('answers')
        .select('*, user:author_id (id, raw_user_meta_data)')
        .eq('question_id', id)
        .eq('is_deleted', false)
        .order('is_best_answer', { ascending: false })
        .order('created_at', { ascending: true });
      setAnswers(ans || []);
      setLoading(false);
    };
    fetchData();
  }, [id, router]);

  const vote = async (targetType, targetId, voteType) => {
    if (!user) return alert('Please log in to vote');
    await supabase.rpc('cast_vote', {
      p_target_type: targetType,
      p_target_id: targetId,
      p_vote_type: voteType,
    });
    // Refresh answers or question (simplified – reload)
    window.location.reload();
  };

  const submitAnswer = async () => {
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('answers').insert({
      question_id: id,
      author_id: user.id,
      content: newAnswer,
    });
    if (!error) {
      setNewAnswer('');
      const { data } = await supabase
        .from('answers')
        .select('*, user:author_id (id, raw_user_meta_data)')
        .eq('question_id', id);
      setAnswers(data || []);
    }
    setSubmitting(false);
  };

  const markBestAnswer = async (answerId) => {
    if (question.author_id !== user?.id) return;
    await supabase.from('questions').update({ best_answer_id: answerId }).eq('id', id);
    await supabase.from('answers').update({ is_best_answer: false }).eq('question_id', id);
    await supabase.from('answers').update({ is_best_answer: true }).eq('id', answerId);
    window.location.reload();
  };

  if (loading) return <Container className="py-12">Loading...</Container>;
  if (!question) return <Container className="py-12">Question not found</Container>;

  return (
    <Container className="py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-3">{question.title}</h1>
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
        <Avatar name={question.user?.raw_user_meta_data?.full_name || 'User'} size={24} />
        <span>{question.user?.raw_user_meta_data?.full_name || 'Anonymous'}</span>
        <span>{new Date(question.created_at).toLocaleDateString()}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{question.content}</p>

      <div className="mb-8">
        <button
          onClick={() => vote('question', id, 1)}
          className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
        >
          👍 Upvote
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Answers ({answers.length})</h2>
      <div className="space-y-5">
        {answers.map(a => (
          <div key={a.id} className="border-l-2 border-orange-300 pl-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar name={a.user?.raw_user_meta_data?.full_name || 'User'} size={24} />
                <span className="font-medium">{a.user?.raw_user_meta_data?.full_name || 'Anonymous'}</span>
              </div>
              <button onClick={() => vote('answer', a.id, 1)} className="text-xs">👍 Upvote</button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 my-2">{a.content}</p>
            {question.author_id === user?.id && !question.best_answer_id && (
              <Button variant="ghost" size="sm" onClick={() => markBestAnswer(a.id)}>
                Mark as Best Answer
              </Button>
            )}
            {question.best_answer_id === a.id && (
              <span className="text-green-600 text-sm font-semibold">✓ Best Answer</span>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-8">
          <textarea
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            className="w-full border rounded-lg p-3 dark:bg-gray-800"
            rows={4}
            placeholder="Write your answer..."
          />
          <Button className="mt-2" onClick={submitAnswer} disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Answer'}
          </Button>
        </div>
      )}

      {/* Discussion thread on the question itself */}
      <DiscussionThread contentType="question" contentId={id} currentUserId={user?.id} />
    </Container>
  );
}