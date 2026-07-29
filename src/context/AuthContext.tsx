import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  User 
} from '../lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';
import { setDriveAccessToken } from '../lib/googleDriveService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  allUsers: UserProfile[];
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncUserProfile(fbUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserProfile = async (fbUser: User) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      const nowStr = new Date().toISOString();
      const userEmail = (fbUser.email || '').toLowerCase();
      const isTargetAdmin = 
        userEmail === 'febrianataum@gmail.com' || 
        userEmail.includes('febrian') || 
        userEmail.includes('admin');

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const roleToSet: UserRole = isTargetAdmin ? 'admin' : (data.role || 'operator');

        const updatedProfile: UserProfile = {
          ...data,
          displayName: fbUser.displayName || data.displayName || 'Pengguna',
          photoURL: fbUser.photoURL || data.photoURL || '',
          role: roleToSet,
          lastLogin: nowStr,
        };
        await updateDoc(userRef, {
          displayName: updatedProfile.displayName,
          photoURL: updatedProfile.photoURL,
          role: roleToSet,
          lastLogin: serverTimestamp(),
        });
        setUser(updatedProfile);
      } else {
        const role: UserRole = isTargetAdmin ? 'admin' : 'operator';

        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Pengguna Ombudsman',
          photoURL: fbUser.photoURL || '',
          role: role,
          lastLogin: nowStr,
          createdAt: nowStr,
        };

        await setDoc(userRef, {
          ...newProfile,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        setUser(newProfile);
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
      const userEmail = (fbUser.email || '').toLowerCase();
      const isTargetAdmin = 
        userEmail === 'febrianataum@gmail.com' || 
        userEmail.includes('febrian') || 
        userEmail.includes('admin');

      setUser({
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Pengguna Ombudsman',
        photoURL: fbUser.photoURL || '',
        role: isTargetAdmin ? 'admin' : 'operator',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setDriveAccessToken(credential.accessToken);
      }
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await syncUserProfile(cred.user);
      }
    } catch (err) {
      console.error('Email login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
        await syncUserProfile(cred.user);
      }
    } catch (err) {
      console.error('Email registration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      sessionStorage.removeItem('drive_access_token');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      if (user && user.uid === uid) {
        setUser({ ...user, role: newRole });
      }
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update user role:', err);
      throw err;
    }
  };

  const refreshUsers = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      usersSnap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          uid: d.uid || docSnap.id,
          email: d.email || '',
          displayName: d.displayName || 'Tanpa Nama',
          photoURL: d.photoURL || '',
          role: (d.role as UserRole) || 'operator',
          lastLogin: d.lastLogin ? new Date(d.lastLogin.toDate ? d.lastLogin.toDate() : d.lastLogin).toISOString() : new Date().toISOString(),
          createdAt: d.createdAt ? new Date(d.createdAt.toDate ? d.createdAt.toDate() : d.createdAt).toISOString() : new Date().toISOString(),
        });
      });
      setAllUsers(list);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserRole,
        allUsers,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
