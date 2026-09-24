import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading, error, clearError } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    // The error will be set by the auth functions if needed
    
    const success = isLogin 
      ? await signIn(email, password)
      : await signUp(name, email, password);

    if (success) {
      onClose();
      resetForm();
      // Force a small delay to ensure state is updated
      // setTimeout(() => {
      //   window.location.reload();
      // }, 100);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
    clearError(); // Clear any previous errors when switching modes
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-coffee-900/50 p-2 sm:p-4"
    >
      <div className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-0.5rem)] max-w-4xl flex-col overflow-y-auto rounded-xl border border-coffee-200 bg-cream-50 shadow-lg md:max-h-[700px] md:flex-row">
        {/* Left: image / branding (50%) - on small screens this will be top and occupy 50% height */}
        <div className="flex w-full shrink-0 items-center justify-center bg-gradient-to-br from-[#EBD7B3] to-[#F6E8D8] p-3 md:w-1/2 md:p-6">
          <div className="flex items-center gap-3 text-left md:flex-col md:px-6 md:text-center">
            <img src="/brew-logo.png" alt="Brew Finder" className="h-14 w-14 rounded-full object-cover shadow-md md:mb-6 md:h-36 md:w-36" />
            <div><h3 className="text-lg font-bold text-coffee-900 logo-font md:text-2xl">Brew Finder</h3>
            <p className="mt-1 hidden text-sm text-coffee-800 min-[375px]:block md:mt-2">Find your perfect cup — one café at a time.</p></div>
          </div>
        </div>

  {/* Right: form (50%) */}
  <div className="relative flex w-full min-w-0 flex-col p-4 md:w-1/2 md:p-6">
          <button
            onClick={onClose}
            aria-label="Close auth modal"
            className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full hover:bg-coffee-100 transition-colors duration-200 md:right-4 md:top-4"
          >
            <X className="w-5 h-5 text-coffee-500" />
          </button>

          <div className="mt-7 w-full min-w-0 md:mt-2">
            <h2 className="text-2xl font-bold text-coffee-900 logo-font mb-1">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="text-sm text-coffee-600 mb-6">
              {isLogin ? 'Welcome back — please enter your credentials.' : 'Create an account to save favorites and write reviews.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1 sm:mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm sm:text-base bg-cream-50"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1 sm:mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm sm:text-base bg-cream-50"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm sm:text-base bg-cream-50"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

              {error && (
                <div className="bg-coffee-100 border border-coffee-300 rounded-lg p-3">
                  <p className="break-words text-sm text-coffee-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-400 text-cream-100 font-medium py-2 sm:py-3 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream-100"></div>
                ) : (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-coffee-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-coffee-600 hover:text-coffee-700 font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
