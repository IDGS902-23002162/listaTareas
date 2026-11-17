import { createContext, useContext, useEffect, useState, createElement } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// 1. Contexto para compartir el estado de la sesión en toda la app
const AuthContext = createContext();

// 2. Hook personalizado useAuth para acceder fácilmente a la sesión
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// 3. AuthProvider que almacena el usuario y provee los métodos de login/registro
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escucha cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Registro con correo y contraseña
  const registerWithEmail = async (email, password) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(mapAuthError(err.code));
      throw err;
    }
  };

  // Inicio de sesión con correo y contraseña
  const loginWithEmail = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(mapAuthError(err.code));
      throw err;
    }
  };

  // Inicio de sesión con cuenta de Google
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      setError(mapAuthError(err.code));
      throw err;
    }
  };

  // Cierre de sesión
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Mensajes de error legibles
  const mapAuthError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Este correo ya está registrado. Intenta iniciar sesión.";
      case "auth/invalid-email":
        return "El formato de correo no es válido.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Correo o contraseña incorrectos.";
      case "auth/popup-closed-by-user":
        return "Ventana de Google cerrada antes de completar el inicio de sesión.";
      default:
        return "Ocurrió un error al procesar la solicitud. Intenta de nuevo.";
    }
  };

  const value = {
    user,
    loading,
    error,
    setError,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout
  };

  // Usamos createElement para no requerir sintaxis JSX dentro de un archivo .js
  return createElement(
    AuthContext.Provider,
    { value },
    !loading ? children : null
  );
};
