import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; created_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Watch for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          email: firebaseUser.email || "",
          created_at: firebaseUser.metadata?.creationTime || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name in Firebase Auth
      await updateProfile(result.user, { displayName: name });

      // Save extra user info in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        createdAt: new Date(),
      });

      // Update local state immediately
      setUser({
        id: result.user.uid,
        name,
        email,
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser({
        id: result.user.uid,
        name: result.user.displayName || result.user.email || "",
        email: result.user.email || "",
        created_at: result.user.metadata?.creationTime || new Date().toISOString(),
      });
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("SignIn error:", err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error("SignOut error:", err);
      setError(err.message);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut: signOutUser,
    clearError,
  };
};
