import React, { createContext, useContext, useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { SoftUser } from "../lib/types";

interface AuthContextType {
  user: SoftUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isActive: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SoftUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem("unreal_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Verify with RTDB for real-time status
      const userRef = ref(rtdb, `softUsers/${parsedUser.id}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUser(data);
          setIsActive(data.status === "Active");
        } else {
          setUser(null);
          localStorage.removeItem("unreal_user");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    return new Promise<boolean>((resolve) => {
      const usersRef = ref(rtdb, "softUsers");
      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          const targetUser = Object.values(users).find(
            (u: any) => u.username === username && u.password === password
          ) as SoftUser;

          if (targetUser) {
            setUser(targetUser);
            setIsActive(targetUser.status === "Active");
            localStorage.setItem("unreal_user", JSON.stringify(targetUser));
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }, { onlyOnce: true });
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("unreal_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isActive }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
