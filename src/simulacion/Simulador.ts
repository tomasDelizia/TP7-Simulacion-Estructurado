import { Cliente } from "../modelo/Cliente";
import { Empleado } from "../modelo/Empleado";
import { TipoEvento } from "../modelo/TipoEvento";
import { ParZapatos } from "../modelo/ParZapatos";
import { Utils } from "../utils/Utils";
import { EstadoCliente } from "../modelo/EstadoCliente";

export class Simulador {
  private mediaLlegadasClientes: number;
  
  private tiempoAtencionClienteA: number;
  private tiempoAtencionClienteB: number;

  private tiempoReparacionZapatosA: number;
  private tiempoReparacionZapatosB: number;
  private tiempoSecado: number;

  private matrizEstado: string[][];

  private cantMaxPasajeros: number;

  private probObjetivosVisita: number[];

  public simular(
    cantEventos: number,
    eventoDesde: number,
    probRetiro: number,
    probPedido: number,
    mediaLlegadaClientes: number,
    tiempoAtencionClienteA: number, 
    tiempoAtencionClienteB: number,
    tiempoReparacionZapatosA: number,
    tiempoReparacionZapatosB: number,
    tiempoSecado: number
    ): void {
    this.mediaLlegadasClientes = mediaLlegadaClientes;
    this.tiempoAtencionClienteA = tiempoAtencionClienteA;
    this.tiempoAtencionClienteB = tiempoAtencionClienteB;
    this.tiempoReparacionZapatosA = tiempoReparacionZapatosA;
    this.tiempoReparacionZapatosB = tiempoReparacionZapatosB;
    this.tiempoSecado = tiempoSecado;
    this.probObjetivosVisita = [probRetiro, probPedido];
    this.matrizEstado = [];
    this.cantMaxPasajeros = 0;

    // Definimos el rango de filas que vamos a mostrar.
    let indiceHasta: number = eventoDesde + 399;
    if (indiceHasta > cantEventos - 1)
      indiceHasta = cantEventos;

    // Vector de estado de la iteración actual.
    let evento: string[] = [];

    let tipoEvento: TipoEvento;
    let reloj: number = 0;

    // Llegada de un cliente.
    let rndLlegada: number = -1;
    let tiempoEntreLlegadas: number = -1;
    let proximaLlegada: number = -1;

    // Atención de cliente.
    let rndObjetivoVisita: number = -1;
    let objetivoVisita: string = '';
    let rndAtencion: number = -1;
    let tiempoAtencion: number = -1;
    let finAtencion: number = -1;

    // Reparación de zapatos.
    let rndReparacion: number = -1;
    let tiempoReparacion: number = -1;
    tiempoSecado = -1;
    let finReparacion: number = -1;

    // Empleado.
    let empleado = new Empleado();
    let estaEnHorarioAtencion: boolean = true;
    let colaClientes: Cliente[] = [];
    let tiempoRemanenteReparacion: number = -1;
    let colaZapatosAReparar: ParZapatos[] = [];
    let colaZapatosListos: ParZapatos[] = [];

    // Clientes en el sistema.
    let clientesEnSistema: Cliente[] = [];

    // Par de zapatos en el sistema.
    let parZapatosEnSistema: ParZapatos[] = [];

    // Métricas.
    let acumuladorTiempoReparacion: number = 0;
    let cantZapatosReparados: number = 0;
    let totalClientes: number = 0;
    let totalParZapatos: number = 0;

    for (let i: number = 0; i < cantEventos; i++) {
      evento = [];
      // Determinamos el tipo de evento.
      if (i == 0) {
        tipoEvento = TipoEvento.INICIO_SIMULACION;
      }
      else if (i == cantEventos - 1) {
        tipoEvento = TipoEvento.FIN_SIMULACION;
      }
      else {
        let eventosCandidatos: number[] = [
          proximaLlegada,
          finAtencion,
          finReparacion
        ];
        reloj = Utils.getMenorMayorACero(eventosCandidatos);
        tipoEvento = this.getSiguienteEvento(eventosCandidatos);
      }

      switch (tipoEvento) {
        // Inicio de la simulación.
        case TipoEvento.INICIO_SIMULACION: {
          rndLlegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rndLlegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);
          break;
        }

        // Llegada de un cliente.
        case TipoEvento.LLEGADA_CLIENTE: {
          // Obtenemos el objetivo de la visita.
          rndObjetivoVisita = Math.random();
          objetivoVisita = this.getObjetivoVisita(rndObjetivoVisita);

          // Generamos la llegada del próximo cliente.
          rndLlegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rndLlegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);
          
          totalClientes++;

          // Creamos el objeto cliente.
          let cliente: Cliente = new Cliente(
            totalClientes,
            reloj
          );

          clientesEnSistema.push(cliente);

          switch (objetivoVisita) {
            // Llega un cliente que quiere retirar un par de zapatos reparados.
            case "Retiro": {
              if (empleado.estaLibre() || empleado.estaReparando()) {
                if (empleado.estaReparando()) {
                  // Cálculo del tiempo remanente de reparación.
                  tiempoRemanenteReparacion = finReparacion - reloj;
                  finReparacion = -1;
                }
                cliente.retirandoZapatos();
                empleado.atendiendo();
  
                // Generamos el tiempo de atención.
                rndAtencion = Math.random();
                tiempoAtencion = this.getTiempoAtencion(rndAtencion);
                finAtencion = (reloj + tiempoAtencion);
              }
              else {
                cliente.enEsperaRetiro();
                colaClientes.push(cliente);
              }
              break;
            }
  
            // Llega un cliente que quiere realizar un pedido de reparación de un par de zapato.
            case "Pedido": {
              if (empleado.estaLibre() || empleado.estaReparando()) {
                if (empleado.estaReparando()) {
                  // Cálculo del tiempo remanente de reparación.
                  tiempoRemanenteReparacion = finReparacion - reloj;
                  finReparacion = -1;
                }
                cliente.haciendoPedido();
                empleado.atendiendo();
  
                // Generamos el tiempo de atención.
                rndAtencion = Math.random();
                tiempoAtencion = this.getTiempoAtencion(rndAtencion);
                finAtencion = (reloj + tiempoAtencion);
              }
              else {
                cliente.enEsperaPedido();
                colaClientes.push(cliente);
              }
              break;
            }
          }
          break;
        }

        // Fin de atención de cliente.
        case TipoEvento.FIN_ATENCION: {
          finAtencion = -1;

          // Buscamos el cliente atendido.
          let clienteAtendido: Cliente = clientesEnSistema.find(cliente => cliente.estaSiendoAtendido());

          switch (clienteAtendido.getEstado()) {
            case (EstadoCliente.RETIRANDO_ZAPATOS): {
              break;
            }
            case (EstadoCliente.HACIENDO_PEDIDO): {
              break;
            }
          }

          // Verificamos si había un par de zapatos siendo reparado antes de que llegue el cliente.
          let parZapatosEnPausa: ParZapatos = parZapatosEnSistema.find(parZapatos => parZapatos.estaPausadoEnReparacion());

          // Se genera el tiempo que tardará el pasajero atendido en pasar a la zona de control de metales.
          rndPaseEntreFacturacionYControl = Math.random();
          tiempoPaseEntreFacturacionYControl = this.getTiempoPasoEntreZonas(rndPaseEntreFacturacionYControl);
          finPaseEntreFacturacionYControl = (reloj + tiempoPaseEntreFacturacionYControl);
          
          clienteAtendido.pasandoDeFacturacionAControl();
          clienteAtendido.minutoLlegadaDeFacturacionAControl = finPaseEntreFacturacionYControl;
          // Preguntamos si hay alguien en la cola.
          if (colaClientes.length === 0) {
            empleado.libre();
          }
          else {
            // El servidor pasa de ocupado a ocupado.
            empleado.ocupado();
            // Quitamos a un pasajero de la cola y cambiamos su estado.
            colaClientes.shift().facturandoEquipaje();
            // Generamos el tiempo de facturación.
            rndAtencion = Math.random();
            tiempoAtencion = this.getTiempoReparacion(rndAtencion);
            finAtencion = (reloj + tiempoAtencion);
          }
          break;


        // // Fin de reparación de un par de zapatos.
        // case TipoEvento.FIN_REPARACION: {
        //   finReparacion = -1;
        //   // Se genera el tiempo que tardará el pasajero atendido en pasar a la ventanilla de facturación.
        //   rndPaseEntreVentaYFacturacion = Math.random();
        //   tiempoPaseEntreVentaYFacturacion = this.getTiempoPasoEntreZonas(rndPaseEntreVentaYFacturacion);
        //   finPaseEntreVentaYFacturacion = (reloj + tiempoPaseEntreVentaYFacturacion);
        //   // Buscamos el pasajero atendido y le cambiamos el estado.
        //   let pasajeroAtendido: Pasajero = clientesEnSistema.find(pasajero => pasajero.getEstado() === // EstadoPasajero.COMPRANDO_BILLETE);
        //   pasajeroAtendido.pasandoDeVentaAFacturacion();
        //   pasajeroAtendido.minutoLlegadaDeVentaAFacturacion = finPaseEntreVentaYFacturacion;
        //   // Preguntamos si hay alguien en la cola.
        //   if (colaVentaBillete.length === 0) {
        //     empleadoVentaBillete.libre();
        //   }
        //   else {
        //     empleadoVentaBillete.ocupado();
        //     // Quitamos a un pasajero de la cola y cambiamos su estado.
        //     colaVentaBillete.shift().comprandoBillete();
        //     // Generamos el tiempo de venta de billete.
        //     rndReparacion = Math.random();
        //     tiempoReparacion = this.getTiempoVentaBillete(rndReparacion);
        //     finReparacion = (reloj + tiempoReparacion);
        //   }
        //   break;
        // }

        // Fin de recepción pedidos.
        case TipoEvento.FIN_RECEPCION_PEDIDOS: {
          break;
        }

        // Fin de recepción pedidos.
        case TipoEvento.INICIO_RECEPCION_PEDIDOS: {
          break;
        }

        // Fin de simulación.
        case TipoEvento.FIN_SIMULACION: {
          // Calculamos el tiempo de permanencia en el sistema de los pasajeros que quedaron en el sistema.
          for (let i: number = 0; i < clientesEnSistema.length; i++) {
            acumuladorTiempoReparacion += reloj - clientesEnSistema[i].getMinutoLlegada();
          }
          break;
        }
      }

      // Cargamos la matriz de estado a mostrar solo para el rango pasado por parámetro.
      if ((i >= eventoDesde && i <= indiceHasta) || i == cantEventos-1) {
        evento.push(
          i.toString(),
          TipoEvento[tipoEvento],
          reloj.toFixed(4),
    
          rndLlegada.toFixed(4),
          tiempoEntreLlegadas.toFixed(4),
          proximaLlegada.toFixed(4),

          rndObjetivoVisita.toFixed(4),
          objetivoVisita,
          rndAtencion.toFixed(4),
          tiempoAtencion.toFixed(4),
          finAtencion.toFixed(4),
    
          rndReparacion.toFixed(4),
          tiempoReparacion.toFixed(4),
          tiempoSecado.toFixed(4),
          finReparacion.toFixed(4),
    
          empleado.getEstado(),
          colaClientes.length.toString(),
          tiempoRemanenteReparacion.toFixed(4),
          colaZapatosAReparar.length.toString(),
          colaZapatosListos.length.toString(),
    
          acumuladorTiempoReparacion.toFixed(4),
          cantZapatosReparados.toString()
        );
    
        for (let i: number = 0; i < clientesEnSistema.length; i++) {
          evento.push(
            clientesEnSistema[i].getId().toString(),
            EstadoCliente[clientesEnSistema[i].getEstado()],
            clientesEnSistema[i].getMinutoLlegada().toFixed(4),
          );
        }

        for (let i: number = 0; i < parZapatosEnSistema.length; i++) {
          evento.push(
            parZapatosEnSistema[i].getId().toString(),
            EstadoCliente[clientesEnSistema[i].getEstado()],
            clientesEnSistema[i].getMinutoLlegada().toFixed(4),
          );
        }

        this.matrizEstado.push(evento);

        // Actualizamos la cantidad de pasajeros máximos que hubo en el sistema.
        if (clientesEnSistema.length > this.cantMaxPasajeros)
          this.cantMaxPasajeros = clientesEnSistema.length;
      }

      // Reseteamos algunas variables.
      rndLlegada = -1;
      tiempoEntreLlegadas = -1;
      rndObjetivoVisita = -1;
      objetivoVisita = "";
      rndAtencion = -1;
      tiempoAtencion = -1;
      rndReparacion = -1;
      tiempoReparacion = -1;
      tiempoSecado = -1;
    }
  }
  
  // Método que devuelve el evento que sigue, dados los tiempos de los eventos candidatos.
  public getSiguienteEvento(tiemposEventos: number[]): TipoEvento {
    let menor: number = Utils.getMenorMayorACero(tiemposEventos);
    for (let i: number = 0; i < tiemposEventos.length; i++) {
      if (tiemposEventos[i] === menor) return TipoEvento[TipoEvento[i+1]];
    }
    return -1;
  }

  public getMatrizEstado(): string[][] {
      return this.matrizEstado;
  }

  public getCantMaxPasajerosEnSistema(): number {
    return this.cantMaxPasajeros;
  }

  // Cálculo del tiempo entre llegadas, que tiene distribución exponencial.
  public getTiempoEntreLlegadas(rndLlegada: number): number {
    let tiempo: number = Utils.getDistribucionExponencial(rndLlegada, this.mediaLlegadasClientes);
    return tiempo;
  }

  // Obtención del objetivo de la visita del cliente, según la probabilidad asociada.
  public getObjetivoVisita(rndObjetivo: number): string {
    if (rndObjetivo < this.probObjetivosVisita[0]) return "Retiro";
    return "Pedido";
  }

  // Cálculo del tiempo de atención de cliente, que tiene distribución uniforme.
  public getTiempoAtencion(rndAtencion: number): number {
    let tiempo: number = Utils.getDistribucionUniforme(rndAtencion, this.tiempoAtencionClienteA, this.tiempoAtencionClienteB);
    return tiempo;
  }

  // Cálculo del tiempo de atención de cliente, que tiene distribución uniforme.
  public getTiempoReparacion(rndReparacion: number): number {
    let tiempo: number = Utils.getDistribucionUniforme(rndReparacion, this.tiempoReparacionZapatosA, this.tiempoReparacionZapatosB);
    return tiempo;
  }
}