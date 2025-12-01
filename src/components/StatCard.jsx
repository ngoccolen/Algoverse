export default function StatCard({ value, label }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow text-center">
      <div className="text-2xl font-bold text-indigo-600">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
