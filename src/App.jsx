import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/authentication";
import Login from "./components/login";
import ListaTareas from "./components/listaTareas";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/tareas"
            element={
              <ProtectedRoute>
                <ListaTareas />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/tareas" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
