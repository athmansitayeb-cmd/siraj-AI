import { createContext, useContext, useEffect, useState } from "react";

const UIContext = createContext(null);

const DEFAULT_STATE = {
 mode: "marketing", // marketing | app | auth
 sidebarOpen: true,
 rightPanelOpen: false,
 activeWorkspace: "default",
 agentContext: null
};

export function UIProvider({ children }) {
const [state, setState] = useState(() => {
 try {
 const saved = localStorage.getItem("siraj_ui_state");
 return saved ? JSON.parse(saved) : DEFAULT_STATE;
 } catch (e) {
 localStorage.removeItem("siraj_ui_state");
 return DEFAULT_STATE;
 }
});

 const updateState = (patch) => {
 setState((prev) => {
 const next = { ...prev, ...patch };
 localStorage.setItem("siraj_ui_state", JSON.stringify(next));
 return next;
 });
 };

 const actions = {
 setMode: (mode) => updateState({ mode }),
 toggleSidebar: () =>
 updateState({ sidebarOpen: !state.sidebarOpen }),
 setSidebar: (v) => updateState({ sidebarOpen: v }),

 setRightPanel: (v) => updateState({ rightPanelOpen: v }),

 setWorkspace: (id) => updateState({ activeWorkspace: id }),

 setAgentContext: (ctx) => updateState({ agentContext: ctx }),
 };

 return (
 <UIContext.Provider value={{ state, actions }}>
 {children}
 </UIContext.Provider>
 );
}

export const useUI = () => useContext(UIContext);

