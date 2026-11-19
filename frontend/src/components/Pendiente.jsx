export default function Pendiente({ titulo }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
      <h1 className="text-xl font-semibold text-stone-700">{titulo}</h1>
      <p className="mt-2 text-sm text-gray-500">Módulo en desarrollo</p>
    </div>
  );
}