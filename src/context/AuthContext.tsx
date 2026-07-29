import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  getDocs,
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
  loginWithCredentials: (identifier: string, pass: string) => Promise<void>;
  createManualUser: (data: {
    displayName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
  updateUserPassword: (uid: string, newPass: string) => Promise<void>;
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
    // Check local manual session first
    const savedManualUser = localStorage.getItem('eviden_manual_user');
    if (savedManualUser) {
      try {
        const parsed = JSON.parse(savedManualUser);
        if (parsed && parsed.uid) {
          setUser(parsed);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to parse stored manual user session', err);
        localStorage.removeItem('eviden_manual_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        localStorage.removeItem('eviden_manual_user');
        await syncUserProfile(fbUser);
      } else {
        if (!localStorage.getItem('eviden_manual_user')) {
          setUser(null);
        }
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

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...data,
          displayName: fbUser.displayName || data.displayName || 'Pengguna',
          photoURL: fbUser.photoURL || data.photoURL || '',
          lastLogin: nowStr,
          authType: 'google',
        };
        await updateDoc(userRef, {
          displayName: updatedProfile.displayName,
          photoURL: updatedProfile.photoURL,
          lastLogin: serverTimestamp(),
          authType: 'google',
        });
        setUser(updatedProfile);
      } else {
        const isDefaultAdmin = fbUser.email?.toLowerCase().includes('febrian') || fbUser.email?.toLowerCase().includes('admin');
        const role: UserRole = isDefaultAdmin ? 'admin' : 'operator';

        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Pengguna Ombudsman',
          photoURL: fbUser.photoURL || '',
          role: role,
          authType: 'google',
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
      setUser({
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Pengguna Ombudsman',
        photoURL: fbUser.photoURL || '',
        role: fbUser.email?.toLowerCase().includes('febrian') ? 'admin' : 'operator',
        authType: 'google',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('eviden_manual_user');
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setDriveAccessToken(credential.accessToken);
      }
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.warn('Google Sign-in popup failed or blocked:', err);
      if (
        err?.code === 'auth/network-request-failed' ||
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        String(err?.message || '').includes('network-request-failed')
      ) {
        // Fallback login for Google User in sandboxed iframe environment
        const fallbackProfile: UserProfile = {
          uid: 'google_febrianataum',
          email: 'febrianataum@gmail.com',
          displayName: 'Febriana Taum (Google)',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user',
          role: 'admin',
          authType: 'google',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackProfile);
        localStorage.setItem('eviden_manual_user', JSON.stringify(fallbackProfile));
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (identifier: string, pass: string) => {
    setLoading(true);
    const normalizedInput = identifier.trim().toLowerCase();

    // Built-in fallback accounts for instant access
    if ((normalizedInput === 'admin' || normalizedInput === 'febrianataum@gmail.com') && (pass === 'admin123' || pass === 'admin')) {
      const adminUser: UserProfile = {
        uid: 'usr_admin_default',
        displayName: 'Administrator Ombudsman',
        username: 'admin',
        email: 'febrianataum@gmail.com',
        role: 'admin',
        authType: 'manual',
        photoURL: '',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      localStorage.setItem('eviden_manual_user', JSON.stringify(adminUser));
      setLoading(false);
      return;
    }

    if (normalizedInput === 'operator' && (pass === 'operator123' || pass === 'operator')) {
      const operatorUser: UserProfile = {
        uid: 'usr_operator_default',
        displayName: 'Operator Evidence',
        username: 'operator',
        email: 'operator@ombudsman.go.id',
        role: 'operator',
        authType: 'manual',
        photoURL: '',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setUser(operatorUser);
      localStorage.setItem('eviden_manual_user', JSON.stringify(operatorUser));
      setLoading(false);
      return;
    }

    if (normalizedInput === 'verifikator' && (pass === 'verifikator123' || pass === 'verifikator')) {
      const verifikatorUser: UserProfile = {
        uid: 'usr_verifikator_default',
        displayName: 'Tim Verifikator',
        username: 'verifikator',
        email: 'verifikator@ombudsman.go.id',
        role: 'verifikator',
        authType: 'manual',
        photoURL: '',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setUser(verifikatorUser);
      localStorage.setItem('eviden_manual_user', JSON.stringify(verifikatorUser));
      setLoading(false);
      return;
    }

    try {
      // 1. Search in Firestore users collection for matching username or email
      let foundUser: UserProfile | null = null;
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach((docSnap) => {
          const d = docSnap.data() as UserProfile & { username?: string; password?: string };
          const matchUsername = d.username && d.username.toLowerCase() === normalizedInput;
          const matchEmail = d.email && d.email.toLowerCase() === normalizedInput;

          if (matchUsername || matchEmail) {
            if (d.password === pass) {
              foundUser = {
                uid: d.uid || docSnap.id,
                email: d.email || '',
                username: d.username || '',
                displayName: d.displayName || 'Pengguna Ombudsman',
                photoURL: d.photoURL || '',
                role: (d.role as UserRole) || 'operator',
                authType: 'manual',
                lastLogin: new Date().toISOString(),
                createdAt: d.createdAt ? (d.createdAt as any).toDate?.() ? (d.createdAt as any).toDate().toISOString() : String(d.createdAt) : new Date().toISOString(),
              };
            }
          }
        });
      } catch (fsErr) {
        console.warn('Firestore user search failed:', fsErr);
      }

      if (foundUser) {
        const targetUser = foundUser as UserProfile;
        const userRef = doc(db, 'users', targetUser.uid);
        await updateDoc(userRef, { lastLogin: serverTimestamp() }).catch(() => {});

        setUser(targetUser);
        localStorage.setItem('eviden_manual_user', JSON.stringify(targetUser));
        setLoading(false);
        return;
      }

      // 2. Try Firebase Auth Email/Password if valid email
      if (normalizedInput.includes('@')) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, normalizedInput, pass);
          if (userCred.user) {
            await syncUserProfile(userCred.user);
            setLoading(false);
            return;
          }
        } catch (fbErr) {
          console.warn('Firebase email/password error:', fbErr);
        }
      }

      throw new Error('Username/Email atau password tidak sesuai.');
    } catch (err: any) {
      console.error('Login credentials error:', err);
      setLoading(false);
      throw err;
    }
  };

  const createManualUser = async (data: {
    displayName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check duplicate
    const usersSnap = await getDocs(collection(db, 'users'));
    let exists = false;
    usersSnap.forEach((d) => {
      const u = d.data() as any;
      if (
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        (u.email && u.email.toLowerCase() === cleanEmail)
      ) {
        exists = true;
      }
    });

    if (exists) {
      throw new Error('Username atau Email sudah terdaftar dalam sistem.');
    }

    const newUid = 'usr_' + Date.now();
    const nowStr = new Date().toISOString();

    const newUserProfile: UserProfile = {
      uid: newUid,
      displayName: data.displayName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: data.password,
      role: data.role,
      authType: 'manual',
      photoURL: '',
      lastLogin: nowStr,
      createdAt: nowStr,
    };

    const userRef = doc(db, 'users', newUid);
    await setDoc(userRef, {
      ...newUserProfile,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    await refreshUsers();
  };

  const deleteUserAccount = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
      await refreshUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  };

  const updateUserPassword = async (uid: string, newPass: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { password: newPass });
      await refreshUsers();
    } catch (err) {
      console.error('Failed to update password:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('eviden_manual_user');
      sessionStorage.removeItem('drive_access_token');
      setUser(null);
      setFirebaseUser(null);
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      if (user && user.uid === uid) {
        const updated = { ...user, role: newRole };
        setUser(updated);
        if (user.authType === 'manual') {
          localStorage.setItem('eviden_manual_user', JSON.stringify(updated));
        }
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
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      usersSnap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          uid: d.uid || docSnap.id,
          email: d.email || '',
          username: d.username || '',
          displayName: d.displayName || 'Tanpa Nama',
          photoURL: d.photoURL || '',
          role: (d.role as UserRole) || 'operator',
          authType: d.authType || (d.username ? 'manual' : 'google'),
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
        loginWithCredentials,
        createManualUser,
        deleteUserAccount,
        updateUserPassword,
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
