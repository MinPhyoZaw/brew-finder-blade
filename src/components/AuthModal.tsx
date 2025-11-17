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
      className="fixed inset-0 bg-coffee-900 bg-opacity-50 flex items-center justify-center p-4 z-50 px-4"
    >
      <div className="bg-cream-50 rounded-xl max-w-4xl w-full mx-4 border border-coffee-200 overflow-hidden shadow-lg flex flex-col md:flex-row h-[80vh] max-h-[700px]">
        {/* Left: image / branding (50%) - on small screens this will be top and occupy 50% height */}
        <div className="w-full md:w-1/2 h-1/2 md:h-auto flex items-center justify-center bg-gradient-to-br from-[#EBD7B3] to-[#F6E8D8] p-6">
          <div className="flex flex-col items-center text-center px-6">
            <img src="/brew-logo.png" alt="Brew Finder" className="w-36 h-36 rounded-full object-cover shadow-md mb-6" />
            <h3 className="text-2xl font-bold text-coffee-900 logo-font">Brew Finder</h3>
            <p className="text-sm text-coffee-800 mt-2">Find your perfect cup — one café at a time.</p>
          </div>
        </div>

  {/* Right: form (50%) */}
  <div className="w-full md:w-1/2 h-1/2 md:h-auto p-6 overflow-auto relative flex flex-col">
          <button
            onClick={onClose}
            aria-label="Close auth modal"
            className="absolute right-4 top-4 p-2 hover:bg-coffee-100 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-coffee-500" />
          </button>

          <div className="mt-6 md:mt-2 w-full">
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
                  <p className="text-coffee-800 text-sm">{error}</p>
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