import { useEffect, useState } from 'react';
import { buscarClientes, crearCliente } from '../../api/posApi';

const inputClase =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600';

const NUEVO_VACIO = { nombre: '', nit: '', nrc: '' };

// Para el CCF: buscar un cliente por nombre o NIT, o registrarlo en el momento
function SelectorCliente({ cliente, onSeleccionar }) {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState([]);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState(NUEVO_VACIO);
  const [error, setError] = useState('');

  // Espera un momento después de escribir para no pedir en cada letra
  useEffect(() => {
    if (texto.trim().length < 2) return;

    let vigente = true;
    const espera = setTimeout(() => {
      buscarClientes(texto.trim())
        .then((lista) => vigente && setResultados(lista))
        .catch(() => vigente && setError('No se pudo buscar clientes'));
    }, 300);

    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [texto]);

  const visibles = texto.trim().length >= 2 ? resultados : [];

  const guardarNuevo = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const creado = await crearCliente(nuevo);
      onSeleccionar(creado);
      setCreando(false);
      setNuevo(NUEVO_VACIO);
      setTexto('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el cliente');
    }
  };

  if (cliente) {
    return (
      <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-2 text-sm">
        <div>
          <p className="font-medium">{cliente.nombre}</p>
          <p className="text-gray-600">NIT {cliente.nit} · NRC {cliente.nrc}</p>
        </div>
        <button type="button" onClick={() => onSeleccionar(null)} className="text-amber-800 underline">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!creando && (
        <>
          <input
            type="text"
            placeholder="Buscar cliente por nombre o NIT"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className={inputClase}
          />
          {visibles.length > 0 && (
            <ul className="max-h-36 overflow-y-auto rounded border border-gray-200 text-sm">
              {visibles.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSeleccionar(c)}
                    className="block w-full px-2 py-1 text-left hover:bg-amber-50"
                  >
                    {c.nombre} <span className="text-gray-500">· {c.nit}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => setCreando(true)} className="text-sm text-amber-800 underline">
            Registrar cliente nuevo
          </button>
        </>
      )}

      {creando && (
        <form onSubmit={guardarNuevo} className="space-y-2">
          <input required placeholder="Nombre o razón social" value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={inputClase} />
          <input required placeholder="NIT" value={nuevo.nit}
            onChange={(e) => setNuevo({ ...nuevo, nit: e.target.value })} className={inputClase} />
          <input required placeholder="NRC" value={nuevo.nrc}
            onChange={(e) => setNuevo({ ...nuevo, nrc: e.target.value })} className={inputClase} />
          <div className="flex gap-3 text-sm">
            <button type="submit" className="rounded bg-amber-700 px-3 py-1 text-white hover:bg-amber-800">
              Guardar
            </button>
            <button type="button" onClick={() => setCreando(false)} className="text-gray-600 underline">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SelectorCliente;