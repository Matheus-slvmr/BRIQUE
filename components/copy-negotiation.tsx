"use client";
import { useState } from "react";
export function CopyNegotiation({message}:{message:string}){const[copied,setCopied]=useState(false);return <div className="rounded-xl border border-[var(--border)] p-4"><p className="text-sm">{message}</p><button className="button secondary mt-3" type="button" onClick={async()=>{await navigator.clipboard.writeText(message);setCopied(true)}}>{copied?"Mensagem copiada":"Copiar mensagem"}</button></div>}
