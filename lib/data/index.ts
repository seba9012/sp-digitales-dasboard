import { CRMData, Cliente, Conocimiento } from "@/lib/types";
import { mockData } from "./mock";
import { readCRMFromSheets } from "./sheets";

export interface CRMRepository {
  getAll(): Promise<CRMData>;
  updateCliente?(whatsapp: string, patch: Partial<Cliente>): Promise<Cliente>;
  deleteCliente?(whatsapp: string): Promise<void>;
  createCliente?(cliente: Cliente): Promise<Cliente>;
  updateConocimiento?(id: string, patch: Partial<Conocimiento>): Promise<Conocimiento>;
  createConocimiento?(item: Conocimiento): Promise<Conocimiento>;
  deleteConocimiento?(id: string): Promise<void>;
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
}

class SheetsRepository implements CRMRepository {
  async getAll(): Promise<CRMData> { return readCRMFromSheets(); }
}

export function getCRMRepository(): CRMRepository {
  return process.env.DATA_SOURCE === "sheets"
    ? new SheetsRepository()
    : new MockRepository();
}
