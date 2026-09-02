"use client";
export function PrintButton(){return <button className="button print:hidden" onClick={()=>window.print()}>Imprimir ou salvar em PDF</button>}
