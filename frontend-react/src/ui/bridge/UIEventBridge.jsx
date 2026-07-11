import { useEffect } from "react";
import { uiBus } from "../../app/uiBus";
import { useUI } from "../context/UIContext";

export function UIEventBridge() {
 const ui = useUI();

 const actions = ui?.actions || {};

 useEffect(() => {
 const unsub1 = uiBus.on("layout:change", (layout) => {
 actions.setMode?.(layout);
 });

 const unsub2 = uiBus.on("ui:sidebar", (open) => {
 actions.setSidebar?.(open);
 });

 const unsub3 = uiBus.on("ui:rightPanel", (open) => {
 actions.setRightPanel?.(open);
 });

 return () => {
 unsub1?.();
 unsub2?.();
 unsub3?.();
 };
 }, [actions]);

 return null;
}
