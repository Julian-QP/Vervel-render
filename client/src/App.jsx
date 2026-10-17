import { useEffect, useState } from "react";
import Formulario from "./components/Formulario.jsx";
import ListaTareas from "./components/ListaTareas.jsx";

const API = `${(import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "")}/api/tareas`;

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTareas();
  }, []);

  async function respuestaApi(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Ocurrio un error al guardar los cambios");
    }
    return res.status === 204 ? null : res.json();
  }

  async function cargarTareas() {
    try {
      setTareas(await respuestaApi(API));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function agregarTarea(titulo) {
    try {
      const nueva = await respuestaApi(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });
      setTareas((actuales) => [...actuales, nueva]);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function eliminarTarea(id) {
    try {
      await respuestaApi(`${API}/${id}`, { method: "DELETE" });
      setTareas((actuales) => actuales.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTarea(id) {
    const tarea = tareas.find((t) => t.id === id);
    if (!tarea) return;
    try {
      const actualizada = await respuestaApi(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completada: !tarea.completada }),
      });
      setTareas((actuales) =>
        actuales.map((actual) => (actual.id === id ? actualizada : actual))
      );
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function editarTarea(id, titulo) {
    try {
      const actualizada = await respuestaApi(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });
      setTareas((actuales) =>
        actuales.map((actual) => (actual.id === id ? actualizada : actual))
      );
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminarCompletadas() {
    const completadas = tareas.filter((tarea) => tarea.completada);
    for (const tarea of completadas) {
      try {
        await respuestaApi(`${API}/${tarea.id}`, { method: "DELETE" });
        setTareas((actuales) =>
          actuales.filter((actual) => actual.id !== tarea.id)
        );
      } catch (err) {
        setError(err.message);
        return;
      }
    }
    setError(null);
  }

  if (cargando) return <p className="estado">Cargando...</p>;

  const completadas = tareas.filter((tarea) => tarea.completada).length;
  return (
    <main className="contenedor">
      <h1>✅ Mis tareas</h1>
      {error && <p className="mensaje-error" role="alert">❌ {error}</p>}
      <Formulario onAgregar={agregarTarea} />
      <div className="resumen-tareas">
        <p>
          {completadas} de {tareas.length} tareas completadas
        </p>
        <button
          type="button"
          className="btn-eliminar-completadas"
          onClick={eliminarCompletadas}
          disabled={completadas === 0}
        >
          Eliminar completadas
        </button>
      </div>
      <ListaTareas
        tareas={tareas}
        onEliminar={eliminarTarea}
        onToggle={toggleTarea}
        onEditar={editarTarea}
      />
    </main>
  );
}
