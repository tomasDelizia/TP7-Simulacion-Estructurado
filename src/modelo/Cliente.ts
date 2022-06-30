import { EstadoCliente } from "./EstadoCliente";

export class Cliente {
  private id: number;
  private minutoLlegada: number;
  private estado: EstadoCliente;

  public constructor(id: number, minutoLlegada: number) {
    this.id = id;
    this.minutoLlegada = minutoLlegada;
  }

  public haciendoPedido(): void {
    this.estado = EstadoCliente.HACIENDO_PEDIDO;
  }

  public enEsperaPedido(): void {
    this.estado = EstadoCliente.ESPERANDO_HACER_PEDIDO;
  }

  public retirandoZapatos(): void {
    this.estado = EstadoCliente.RETIRANDO_ZAPATOS;
  }

  public enEsperaRetiro(): void {
    this.estado = EstadoCliente.ESPERANDO_RETIRO;
  }

  public estaSiendoAtendido(): boolean {
    return (this.estado === EstadoCliente.HACIENDO_PEDIDO || this.estado === EstadoCliente.RETIRANDO_ZAPATOS);
  }

  public getEstado(): EstadoCliente {
    return this.estado;
  }

  public getId(): number {
    return this.id;
  }

  public getMinutoLlegada(): number {
    return this.minutoLlegada;
  }
}