import { EstadoParZapatos } from "./EstadoParZapatos";

export class ParZapatos {
  private id: number;
  private minutoLlegada: number;
  private estado: EstadoParZapatos;

  public constructor(id: number, minutoLlegada: number) {
    this.id = id;
    this.minutoLlegada = minutoLlegada;
  }

  public enReparacion(): void {
    this.estado = EstadoParZapatos.EN_REPARACION;
  }

  public esperandoReparacion(): void {
    this.estado = EstadoParZapatos.ESPERANDO_REPARACION;
  }

  public pausarReparacion(): void {
    this.estado = EstadoParZapatos.REPARACION_PAUSADA;
  }

  public terminarReparacion(): void {
    this.estado = EstadoParZapatos.LISTOS;
  }

  public estaPausadoEnReparacion(): boolean {
    return this.estado === EstadoParZapatos.REPARACION_PAUSADA;
  }

  public getEstado(): EstadoParZapatos {
    return this.estado;
  }

  public getId(): number {
    return this.id;
  }

  public getMinutoLlegada(): number {
    return this.minutoLlegada;
  }
}