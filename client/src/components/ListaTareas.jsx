import Tarea from "./Tarea.jsx";

export default function ListaTareas({ tareas, onEliminar, onToggle, onEditar }) {
  if (tareas.length === 0) {
    return <p className="vacio">No hay tareas. Agrega una 🎉</p>;
  }

  return (
    <ul className="lista">
      {tareas.map((t) => (
        <Tarea
          key={t.id}
          tarea={t}
          onEliminar={() => onEliminar(t.id)}
          onToggle={() => onToggle(t.id)}
          onEditar={(titulo) => onEditar(t.id, titulo)}
        />
      ))}
    </ul>
  );
}
