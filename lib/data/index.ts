import { CRMData, Cliente, Conocimiento, Configuracion, Comando } from "@/lib/types";
import { mockData } from "./mock";
import {
  readCRMFromSheets,
  updateClienteEnSheets,
  createClienteEnSheets,
  deleteClienteEnSheets,
  createConocimientoEnSheets,
  updateConocimientoEnSheets,
  deleteConocimientoEnSheets,
  updateConfiguracionEnSheets,
  crearComandoEnSheets,
} from "./sheets";

export interface CRMRepository {
  getAll(): Promise<CRMData>;
  updateCliente(whatsapp: string, patch: Partial<Cliente>): Promise<Cliente>;
  deleteCliente(whatsapp: string): Promise<void>;
  createCliente(cliente: Cliente): Promise<Cliente>;
  updateConocimiento(id: string, patch: Partial<Conocimiento>): Promise<Conocimiento>;
  createConocimiento(item: Conocimiento): Promise<Conocimiento>;
  deleteConocimiento(id: string): Promise<void>;
  updateConfiguracion(patch: Partial<Configuracion>): Promise<Configuracion>;
  crearComando(tipo: string): Promise<Comando>;
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

  async updateConfiguracion(patch: Partial<Configuracion>) {
    this.data.configuracion = { ...this.data.configuracion, ...patch };
    return this.data.configuracion;
  }

  async crearComando(tipo: string) {
    const comando: Comando = { fila: -1, id: `C-${Date.now()}`, tipo, estado: "PENDIENTE", creado: new Date().toISOString(), resultado: "(demo: no hay bot real conectado en modo mock)" };
    this.data.comandos = [comando, ...this.data.comandos];
    return comando;
  }
}

class SheetsRepository implements CRMRepository {
  async getAll(): Promise<CRMData> { return readCRMFromSheets(); }
  async updateCliente(whatsapp: string, patch: Partial<Cliente>) { return updateClienteEnSheets(whatsapp, patch); }
  async createCliente(cliente: Cliente) { return createClienteEnSheets(cliente); }
  async deleteCliente(whatsapp: string) { return deleteClienteEnSheets(whatsapp); }
  async updateConocimiento(id: string, patch: Partial<Conocimiento>) { return updateConocimientoEnSheets(id, patch); }
  async createConocimiento(item: Conocimiento) { return createConocimientoEnSheets(item); }
  async deleteConocimiento(id: string) { return deleteConocimientoEnSheets(id); }
  async updateConfiguracion(patch: Partial<Configuracion>) { return updateConfiguracionEnSheets(patch); }
  async crearComando(tipo: string) { return crearComandoEnSheets(tipo); }
}

export function getCRMRepository(): CRMRepository {
  return process.env.DATA_SOURCE === "sheets"
    ? new SheetsRepository()
    : new MockRepository();
}
