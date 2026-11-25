import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getVentas } from '../../api/ventasApi';
import { getTurnoActual } from '../../api/cajaApi';
import { getAlertas } from '../../api/inventarioApi';
import { dinero } from '../../utils/formato';
import Icono from '../../components/Icono';
import { MODULOS } from '../../components/menuModulos';

function Indicador({ icono, titulo, valor, alerta = false }) {
  return (
    <div className={`rounded-2xl p-4 ${alerta ? 'bg-red-50' : 'bg-origen-100'}`}>
      <div className={`mb-2 flex items-center gap-2 text-sm ${alerta ? 'text-red-700' : 'text-origen-500'}`}>
        <Icono nombre={icono} tamano={20} />
        {titulo}
      </div>
      <p className={`text-2xl font-bold ${alerta ? 'text-red-700' : 'text-origen-950'}`}>{valor}</p>
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  // null = todavía no carga o el rol no tiene permiso para verlo
  const [datos, setDatos] = useState({ ventasHoy: null, totalHoy: null, alertas: null, turno: null });

  useEffect(() => {
    // El turno solo se pide si el rol tiene caja (al barista el backend le responde 403)
    const conCaja = ['ADMIN', 'GERENTE', 'CAJERO'].includes(usuario.rol);
    const turnoActual = conCaja ? getTurnoActual() : Promise.reject(new Error('sin caja'));
    Promise.allSettled([getVentas(), getAlertas(), turnoActual]).then(([ventas, alertas, turno]) => {
      const hoy = new Date().toDateString();
      const deHoy =
        ventas.status === 'fulfilled'
          ? ventas.value.filter((v) => v.estado === 'EMITIDA' && new Date(v.fecha).toDateString() === hoy)
          : null;

      setDatos({
        ventasHoy: deHoy ? deHoy.length : null,
        totalHoy: deHoy ? deHoy.reduce((suma, v) => suma + Number(v.total), 0) : null,
        alertas: alertas.status === 'fulfilled' ? alertas.value.length : null,
        turno: turno.status === 'fulfilled' ? (turno.value ? 'Abierto' : 'Cerrado') : null,
      });
    });
  }, [usuario.rol]);

  const accesos = MODULOS.filter((m) => m.to !== '/' && m.roles.includes(usuario.rol));
  const mostrar = (valor, formato = (v) => v) => (valor === null ? '—' : formato(valor));

  return (
    <div>
      <h1 className="text-2xl font-bold text-origen-950">Hola, {usuario.nombre}</h1>
      <p className="mb-6 text-gray-500">Resumen de {usuario.sucursal}</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador icono="receipt_long" titulo="Ventas de hoy" valor={mostrar(datos.ventasHoy)} />
        <Indicador icono="payments" titulo="Total vendido hoy" valor={mostrar(datos.totalHoy, dinero)} />
        <Indicador
          icono="warning"
          titulo="Alertas de stock"
          valor={mostrar(datos.alertas)}
          alerta={datos.alertas > 0}
        />
        <Indicador icono="lock_clock" titulo="Turno de caja" valor={mostrar(datos.turno)} />
      </div>

      {/* El barista no tiene módulos aparte del dashboard */}
      {accesos.length > 0 && (
        <h2 className="mb-3 text-lg font-semibold text-origen-950">Accesos rápidos</h2>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accesos.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-origen-700 hover:bg-origen-100/60"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-origen-700 text-origen-100">
              <Icono nombre={m.icono} tamano={26} />
            </div>
            <div>
              <p className="font-semibold text-origen-950">{m.texto}</p>
              <p className="text-sm text-gray-500">{m.descripcion}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}