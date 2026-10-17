import { useEffect, useRef, useState } from "react";

export default function Tarea({ tarea, onEliminar, onToggle, onEditar }) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(tarea.titulo);
  const inputRef = useRef(null);
  const guardandoRef = useRef(false);
  const toggleTimerRef = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(toggleTimerRef.current);
    },
    []
  );

  function iniciarEdicion() {
    setTitulo(tarea.titulo);
    setEditando(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function guardarEdicion() {
    if (guardandoRef.current) return;
    const tituloLimpio = titulo.trim();
    if (!tituloLimpio) {
      setTitulo(tarea.titulo);
      setEditando(false);
      return;
    }

    setEditando(false);
    if (tituloLimpio !== tarea.titulo) {
      guardandoRef.current = true;
      await onEditar(tituloLimpio);
      guardandoRef.current = false;
    }
  }

  return (
    <li className={tarea.completada ? "tarea completada" : "tarea"}>
      {editando ? (
        <input
          ref={inputRef}
          className="input-editar"
          value={titulo}
          aria-label="Editar título de la tarea"
          onChange={(event) => setTitulo(event.target.value)}
          onBlur={guardarEdicion}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              guardandoRef.current = true;
              setTitulo(tarea.titulo);
              setEditando(false);
              requestAnimationFrame(() => {
                guardandoRef.current = false;
              });
            }
          }}
        />
      ) : (
        <span
          onClick={() => {
            clearTimeout(toggleTimerRef.current);
            toggleTimerRef.current = setTimeout(onToggle, 250);
          }}
          onDoubleClick={() => {
            clearTimeout(toggleTimerRef.current);
            iniciarEdicion();
          }}
          title="Clic para completar; doble clic para editar"
        >
          {tarea.titulo}
        </span>
      )}
      <button onClick={onEliminar} className="btn-eliminar" title="Eliminar">
        🗑️
      </button>
    </li>
  );
}
