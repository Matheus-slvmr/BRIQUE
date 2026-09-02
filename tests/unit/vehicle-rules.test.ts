import { describe,expect,it } from "vitest";import { vehiclePurchaseLimit } from "@/lib/vehicle-rules";
describe("regras de veículos",()=>{it("limita carro a 80% da FIPE",()=>expect(vehiclePurchaseLimit("CARRO",5000000)).toBe(4000000));it("reserva R$ 3 mil em motos",()=>expect(vehiclePurchaseLimit("MOTO",1200000)).toBe(900000))})
