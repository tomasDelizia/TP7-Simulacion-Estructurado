import { EstadoCliente } from "./EstadoCliente";

export class Cliente {
  private id: number;
  private tipoPasajero: string;
  private minutoLlegada: number;
  private estado: EstadoCliente;
  private _minutoLlegadaDeVentaAFacturacion: number;
  private _minutoLlegadaDeFacturacionAControl: number;
  private _minutoLlegadaDeChequeoBilleteAControl: number;
  private _minutoLlegadaDeControlAEmbarque: number;

  public get minutoLlegadaDeVentaAFacturacion() {
    return this._minutoLlegadaDeVentaAFacturacion;
  }

  public get minutoLlegadaDeFacturacionAControl() {
    return this._minutoLlegadaDeFacturacionAControl;
  }

  public get minutoLlegadaDeChequeoBilleteAControl() {
    return this._minutoLlegadaDeChequeoBilleteAControl;
  }

  public get minutoLlegadaDeControlAEmbarque() {
    return this._minutoLlegadaDeControlAEmbarque;
  }

  public set minutoLlegadaDeVentaAFacturacion(minuto: number) {
    this._minutoLlegadaDeVentaAFacturacion = minuto;
  }

  public set minutoLlegadaDeFacturacionAControl(minuto: number) {
    this._minutoLlegadaDeFacturacionAControl = minuto;
  }

  public set minutoLlegadaDeChequeoBilleteAControl(minuto: number) {
    this._minutoLlegadaDeChequeoBilleteAControl = minuto;
  }

  public set minutoLlegadaDeControlAEmbarque(minuto: number) {
    this._minutoLlegadaDeControlAEmbarque = minuto;
  }

  public constructor(id: number, tipoPasajero: string, minutoLlegada: number) {
    this.id = id;
    this.tipoPasajero = tipoPasajero;
    this.minutoLlegada = minutoLlegada;
    this._minutoLlegadaDeVentaAFacturacion = -1;
    this._minutoLlegadaDeFacturacionAControl = -1;
    this._minutoLlegadaDeChequeoBilleteAControl = -1;
    this._minutoLlegadaDeControlAEmbarque = -1;
  }

  public facturandoEquipaje(): void {
    this.estado = EstadoCliente.FACTURANDO_EQUIPAJE;
  }

  public enEsperaFacturacion(): void {
    this.estado = EstadoCliente.ESPERANDO_FACTURACION;
  }

  public enControlMetales(): void {
    this.estado = EstadoCliente.EN_CONTROL_METALES;
  }

  public enEsperaControlMetales(): void {
    this.estado = EstadoCliente.ESPERANDO_CONTROL;
  }

  public comprandoBillete(): void {
    this.estado = EstadoCliente.COMPRANDO_BILLETE;
  }

  public enEsperaCompraBillete(): void {
    this.estado = EstadoCliente.ESPERANDO_COMPRA_BILLETE;
  }

  public chequeandoBillete(): void {
    this.estado = EstadoCliente.CHEQUEANDO_BILLETE;
  }

  public enEsperaChequeoBilletes(): void {
    this.estado = EstadoCliente.ESPERANDO_CHEQUEO_BILLETE;
  }

  public pasandoDeVentaAFacturacion(): void {
    this.estado = EstadoCliente.PASANDO_DE_VENTA_A_FACTURACION;
  }

  public pasandoDeFacturacionAControl(): void {
    this.estado = EstadoCliente.PASANDO_DE_FACTURACION_A_CONTROL;
  }

  public pasandoDeChequeoAControl(): void {
    this.estado = EstadoCliente.PASANDO_DE_CHEQUEO_BILLETE_A_CONTROL;
  }

  public pasandoDeControlAEmbarque(): void {
    this.estado = EstadoCliente.PASANDO_DE_CONTROL_A_EMBARQUE;
  }

  public bloqueadoEnEntrada(): void {
    this.estado = EstadoCliente.BLOQUEADO_EN_ENTRADA;
  }

  public bloqueadoEnChequeo(): void {
    this.estado = EstadoCliente.BLOQUEADO_EN_CHEQUEO;
  }

  public getEstado(): EstadoCliente {
    return this.estado;
  }

  public getId(): number {
    return this.id;
  }

  public getTipoPasajero(): string {
    return this.tipoPasajero;
  }

  public getMinutoLlegada(): number {
    return this.minutoLlegada;
  }
}