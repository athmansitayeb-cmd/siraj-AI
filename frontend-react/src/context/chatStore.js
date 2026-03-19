import { create } from "zustand";

export const useChatStore = create((set) => ({
  chats: [],
  currentChatId: null,

  // إنشاء محادثة جديدة
  createChat: () => set((state) => {
    const newChat = {
      _id: Date.now().toString(), // Sidebar يتوقع _id
      title: "New Chat",
      messages: []
    };
    return {
      chats: [newChat, ...state.chats],
      currentChatId: newChat._id
    };
  }),

  setCurrentChat: (id) => set({ currentChatId: id }),

  addMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map(chat =>
        chat._id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    })),

  // dummy fetchChats لتجنب الخطأ
  fetchChats: () => set((state) => ({ chats: state.chats }))
}));
