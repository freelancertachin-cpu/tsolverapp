
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  CornerDownRight, 
  MoreVertical,
  CheckCircle2,
  Trash2,
  Flag
} from 'lucide-react';
import { UserProfile, storage } from '../lib/storage';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isPremium: boolean;
  content: string;
  timestamp: number;
  likes: number;
  replies: Comment[];
}

interface CommentsProps {
  contentId: string;
  user: UserProfile | null;
}

export const Comments: React.FC<CommentsProps> = ({ contentId, user }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    // Load comments from local or Firebase
    const loadComments = async () => {
      // Mock loading
      const mock: Comment[] = [
        {
          id: 'c1',
          userId: 'u1',
          userName: 'Ariful Islam',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ariful',
          isPremium: true,
          content: 'This problem was very challenging! Thanks for the breakdown.',
          timestamp: Date.now() - 3600000,
          likes: 24,
          replies: []
        },
        {
          id: 'c2',
          userId: 'u2',
          userName: 'Sumaiya Akter',
          isPremium: false,
          content: 'Does anyone have a similar problem for practice?',
          timestamp: Date.now() - 7200000,
          likes: 5,
          replies: []
        }
      ];
      setComments(mock);
    };
    loadComments();
  }, [contentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to participate in the architecture.');
      return;
    }
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      isPremium: !!user.isPremium,
      content: newComment,
      timestamp: Date.now(),
      likes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="w-full space-y-12">
       <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-4">
             Neural Discussion Board <span className="text-[10px] opacity-20 NOT-ITALIC">{comments.length} Nodes</span>
          </h3>
       </div>

       {/* Post Comment */}
       {user ? (
         <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-0 bg-white shadow-glow opacity-0 group-focus-within:opacity-[0.02] transition-opacity rounded-[32px] pointer-events-none" />
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Inject knowledge into this thread..."
              className="w-full min-h-[140px] bg-white/5 border border-white/10 rounded-[32px] p-8 outline-none focus:border-white/30 transition-all font-bold uppercase text-[11px] tracking-widest placeholder:text-white/10 resize-none"
            />
            <div className="absolute bottom-6 right-6 flex items-center gap-4">
               <span className="text-[8px] font-black uppercase tracking-widest opacity-20">CTRL + Enter to transmit</span>
               <button 
                 type="submit"
                 disabled={!newComment.trim()}
                 className="h-12 px-8 bg-white text-black rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-30 disabled:scale-100"
               >
                  Transmit Node
               </button>
            </div>
         </form>
       ) : (
         <div className="cyber-panel p-10 text-center space-y-6 opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Authentication Required for Transmission</p>
            <button className="h-10 px-8 bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest">Connect Identity</button>
         </div>
       )}

       {/* Comment List */}
       <div className="space-y-8">
          <AnimatePresence mode="popLayout">
             {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group"
                >
                   <div className="flex gap-6">
                      <div className="relative h-14 w-14 shrink-0">
                         <div className="h-full w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                            {comment.userAvatar ? (
                               <img src={comment.userAvatar} className="h-full w-full object-cover" alt="Avatar" />
                            ) : (
                               <div className="h-full w-full flex items-center justify-center font-black text-white/20 uppercase text-xs">
                                  {comment.userName.charAt(0)}
                               </div>
                            )}
                            {comment.isPremium && (
                               <div className="absolute -bottom-1 -right-1 bg-blue-500 h-5 w-5 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                                  <CheckCircle2 size={10} className="text-white" />
                               </div>
                            )}
                         </div>
                      </div>

                      <div className="flex-1 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <h4 className="text-[11px] font-black uppercase italic tracking-widest">{comment.userName}</h4>
                                  <span className="text-[8px] font-bold text-white/20 uppercase">
                                     {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff]/40">Verified Scholar Node</p>
                            </div>
                            <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <MoreVertical size={16} className="text-white/20" />
                            </button>
                         </div>

                         <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl rounded-tl-none">
                            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest leading-relaxed">
                               {comment.content}
                            </p>
                         </div>

                         <div className="flex items-center gap-8 pl-2">
                            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors">
                               <Heart size={14} /> {comment.likes}
                            </button>
                            <button 
                              onClick={() => setReplyingTo(comment.id)}
                              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                            >
                               <MessageCircle size={14} /> Reply
                            </button>
                            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                               <Share2 size={14} /> Share
                            </button>
                         </div>

                         {/* Replies */}
                         {comment.replies.length > 0 && (
                           <div className="pl-6 space-y-6 pt-4 border-l border-white/5 ml-2 mt-4">
                              {comment.replies.map(reply => (
                                 <div key={reply.id} className="flex gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10" />
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-3">
                                          <span className="text-[9px] font-black uppercase tracking-widest">{reply.userName}</span>
                                          <span className="text-[7px] text-white/20">2m ago</span>
                                       </div>
                                       <p className="text-[10px] text-white/60 uppercase font-bold">{reply.content}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                         )}
                      </div>
                   </div>
                </motion.div>
             ))}
          </AnimatePresence>
       </div>
    </div>
  );
};
