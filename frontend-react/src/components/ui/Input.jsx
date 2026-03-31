export default function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full p-3 rounded-xl border border-yellow-400 bg-black text-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none"
    />
  );
}
