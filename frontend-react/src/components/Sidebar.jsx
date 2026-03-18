export default function Sidebar() {
  const users = ["Alice", "Bob", "Charlie", "David"];

  return (
    <aside className="w-64 bg-black border-r border-yellow-400 p-4">
      <h2 className="text-yellow-400 font-bold mb-4">Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user} className="mb-2 p-2 rounded hover:bg-yellow-400 hover:text-black cursor-pointer">
            {user}
          </li>
        ))}
      </ul>
    </aside>
  );
}
