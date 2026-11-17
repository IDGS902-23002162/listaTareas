import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authentication";
import { useTareas } from "../hooks/firestore";
import ModalCrud from "./modalCrud";
import "./listaTareas.css";

export default function ListaTareas() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Obtenemos las tareas en tiempo real con onSnapshot filtradas por el usuario actual
  const {
    tareas,
    loading,
    error,
    crearTarea,
    editarTarea,
    toggleCompletada,
    eliminarTarea
  } = useTareas(user?.uid);

  // Switch para listar/organizar: pendientes arriba y completadas al fondo
  const [ordenarPorEstado, setOrdenarPorEstado] = useState(true);

  // Estado para controlar el modal CRUD (crear, editar y eliminar)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "crear", // "crear" | "editar" | "eliminar"
    task: null
  });

  const abrirModalCrear = () => {
    setModalConfig({ isOpen: true, type: "crear", task: null });
  };

  const abrirModalEditar = (task) => {
    setModalConfig({ isOpen: true, type: "editar", task });
  };

  const abrirModalEliminar = (task) => {
    setModalConfig({ isOpen: true, type: "eliminar", task });
  };

  const cerrarModal = () => {
    setModalConfig({ isOpen: false, type: "crear", task: null });
  };

  // Despachador de acciones que ejecuta el modal
  const handleModalConfirm = async (...args) => {
    if (modalConfig.type === "crear") {
      await crearTarea(args[0]);
    } else if (modalConfig.type === "editar") {
      await editarTarea(args[0], args[1]);
    } else if (modalConfig.type === "eliminar") {
      await eliminarTarea(args[0]);
    }
  };

  // Cambio directo de completada mediante el checkbox animado
  const handleToggleCheck = async (task) => {
    try {
      await toggleCompletada(task.id, task.completada);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error al salir:", err);
    }
  };

  // Cálculos métricos para la fracción tipográfica y barra de progreso
  const totalTareas = tareas.length;
  const completadas = tareas.filter((t) => t.completada).length;
  const pendientes = totalTareas - completadas;
  const porcentaje = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

  // Lista ordenada según el estado del switch
  const tareasMostradas = [...tareas].sort((a, b) => {
    if (!ordenarPorEstado) return 0; // Orden normal por fecha de creación
    // Si está activo el switch: no completadas van arriba (0), completadas van abajo (1)
    if (a.completada === b.completada) return 0;
    return a.completada ? 1 : -1;
  });

  return (
    <div className="tareas-page">
      {/* Barra de navegación superior */}
      <nav className="tareas-navbar">
        <div className="brand-section">
          <span className="material-icons brand-icon">checklist</span>
        </div>

        <div className="nav-actions">
          <span className="user-badge">
            <span className="material-icons user-icon">account_circle</span>
            {user?.displayName || user?.email}
          </span>
          <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
            <span className="material-icons" style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }}>logout</span>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="tareas-container">
        {/* Tarjeta de métricas: Fracción tipográfica + Barra de progreso editorial */}
        <section className="tareas-header-card">
          <div className="editorial-progress-section">
            <div className="editorial-top-row">
              <div className="fraction-text">
                <span className="num-completed">{completadas}</span>
                <span className="num-total">de {totalTareas}</span>
              </div>
              <span className="editorial-meta">
                completadas • {pendientes} {pendientes === 1 ? "pendiente" : "pendientes"}
              </span>
            </div>

            <div className="editorial-progress-track">
              <div
                className="editorial-progress-fill"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>

          {/* Controles: Switch de organización + Botón Nueva Tarea */}
          <div className="header-controls">
            <label className="switch-filter" title="Mover completadas hasta abajo">
              <span className="switch-wrapper">
                <input
                  type="checkbox"
                  checked={ordenarPorEstado}
                  onChange={(e) => setOrdenarPorEstado(e.target.checked)}
                />
                <span className="slider round"></span>
              </span>
              <span className="switch-label">Pendientes primero</span>
            </label>

            <button onClick={abrirModalCrear} className="btn-add-tarea">
              <span className="material-icons" style={{ fontSize: "18px" }}>add</span>
              Nueva Tarea
            </button>
          </div>
        </section>

        {/* Mensaje de error general si ocurre */}
        {error && <div className="modal-error-badge">{error}</div>}

        {/* Estado de carga */}
        {loading && (
          <div className="loading-state">
            <p>Cargando tus tareas en tiempo real...</p>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && tareas.length === 0 && (
          <div className="empty-state">
            <span className="material-icons empty-icon-mi">assignment_late</span>
            <h3>No tienes tareas pendientes</h3>
            <p>Empieza organizando tu día dando clic en "Nueva Tarea".</p>
          </div>
        )}

        {/* Listado de tareas en tiempo real */}
        {!loading && tareasMostradas.length > 0 && (
          <div className="tareas-list">
            {tareasMostradas.map((task) => (
              <article
                key={task.id}
                className={`tarea-card ${task.completada ? "is-completed" : ""}`}
              >
                <div className="tarea-left">
                  {/* Checkbox animado */}
                  <div className="checkbox-wrapper">
                    <input
                      id={`check-${task.id}`}
                      type="checkbox"
                      className="check"
                      checked={task.completada}
                      onChange={() => handleToggleCheck(task)}
                    />
                    <label htmlFor={`check-${task.id}`} className="label">
                      <svg width="24" height="24" viewBox="0 0 95 95">
                        <rect
                          x="15"
                          y="15"
                          width="65"
                          height="65"
                          rx="14"
                          fill="none"
                          stroke={task.completada ? "#40c057" : "#c7bdb4"}
                          strokeWidth="6"
                        />
                        <g>
                          <path
                            className="path1"
                            d="M25 50 L42 67 L75 32"
                            fill="none"
                            stroke="#40c057"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      </svg>
                    </label>
                  </div>

                  <div className="tarea-details">
                    <h3
                      className={`tarea-title ${task.completada ? "completed-text" : ""
                        }`}
                    >
                      {task.titulo}
                    </h3>
                    {task.descripcion && (
                      <p className="tarea-desc">{task.descripcion}</p>
                    )}
                  </div>
                </div>

                {/* Acciones de editar y eliminar mediante modal */}
                <div className="tarea-actions">
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(task)}
                    className="btn-icon-action"
                    title="Editar tarea"
                  >
                    <span className="material-icons btn-icon-symbol">edit</span>
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirModalEliminar(task)}
                    className="btn-icon-action btn-delete"
                    title="Eliminar tarea"
                  >
                    <span className="material-icons btn-icon-symbol">delete</span>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Modal CRUD reutilizable para crear, editar y eliminar */}
      <ModalCrud
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        task={modalConfig.task}
        onClose={cerrarModal}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
