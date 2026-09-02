"use client";
import { Moon } from "lucide-react";
export function ThemeToggle() { return <button className="p-2" aria-label="Alternar tema" title="Alternar tema" onClick={() => document.documentElement.classList.toggle("dark")}><Moon size={18}/></button>; }
