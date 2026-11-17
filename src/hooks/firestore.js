import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Hook personalizado para gestionar el CRUD de tareas en Firestore en tiempo real.
 * @param {string} userId - El UID del usuario autenticado.
 */
export function useTareas(userId) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escucha en tiempo real (onSnapshot) solo las tareas del usuario logueado
  useEffect(() => {
    if (!userId) {
      setTareas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tareasRef = collection(db, "tareas");
    // Filtramos para que cada usuario solo reciba sus propias tareas
    const q = query(tareasRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Ordenamos las tareas en memoria por fecha de creación (las más recientes primero)
        docs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setTareas(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error al escuchar tareas:", err);
        setError("Error al cargar las tareas en tiempo real.");
        setLoading(false);
      }
    );

    // Limpia la suscripción en tiempo real cuando el componente se desmonta
    return () => unsubscribe();
  }, [userId]);

  // CREAR TAREA
  const crearTarea = async ({ titulo, descripcion }) => {
    if (!userId) throw new Error("Usuario no autenticado");
    setError(null);
    try {
      await addDoc(collection(db, "tareas"), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        completada: false,
        userId: userId,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error al crear tarea:", err);
      setError("No se pudo crear la tarea.");
      throw err;
    }
  };

  // EDITAR TAREA
  const editarTarea = async (id, { titulo, descripcion }) => {
    setError(null);
    try {
      const tareaRef = doc(db, "tareas", id);
      await updateDoc(tareaRef, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error al editar tarea:", err);
      setError("No se pudo actualizar la tarea.");
      throw err;
    }
  };

  // MARCAR COMO COMPLETADA / PENDIENTE
  const toggleCompletada = async (id, estadoActual) => {
    setError(null);
    try {
      const tareaRef = doc(db, "tareas", id);
      await updateDoc(tareaRef, {
        completada: !estadoActual
      });
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("No se pudo actualizar el estado de la tarea.");
      throw err;
    }
  };

  // ELIMINAR TAREA
  const eliminarTarea = async (id) => {
    setError(null);
    try {
      const tareaRef = doc(db, "tareas", id);
      await deleteDoc(tareaRef);
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
      setError("No se pudo eliminar la tarea.");
      throw err;
    }
  };

  return {
    tareas,
    loading,
    error,
    crearTarea,
    editarTarea,
    toggleCompletada,
    eliminarTarea
  };
}

