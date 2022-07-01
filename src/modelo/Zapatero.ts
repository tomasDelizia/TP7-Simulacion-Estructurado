import { EstadoZapatero } from "./EstadoZapatero";

export class Zapatero {
  private estado: EstadoZapatero;
  private recibePedidos: boolean;

  constructor() {
    this.estado = EstadoZapatero.LIBRE;
    this.recibePedidos = true;
  }

  public detenerRecepcionPedidos(): void {
    this.recibePedidos = false;
  }

  public habilitarRecepcionPedidos(): void {
    this.recibePedidos = true;
  }

  public estaRecibiendoPedidos(): boolean {
    return this.recibePedidos;
  }

  public libre(): void {
    this.estado = EstadoZapatero.LIBRE;
  }

  public atendiendo(): void {
    this.estado = EstadoZapatero.ATENDIENDO;
  }

  public reparando(): void{
    this.estado = EstadoZapatero.REPARANDO;
  }

  public estaLibre(): boolean {
    return this.estado == EstadoZapatero.LIBRE;
  }

  public estaAtendiendo(): boolean {
    return this.estado == EstadoZapatero.ATENDIENDO;
  }

  public estaReparando(): boolean {
    return this.estado == EstadoZapatero.REPARANDO;
  }

  public estaParaAtender(): boolean {
    return this.estaLibre() || this.estaReparando();
  }

  public getEstado(): string {
    return EstadoZapatero[this.estado];
  }
}