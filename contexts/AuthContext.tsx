import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Alert } from "react-native";

interface AuthContextType {
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, extraData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  const signUp = async (email: string, password: string, extraData?: any) => {
  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: extraData },
    });

    if (error) throw error;

    const { error: insertError } = await supabase.from("users_app").insert([
      {
        name: extraData?.name,
        username: extraData?.username,
        email,
      },
    ]);

    if (insertError) {
      console.error("Error al insertar en users_app:", insertError.message);
    } else {
      console.log("Usuario guardado correctamente en users_app");
    }

    Alert.alert("Account created");
    return data.session;
  } catch (error: any) {
    console.error(" Error en registro:", error.message);
    Alert.alert("Registration failed", error.message || "Please try again.");
    throw error;
  } finally {
    setLoading(false);
  }
};


  // 🔹 Login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error("Invalid credentials or user not found");

      return data.session;
    } catch (error: any) {
      console.error("Error en login:", error.message);
      Alert.alert("Login failed", error.message || "Invalid credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
    } catch (error: any) {
      Alert.alert("Error", "Could not log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
