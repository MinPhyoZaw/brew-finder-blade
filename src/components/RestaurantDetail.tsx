import React, { useEffect, useState, lazy, Suspense } from 'react';
import { X, MapPin, Phone, Clock, Star, ArrowLeft } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
const ImageSlideshow = lazy(() => import('./ImageSlideshow').then(m => ({ default: m.ImageSlideshow })));
import type { CoffeeShop } from '../types/restaurant';

interface CoffeeShopDetailProps {
  coffeeShop: CoffeeShop;
  onClose: () => void;
}

export const CoffeeShopDetail: React.FC<CoffeeShopDetailProps> = ({ coffeeShop, onClose }) => {
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);
  const { user } = useAuth();

  // Comments state
  const [comments, setComments] = useState<Array<{ id: string; userId?: string; userName?: string; text: string; createdAt?: any }>>([]);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 text-yellow-400 fill-yellow-400/50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  // 🔹 Real-time "Open Now" checker
  useEffect(() => {
    if (coffeeShop.hours) {
      const hours = coffeeShop.hours.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/gi);
      if (hours && hours.length >= 2) {
        const [openTime, closeTime] = hours.map(t => {
          const [time, meridian] = t.split(' ');
          let [hour, minute] = time.split(':').map(Number);
          if (meridian.toUpperCase() === 'PM' && hour < 12) hour += 12;
          if (meridian.toUpperCase() === 'AM' && hour === 12) hour = 0;
          const now = new Date();
          now.setHours(hour, minute, 0, 0);
          return now.getTime();
        });

        const now = new Date();
        const nowTime = now.getHours() * 60 + now.getMinutes();
        const open = new Date(openTime);
        const close = new Date(closeTime);
        const openMinutes = open.getHours() * 60 + open.getMinutes();
        const closeMinutes = close.getHours() * 60 + close.getMinutes();

        setIsOpenNow(nowTime >= openMinutes && nowTime <= closeMinutes);
      }
    }
  }, [coffeeShop.hours]);

  // Real-time comments listener
  useEffect(() => {
    if (!coffeeShop?.id) return;

    const commentsRef = collection(db, 'coffeeshops', coffeeShop.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setComments(docs as any);
    }, (err) => {
      console.error('Comments listener error:', err);
    });

    return () => unsubscribe();
  }, [coffeeShop.id]);

  const handlePostComment = async () => {
    if (!user) return; // should not happen due to UI guard
    if (!newComment.trim()) return;
    setPosting(true);
    const commentsRef = collection(db, 'coffeeshops', coffeeShop.id, 'comments');

    // optimistic UI: add local comment immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      userId: user.id,
      userName: user.name,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [optimistic, ...c]);
    setNewComment('');

    try {
      await addDoc(commentsRef, {
        userId: user.id,
        userName: user.name,
        text: optimistic.text,
        createdAt: serverTimestamp(),
      });
      // real listener will reconcile optimistic item with server data
    } catch (err) {
      console.error('Error posting comment:', err);
      // remove optimistic comment on failure
      setComments((c) => c.filter(item => item.id !== tempId));
    } finally {
      setPosting(false);
    }
  };

  // Helper: relative time like '2m ago', '1h ago'
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

  const handleStartEdit = (c: any) => {
    setEditingId(c.id);
    setEditingText(c.text || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!user) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;

    // optimistic update locally
    const prev = [...comments];
    setComments((c) => c.map(it => (it.id === commentId ? { ...it, text: trimmed } : it)));
    setEditingId(null);
    setEditingText('');

    // If temp id, no remote doc yet
    if (commentId.startsWith('temp-')) return;

    try {
      const ref = doc(db, 'coffeeshops', coffeeShop.id, 'comments', commentId);
      await updateDoc(ref, { text: trimmed });
    } catch (err) {
      console.error('Error updating comment:', err);
      // revert
      setComments(prev);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    if (!window.confirm('Delete this comment?')) return;

    // optimistic remove
    const prev = [...comments];
    setComments((c) => c.filter(it => it.id !== commentId));

    // If temp id, nothing to delete remotely
    if (commentId.startsWith('temp-')) return;

    try {
      const ref = doc(db, 'coffeeshops', coffeeShop.id, 'comments', commentId);
      await deleteDoc(ref);
    } catch (err) {
      console.error('Error deleting comment:', err);
      // revert on failure
      setComments(prev);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Mobile back button */}
              <button
                onClick={onClose}
                className="sm:hidden p-2 -ml-2 mr-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 truncate">{coffeeShop.name}</h2>

              {isOpenNow !== null && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOpenNow
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isOpenNow ? 'Open' : 'Closed'}
                </span>
              )}
            </div>

            {/* Rating Stars and Tags */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 gap-2">
              {/* Stars */}
              <div className="flex items-center mr-4">
                {renderStars(coffeeShop.rating)}
                <span className="ml-2 text-sm text-gray-600 font-medium">
                  {coffeeShop.rating.toFixed(1)}
                </span>
              </div>

              {/* Tags from Firestore */}
              {coffeeShop.tags && coffeeShop.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coffeeShop.tags.map((tag: string) => {
                    const TAG_OPTIONS: Record<string, { label: string; color: string }> = {
                      first_date: { label: "First Date", color: "bg-pink-100 text-pink-700" },
                      photograph: { label: "Photograph", color: "bg-blue-100 text-blue-700" },
                      relax_chill: { label: "Relax & Chill", color: "bg-green-100 text-green-700" },
                      study_spot: { label: "Study Spot", color: "bg-yellow-100 text-yellow-700" },
                      group_hangout: { label: "Group Hangout", color: "bg-purple-100 text-purple-700" },
                      family: { label: "Family", color: "bg-orange-100 text-orange-700" },
                    };

                    const tagData = TAG_OPTIONS[tag] ?? { label: tag, color: "bg-gray-100 text-gray-700" };

                    return (
                      <span
                        key={tag}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagData.color}`}
                      >
                        {tagData.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Desktop close button (hidden on small screens) */}
          <button
            onClick={onClose}
            className="hidden sm:inline-flex p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Slideshow (lazy) - responsive heights for mobile/desktop */}
          <div className="w-full">
            <div className="w-full h-56 sm:h-96 rounded-lg overflow-hidden bg-gray-100">
              <Suspense fallback={<div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">Loading images...</div>}>
                <ImageSlideshow images={coffeeShop.images || []} restaurantName={coffeeShop.name} />
              </Suspense>
            </div>
          </div>

          {/* ✨ About Section */}
          {coffeeShop.description && (
            <div className="relative bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg p-6 transition-transform hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 drop-shadow-sm">
                About
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base drop-shadow-sm">
                {coffeeShop.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700 text-sm">{coffeeShop.address}</span>
              </div>

              {coffeeShop.phone && (
                <a
                  href={`tel:${coffeeShop.phone}`}
                  className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm">{coffeeShop.phone}</span>
                </a>
              )}

              {coffeeShop.hours && (
                <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{coffeeShop.hours}</span>
                </div>
              )}
            </div>

            {coffeeShop.distance !== undefined && (
              <p className="text-sm text-green-600 font-medium">
                {coffeeShop.distance} km away
              </p>
            )}
          </div>

            {/* Comments Section */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white/50 rounded-b-xl">
              <h3 className="text-lg font-semibold mb-3">Comments</h3>

              {user ? (
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

                      {user?.id === c.userId && (
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
        </div>
      </div>
    </div>
  );
};
