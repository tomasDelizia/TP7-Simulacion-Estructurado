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

  public terminarReparacion(): void {
    this.estado = EstadoParZapatos.LISTOS;
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