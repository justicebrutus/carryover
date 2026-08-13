import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadWorkspace, resetWorkspace, saveWorkspace } from "./lib/workspace";
import type { CarryoverWorkspaceV1, Role } from "./domain";
interface Value { workspace: CarryoverWorkspaceV1; recovered: boolean; update: (fn:(current:CarryoverWorkspaceV1)=>CarryoverWorkspaceV1)=>void; setRole:(role:Role)=>void; reset:()=>void; }
const Context=createContext<Value|null>(null);
export function WorkspaceProvider({children}:{children:React.ReactNode}) { const loaded=useMemo(()=>loadWorkspace(),[]); const [workspace,setWorkspace]=useState(loaded.workspace); const [recovered,setRecovered]=useState(loaded.recovered); useEffect(()=>saveWorkspace(workspace),[workspace]); const value:Value={workspace,recovered,update:(fn)=>setWorkspace(fn),setRole:(role)=>setWorkspace(current=>({...current,role})),reset:()=>{setWorkspace(resetWorkspace());setRecovered(false);}}; return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error("WorkspaceProvider missing");return value;}
