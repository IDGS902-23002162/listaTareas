import { useState, useEffect } from "react";
import "./modalCrud.css";

/**
 * Modal reutilizable para las acciones CRUD (crear, editar y eliminar).
 */
export default function ModalCrud({ isOpen, type, task, onClose, onConfirm }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (task && type === "editar") {
      setTitulo(task.titulo || "");
      setDescripcion(task.descripcion || "");
    } else {
      setTitulo("");
      setDescripcion("");
    }
    setLocalError("");
    setSubmitting(false);
  }, [task, type, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((type === "crear" || type === "editar") && !titulo.trim()) {
      setLocalError("El título de la tarea es obligatorio.");
      return;
    }

    setSubmitting(true);
    setLocalError("");
    try {
      if (type === "crear") {
        await onConfirm({ titulo, descripcion });
      } else if (type === "editar") {
        await onConfirm(task.id, { titulo, descripcion });
      } else if (type === "eliminar") {
        await onConfirm(task.id);
      }
      onClose();
    } catch {
      setLocalError("Ocurrió un error al procesar la acción.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {type === "crear" && (
              <>
                <span className="material-icons modal-header-icon">add_task</span>
                Nueva Tarea
              </>
            )}
            {type === "editar" && (
              <>
                <span className="material-icons modal-header-icon">edit_note</span>
                Editar Tarea
              </>
            )}
            {type === "eliminar" && (
              <>
                <span className="material-icons modal-header-icon icon-danger">delete_forever</span>
                Eliminar Tarea
              </>
            )}
          </h3>
          <button className="modal-close-x" onClick={onClose} title="Cerrar">
            <span className="material-icons" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {localError && <div className="modal-error-badge">{localError}</div>}

        <form onSubmit={handleSubmit} className="modal-body">
          {(type === "crear" || type === "editar") && (
            <>
              <div className="modal-field">
                <label className="modal-label">Título de la tarea</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Entregar reporte de Base de Datos"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="modal-input"
                  autoFocus
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Descripción (opcional)</label>
                <textarea
                  rows="3"
                  placeholder="Detalles adicionales sobre lo que necesitas hacer..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="modal-textarea"
                />
              </div>
            </>
          )}

          {type === "eliminar" && (
            <div className="modal-confirm-msg">
              <p>
                ¿Estás seguro de que deseas eliminar permanentemente la tarea{" "}
                <strong>"{task?.titulo}"</strong>?
              </p>
              <p className="modal-warning-sub">Esta acción no se puede deshacer.</p>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`btn-modal-action ${type === "eliminar" ? "btn-danger" : "btn-primary"
                }`}
            >
              {submitting
                ? "Guardando..."
                : type === "crear"
                  ? "Crear Tarea"
                  : type === "editar"
                    ? "Guardar Cambios"
                    : "Sí, Eliminar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
