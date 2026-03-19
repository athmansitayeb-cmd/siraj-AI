import { useEffect } from "react";
import { useChatStore } from "../context/chatStore";

export default function Sidebar() {
  const { chats, fetchChats, createChat, currentChatId, setCurrentChat } = useChatStore();

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <aside className="w-64 p-4 border-r border-white/10 hidden md:flex flex-col">

      <button onClick={createChat} className="btn mb-4">
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map(chat => (
          <div
            key={chat._id}
            onClick={() => setCurrentChat(chat._id)}
            className={`p-2 rounded cursor-pointer text-sm ${
              currentChatId === chat._id
                ? "bg-primary text-black"
                : "hover:bg-white/10"
            }`}
          >
            {chat.title}
          </div>
        ))}
      </div>

    </aside>
  );
}
