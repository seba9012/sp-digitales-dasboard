import { CRMData, Cliente, Conocimiento, VentaRevendedor } from "@/lib/types";
import { mockData } from "./mock";
import {
  readCRMFromSheets,
  createClienteEnSheets, updateClienteEnSheets, deleteClienteEnSheets,
  createVentaEnSheets, updateVentaEnSheets, deleteVentaEnSheets,
} from "./sheets";

export interface CRMRepository {
  getAll(): Promise<CRMData>;
  updateCliente?(whatsapp: string, patch: Partial<Cliente>): Promise<Cliente>;
  deleteCliente?(whatsapp: string): Promise<void>;
  createCliente?(cliente: Cliente): Promise<Cliente>;
  updateConocimiento?(id: string, patch: Partial<Conocimiento>): Promise<Conocimiento>;
  createConocimiento?(item: Conocimiento): Promise<Conocimiento>;
  deleteConocimiento?(id: string): Promise<void>;
  createVenta?(venta: VentaRevendedor): Promise<VentaRevendedor>;
  updateVenta?(filaVenta: number, patch: Partial<VentaRevendedor>): Promise<VentaRevendedor>;
  deleteVenta?(filaVenta: number): Promise<void>;
}

class MockRepository implements CRMRepository {
  private data = mockData;
  async getAll() { return this.data; }

  async updateCliente(whatsapp: string, patch: Partial<Cliente>) {
    const current = this.data.clientes.find(c => c.whatsapp === whatsapp);
    if (!current) throw new Error("Cliente no encontrado");
    Object.assign(current, patch);
    return current;
  }

  async deleteCliente(whatsapp: string) {
    this.data.clientes = this.data.clientes.filter(c => c.whatsapp !== whatsapp);
  }

  async createCliente(cliente: Cliente) {
    this.data.clientes.unshift(cliente);
    return cliente;
  }

  async updateConocimiento(id: string, patch: Partial<Conocimiento>) {
    const current = this.data.conocimiento.find(k => k.id === id);
    if (!current) throw new Error("Conocimiento no encontrado");
    Object.assign(current, patch);
    return current;
  }

  async createConocimiento(item: Conocimiento) {
    this.data.conocimiento.unshift(item);
    return item;
  }

  async deleteConocimiento(id: string) {
    this.data.conocimiento = this.data.conocimiento.filter(k => k.id !== id);
  }

  async createVenta(venta: VentaRevendedor) {
    const filaVenta = Math.max(1, ...this.data.ventasRevendedor.map(v => v.filaVenta ?? 1)) + 1;
    const nueva = { ...venta, filaVenta };
    this.data.ventasRevendedor.unshift(nueva);
    return nueva;
  }

  async updateVenta(filaVenta: number, patch: Partial<VentaRevendedor>) {
    const current = this.data.ventasRevendedor.find(v => v.filaVenta === filaVenta);
    if (!current) throw new Error("Venta no encontrada");
    Object.assign(current, patch);
    return current;
  }

  async deleteVenta(filaVenta: number) {
    this.data.ventasRevendedor = this.data.ventasRevendedor.filter(v => v.filaVenta !== filaVenta);
  }
}

class SheetsRepository implements CRMRepository {
  async getAll(): Promise<CRMData> { return readCRMFromSheets(); }
  async createCliente(cliente: Cliente) { return createClienteEnSheets(cliente); }
  async updateCliente(whatsapp: string, patch: Partial<Cliente>) { return updateClienteEnSheets(whatsapp, patch); }
  async deleteCliente(whatsapp: string) { return deleteClienteEnSheets(whatsapp); }
  async createVenta(venta: VentaRevendedor) { return createVentaEnSheets(venta); }
  async updateVenta(filaVenta: number, patch: Partial<VentaRevendedor>) { return updateVentaEnSheets(filaVenta, patch); }
  async deleteVenta(filaVenta: number) { return deleteVentaEnSheets(filaVenta); }
}

export function getCRMRepository(): CRMRepository {
  return process.env.DATA_SOURCE === "sheets"
    ? new SheetsRepository()
    : new MockRepository();
}
