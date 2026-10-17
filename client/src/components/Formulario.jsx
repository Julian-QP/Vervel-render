import { useState } from "react";

export default function Formulario({ onAgregar }) {
  const [titulo, setTitulo] = useState("");

  async function manejarEnvio(e) {
    e.preventDefault();
    const tituloLimpio = titulo.trim();
    if (!tituloLimpio) return;
    if (await onAgregar(tituloLimpio)) setTitulo("");
  }

  return (
    <form onSubmit={manejarEnvio} className="formulario">
      <input
        type="text"
        placeholder="Nueva tarea..."
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
}
