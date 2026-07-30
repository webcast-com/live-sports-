import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const CommentSchema = z.object({
  message: z.string().min(1).max(1000),
});

interface MatchComment {
  id: string;
  match_id: string;
  user_id: string | null;
  user_name: string | null;
  user_avatar: string | null;
  message: string;
  created_at: string;
}

interface MatchChatProps {
  matchId: string | number;
  homeTeam: string;
  awayTeam: string;
}

export const MatchChat: React.FC<MatchChatProps> = ({ matchId, homeTeam, awayTeam }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commentsQuery = useQuery({
    queryKey: ['match-comments', String(matchId)],
    queryFn: async (): Promise<MatchComment[]> => {
      const { data, error } = await supabase
        .from('match_comments')
        .select('*')
        .eq('match_id', String(matchId))
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        // Table may not exist yet in dev - return empty
        if (error.code === '42P01') return [];
        throw error;
      }
      return (data as MatchComment[]) || [];
    },
    refetchInterval: 10000, // Poll every 10s as fallback
    staleTime: 5 * 1000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`match-chat-${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_comments', filter: `match_id=eq.${String(matchId)}` }, (payload) => {
        queryClient.setQueryData(['match-comments', String(matchId)], (old: MatchComment[] | undefined) => {
          const oldData = old || [];
          const exists = oldData.some(c => c.id === (payload.new as any).id);
          if (exists) return oldData;
          return [...oldData, payload.new as MatchComment];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentsQuery.data]);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const parsed = CommentSchema.parse({ message });
      const { data, error } = await supabase.from('match_comments').insert({
        match_id: String(matchId),
        user_id: user?.id || null,
        user_name: user?.name || user?.email?.split('@')[0] || 'Anonymous',
        message: parsed.message,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['match-comments', String(matchId)] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('match_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-comments', String(matchId)] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMutation.isPending) return;
    sendMutation.mutate(newMessage.trim());
  };

  const comments = commentsQuery.data || [];

  return (
    <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#00d4ff]" />
          <h3 className="text-white font-semibold text-sm">{t('chat.title')}</h3>
          <span className="text-xs text-gray-500">· {homeTeam} vs {awayTeam}</span>
        </div>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{comments.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {commentsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading chat...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{t('chat.noMessages')}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-semibold truncate">{comment.user_name || 'Anonymous'}</span>
                  <span className="text-gray-600 text-[10px]">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {user?.id === comment.user_id && (
                    <button onClick={() => deleteMutation.mutate(comment.id)} className="opacity-0 group-hover:opacity-100 ml-auto p-1 rounded hover:bg-white/10 transition-all">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 text-sm mt-1 break-words">{comment.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 flex gap-2">
        {user ? (
          <>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('chat.placeholder')}
              maxLength={1000}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50"
            />
            <button type="submit" disabled={!newMessage.trim() || sendMutation.isPending} className="px-4 py-2 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t('chat.send')}
            </button>
          </>
        ) : (
          <div className="flex-1 text-center py-2">
            <p className="text-gray-500 text-sm">{t('chat.signInToChat')}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default MatchChat;
