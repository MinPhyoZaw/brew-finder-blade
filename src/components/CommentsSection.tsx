import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from '../types/auth';

interface CommentItem {
  id: string;
  userId?: string;
  userName?: string;
  text: string;
  createdAt?: any;
}

interface Props {
  coffeeShopId: string;
  currentUser: User | null;
}

export const CommentsSection: React.FC<Props> = ({ coffeeShopId, currentUser }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (!coffeeShopId) return;

    const commentsRef = collection(db, 'coffeeshops', coffeeShopId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setComments(docs as CommentItem[]);
    }, (err) => {
      console.error('Comments listener error:', err);
    });

    return () => unsubscribe();
  }, [coffeeShopId]);

  const timeAgo = (value: any) => {
    try {
      let date: Date | null = null;
      if (!value) return '';
      if (value.seconds) {
        date = new Date(value.seconds * 1000);
      } else if (typeof value === 'string') {
        date = new Date(value);
      } else if (value instanceof Date) {
        date = value;
      }
      if (!date || isNaN(date.getTime())) return '';

      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return `a moment ago`;

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    } catch (err) {
      return '';
    }
  };

  const handlePostComment = async () => {
    if (!currentUser) return;
    if (!newComment.trim()) return;
    setPosting(true);
    const commentsRef = collection(db, 'coffeeshops', coffeeShopId, 'comments');

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      userId: currentUser.id,
      userName: currentUser.name,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [optimistic, ...c]);
    setNewComment('');

    try {
      await addDoc(commentsRef, {
        userId: currentUser.id,
        userName: currentUser.name,
        text: optimistic.text,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error posting comment:', err);
      setComments((c) => c.filter(item => item.id !== tempId));
    } finally {
      setPosting(false);
    }
  };

  const handleStartEdit = (c: CommentItem) => {
    setEditingId(c.id);
    setEditingText(c.text || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!currentUser) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;

    const prev = [...comments];
    setComments((c) => c.map(it => (it.id === commentId ? { ...it, text: trimmed } : it)));
    setEditingId(null);
    setEditingText('');

    if (commentId.startsWith('temp-')) return;

    try {
      const ref = doc(db, 'coffeeshops', coffeeShopId, 'comments', commentId);
      await updateDoc(ref, { text: trimmed });
    } catch (err) {
      console.error('Error updating comment:', err);
      setComments(prev);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    if (!window.confirm('Delete this comment?')) return;

    const prev = [...comments];
    setComments((c) => c.filter(it => it.id !== commentId));

    if (commentId.startsWith('temp-')) return;

    try {
      const ref = doc(db, 'coffeeshops', coffeeShopId, 'comments', commentId);
      await deleteDoc(ref);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setComments(prev);
    }
  };

  return (
    <div className="p-4 sm:p-6 border-t border-gray-100 bg-white/50 rounded-b-xl">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>

      {currentUser ? (
        <div className="space-y-3 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Share your thoughts about this place..."
            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none resize-none"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              onClick={() => setNewComment('')}
              className="px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 w-full sm:w-auto"
            >
              Clear
            </button>
            <button
              onClick={handlePostComment}
              disabled={posting || newComment.trim().length === 0}
              className={`px-4 py-2 rounded-md text-sm text-white ${posting || newComment.trim().length === 0 ? 'bg-gray-300' : 'bg-[#6F4E37] hover:bg-[#5b3f2e]'} w-full sm:w-auto`}
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-4">Please sign in to leave a comment.</p>
      )}

      <div className="space-y-4 max-h-56 sm:max-h-72 overflow-y-auto pr-2">
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet. Be the first to share your experience.</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="border border-gray-100 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{c.userName || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">{timeAgo(c.createdAt)}</div>
              </div>

              {currentUser?.id === c.userId && (
                <div className="flex items-center gap-2 ml-3">
                  {editingId !== c.id && (
                    <>
                      <button onClick={() => handleStartEdit(c)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {editingId === c.id ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={handleCancelEdit} className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={() => handleSaveEdit(c.id)} className="px-3 py-1 rounded-md text-sm text-white bg-[#6F4E37] hover:bg-[#5b3f2e]">Save</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
