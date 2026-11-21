import { useRef, useState } from 'react';
import Icono from '../../components/Icono';
import { dinero, redondear } from '../../utils/formato';
import { MEDIOS_PAGO, resumenPagos } from '../../utils/pagos';

const ICONOS_MEDIO = {
  EFECTIVO: 'payments',
  TARJETA: 'credit_card',
  BITCOIN: 'currency_bitcoin',
  CHIVO_WALLET: 'account_balance_wallet',
};

const inputClase =
  'w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-origen-700 focus:outline-none focus:ring-2 focus:ring-origen-500 ' +
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

function CobroModal({ total, tipoDocumento, onCerrar, onConfirmar }) {
  // Arranca con todo en efectivo: es lo más común y se puede repartir después
  const [pagos, setPagos] = useState([{ id: 1, medio: 'EFECTIVO', monto: String(total), referencia: '' }]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const siguienteId = useRef(2);

  const resumen = resumenPagos(pagos, total);

  const agregarPago = () => {
    // Sugiere un medio que todavía no se esté usando
    const usados = pagos.map((p) => p.medio);
    const libre = MEDIOS_PAGO.find((m) => !usados.includes(m.valor)) ?? MEDIOS_PAGO[0];
    const monto = resumen.pendiente > 0 ? String(resumen.pendiente) : '';
    setPagos([...pagos, { id: siguienteId.current++, medio: libre.valor, monto, referencia: '' }]);
  };

  const cambiarPago = (id, campo, valor) =>
    setPagos(pagos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));

  const quitarPago = (id) => setPagos(pagos.filter((p) => p.id !== id));

  // Pone en esta fila lo que todavía falta por cobrar
  const completar = (id) =>
    setPagos(
      pagos.map((p) =>
        p.id === id ? { ...p, monto: String(redondear((Number(p.monto) || 0) + resumen.pendiente)) } : p
      )
    );

  const confirmar = async () => {
    setError('');
    setEnviando(true);
    try {
      await onConfirmar(resumen.pagosAEnviar, resumen.cambio);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la venta');
    } finally {
      setEnviando(false);
    }
  };

  const sobraSinEfectivo = resumen.exceso > 0 && resumen.cambio === 0;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-origen-950/50 p-4">
      <div className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-origen-950">
              Cobrar {tipoDocumento === 'CF' ? 'consumidor final' : 'CCF'}
            </h2>
            <p className="text-3xl font-bold text-origen-700">{dinero(total)}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={enviando}
            aria-label="Cancelar cobro"
            className="rounded-full p-1 text-gray-500 hover:bg-origen-100"
          >
            <Icono nombre="close" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <Icono nombre="error" tamano={20} />
            {error}
          </div>
        )}

        <div className="space-y-3">
          {pagos.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-origen-100 text-origen-700">
                  <Icono nombre={ICONOS_MEDIO[p.medio]} />
                </div>
                <select
                  value={p.medio}
                  onChange={(e) => cambiarPago(p.id, 'medio', e.target.value)}
                  className="rounded-xl border border-gray-300 px-2 py-2"
                >
                  {MEDIOS_PAGO.map((m) => (
                    <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Monto"
                  value={p.monto}
                  onChange={(e) => cambiarPago(p.id, 'monto', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className={inputClase}
                />
                {pagos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => quitarPago(p.id)}
                    aria-label="Quitar pago"
                    className="text-gray-400 hover:text-red-700"
                  >
                    <Icono nombre="delete" />
                  </button>
                )}
              </div>

              {p.medio !== 'EFECTIVO' && (
                <input
                  type="text"
                  placeholder="Referencia (voucher, hash o # de transacción)"
                  value={p.referencia}
                  onChange={(e) => cambiarPago(p.id, 'referencia', e.target.value)}
                  className={inputClase}
                />
              )}

              {resumen.pendiente > 0 && (
                <button
                  type="button"
                  onClick={() => completar(p.id)}
                  className="text-sm font-medium text-origen-700 underline"
                >
                  Poner lo que falta ({dinero(resumen.pendiente)})
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarPago}
          className="flex items-center gap-1 text-sm font-medium text-origen-700 hover:underline"
        >
          <Icono nombre="add_circle" tamano={20} />
          Agregar otro medio de pago
        </button>

        <div className="space-y-1 rounded-xl bg-origen-100 p-3">
          <div className="flex justify-between"><span>Pagado</span><span>{dinero(resumen.pagado)}</span></div>
          {resumen.pendiente > 0 && (
            <div className="flex justify-between font-semibold text-red-700">
              <span>Falta</span><span>{dinero(resumen.pendiente)}</span>
            </div>
          )}
          {resumen.cambio > 0 && (
            <div className="flex justify-between text-lg font-bold text-origen-700">
              <span>Cambio a entregar</span><span>{dinero(resumen.cambio)}</span>
            </div>
          )}
          {sobraSinEfectivo && (
            <p className="text-sm text-red-700">
              Los pagos pasan del total y el vuelto solo se puede dar de lo cobrado en efectivo.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={confirmar}
          disabled={!resumen.valido || enviando}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-origen-700 py-3 font-semibold text-white transition hover:bg-origen-950 disabled:opacity-50"
        >
          <Icono nombre="check_circle" />
          {enviando ? 'Registrando...' : 'Confirmar venta'}
        </button>
      </div>
    </div>
  );
}

export default CobroModal;