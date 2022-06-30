import { EstadoEmpleado } from "./EstadoEmpleado";

export class Empleado {
  private estado: EstadoEmpleado;

  constructor() {
    this.estado = EstadoEmpleado.LIBRE;
  }

  public libre(): void {
    this.estado = EstadoEmpleado.LIBRE;
  }

  public atendiendo(): void {
    this.estado = EstadoEmpleado.ATENDIENDO;
  }

  public reparando(): void{
    this.estado = EstadoEmpleado.REPARANDO;
  }

  public estaLibre(): boolean {
    return this.estado == EstadoEmpleado.LIBRE;
  }

  public estaAtendiendo(): boolean {
    return this.estado == EstadoEmpleado.ATENDIENDO;
  }

  public estaReparando(): boolean {
    return this.estado == EstadoEmpleado.REPARANDO;
  }

  public getEstado(): string {
    return EstadoEmpleado[this.estado];
  }
}