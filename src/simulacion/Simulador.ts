import { Cliente } from "../modelo/Cliente";
import { Zapatero } from "../modelo/Zapatero";
import { TipoEvento } from "../modelo/TipoEvento";
import { ParZapatos } from "../modelo/ParZapatos";
import { Utils } from "../utils/Utils";
import { EstadoCliente } from "../modelo/EstadoCliente";
import { EstadoParZapatos } from "../modelo/EstadoParZapatos";

export class Simulador {
  private mediaLlegadasClientes: number;
  
  private tiempoAtencionClienteA: number;
  private tiempoAtencionClienteB: number;

  private tiempoReparacionZapatosA: number;
  private tiempoReparacionZapatosB: number;
  private tiempoSecado: number;

  private matrizEstado: string[][];

  private cantMaxClientes: number;
  private cantMaxParZapatos: number;
  
  private probObjetivosVisita: number[];

  private limiteColumnasCliente: number = 15;

  private tiempoPromedioReparacion: number = 0;
  private cantMaxZapatosEnColaReparacion: number = 0;
  private tiempoPromedioAtencion: number = 0;
  private porcentajeClientesRechazados: number = 0;

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
    this.cantMaxClientes = 0;
    this.cantMaxParZapatos = 0;

    // Definimos el rango de filas que vamos a mostrar.
    let indiceHasta: number = eventoDesde + 399;
    if (indiceHasta > cantEventos - 1)
      indiceHasta = cantEventos;

    // Vector de estado de la iteración actual.
    let evento: string[] = [];

    let tipoEvento: TipoEvento;
    let reloj: number = 0;
    let dia: number = 1;

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
    let zapatero = new Zapatero();
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
    let cantMaxZapatosEnColaReparacion: number = 0;
    let acumuladorTiempoAtencion: number = 0;
    let cantClientesAtendidos: number = 0;
    let cantClientesRechazados: number = 0;
    let cantClientesIngresados: number = 0;
    let cantZapatosIngresados: number = 0;

    for (let i: number = 0; i < cantEventos; i++) {
      evento = [];
      // Determinamos el tipo de evento.
      if (i == 0) tipoEvento = TipoEvento.INICIO_SIMULACION;
      else if (i == cantEventos - 1) tipoEvento = TipoEvento.FIN_SIMULACION;
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
          // Cálculo de la próxima llegada.
          rndLlegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rndLlegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);

          // Carga de condiciones iniciales.
          for (let i: number = 1; i <= 10; i++) {
            cantZapatosIngresados++;
            let parZapatosReparados: ParZapatos = new ParZapatos(i, -1);
            parZapatosReparados.terminarReparacion();
            parZapatosEnSistema.push(parZapatosReparados);
            colaZapatosListos.push(parZapatosReparados);
          }
          break;
        }

        // Llegada de un cliente.
        case TipoEvento.LLEGADA_CLIENTE: {
          // Generamos la llegada del próximo cliente.
          rndLlegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rndLlegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);
          
          // Obtenemos el objetivo de la visita.
          rndObjetivoVisita = Math.random();
          objetivoVisita = this.getObjetivoVisita(rndObjetivoVisita);
          
          // Actualizamos contador de pacientes que alguna vez ingresaron al sistema.
          cantClientesIngresados++;

          // Creamos el objeto cliente.
          let cliente: Cliente = new Cliente(cantClientesIngresados, reloj);
          clientesEnSistema.push(cliente);

          switch (objetivoVisita) {
            // Llega un cliente que quiere retirar un par de zapatos reparados.
            case "Retiro": {
              // Preguntamos si el zapatero está libre o reparando.
              if (zapatero.estaParaAtender()) {
                // Preguntamos si hay zapatos listos para retirar.
                if (colaZapatosListos.length > 0) {
                  // Si estaba reparando, deja la reparación pendiente y atiende al cliente.
                  if (zapatero.estaReparando()) {
                    // Cálculo del tiempo remanente de reparación.
                    tiempoRemanenteReparacion = finReparacion - reloj;
                    finReparacion = -1;

                    // Buscamos el par de zapatos que estaba siendo reparado, y actualizamos su estado.
                    let parZapatosAPausar: ParZapatos = parZapatosEnSistema.find(parZapatos => parZapatos.estaEnReparacion());
                    parZapatosAPausar.pausarReparacion();
                  }
                  cliente.retirandoZapatos();
                  zapatero.atendiendo();
      
                  // Generamos el tiempo de atención.
                  rndAtencion = Math.random();
                  tiempoAtencion = this.getTiempoAtencion(rndAtencion);
                  finAtencion = reloj + tiempoAtencion;
                }
                // No hay zapatos listos para retirar, se va.
                else {
                  cantClientesRechazados++;
                  clientesEnSistema.pop();
                }
              }
              // Si estaba atendiendo otro cliente, va a la cola.
              else {
                cliente.enEsperaRetiro();
                colaClientes.push(cliente);
              }
              break;
            }
  
            // Llega un cliente que quiere realizar un pedido de reparación de un par de zapatos.
            case "Pedido": {
              // Preguntamos si el zapatero está libre o reparando.
              if (zapatero.estaParaAtender()) {
                // Si estaba reparando, deja la reparación pendiente y atiende al cliente.
                if (zapatero.estaReparando()) {
                  // Cálculo del tiempo remanente de reparación.
                  tiempoRemanenteReparacion = finReparacion - reloj;
                  finReparacion = -1;

                  // Buscamos el par de zapatos que estaba siendo reparado, y actualizamos su estado.
                  let parZapatosAPausar: ParZapatos = parZapatosEnSistema.find(parZapatos => parZapatos.estaEnReparacion());
                  parZapatosAPausar.pausarReparacion();
                }
                cliente.haciendoPedido();
                zapatero.atendiendo();
  
                // Generamos el tiempo de atención.
                rndAtencion = Math.random();
                tiempoAtencion = this.getTiempoAtencion(rndAtencion);
                finAtencion = reloj + tiempoAtencion;
              }
              // Si estaba atendiendo otro cliente, va a la cola.
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
          let indiceClienteAtendido: number = clientesEnSistema.findIndex(cliente => cliente.estaSiendoAtendido());
          let clienteAtendido: Cliente = clientesEnSistema[indiceClienteAtendido];

          // Actualizamos el contador de clientes atendidos con éxito y el acumulador de tiempo de atención.
          cantClientesAtendidos++;
          acumuladorTiempoAtencion += reloj - clienteAtendido.getMinutoLlegada();

          switch (clienteAtendido.getEstado()) {
            // El cliente siendo atendido estaba retirando un par de zapatos.
            case (EstadoCliente.RETIRANDO_ZAPATOS): {
              // Quitamos un par de zapatos listos de la cola y del sistema.
              let parZapatosARetirar: ParZapatos = colaZapatosListos.shift();
              let indiceZapatos: number = parZapatosEnSistema.findIndex(parZapatos => parZapatos === parZapatosARetirar);
              parZapatosEnSistema.splice(indiceZapatos, 1);
              break;
            }
            // El cliente siendo atendido estaba haciendo un pedido de reparación.
            case (EstadoCliente.HACIENDO_PEDIDO): {
              // Ingresa un nuevo par de zapatos al sistema.
              cantZapatosIngresados++;
              let nuevoParZapatos: ParZapatos = new ParZapatos(cantZapatosIngresados, reloj);
              nuevoParZapatos.esperandoReparacion();
              parZapatosEnSistema.push(nuevoParZapatos);
              colaZapatosAReparar.push(nuevoParZapatos);
              break;
            }
          }

          // Eliminamos al cliente atendido del sistema.
          clientesEnSistema.splice(indiceClienteAtendido, 1);

          // Preguntamos si no hay nadie en la cola.
          if (colaClientes.length === 0) {
            // Verificamos si había un par de zapatos siendo reparado antes de que llegara el cliente.
            let parZapatosEnPausa: ParZapatos = parZapatosEnSistema.find(parZapatos => parZapatos.estaPausadoEnReparacion());
            // Si existe, reaunudamos la reparación.
            if (parZapatosEnPausa != null) {
              finReparacion = reloj + tiempoRemanenteReparacion;
              tiempoRemanenteReparacion = -1;
              parZapatosEnPausa.enReparacion();
              zapatero.reparando();
            }
            else {
              // Si no, preguntamos si hay zapatos por reparar.
              if (colaZapatosAReparar.length === 0) zapatero.libre();
              else {
                // Quitamos un par de zapatos de la cola y cambiamos su estado.
                colaZapatosAReparar.shift().enReparacion();
                zapatero.reparando();
                // Calculamos el tiempo de reparación.
                rndReparacion = Math.random();
                tiempoReparacion = this.getTiempoReparacion(rndReparacion);
                tiempoSecado = this.tiempoSecado;
                finReparacion = reloj + tiempoReparacion + tiempoSecado;
              }
            } 
          }
          // Hay clientes en la cola para atender aún.
          else {
            // El zapatero pasa de ocupado a ocupado.
            zapatero.atendiendo();
            // Quitamos un cliente de la cola y cambiamos su estado, según su estado actual.
            let clientePorAtender: Cliente = colaClientes.shift();
            switch (clientePorAtender.getEstado()) {
              // El cliente estaba esperando retirar un par de zapatos.
              case (EstadoCliente.ESPERANDO_RETIRO): {
                // Preguntamos si hay zapatos listos para retirar.
                if (colaZapatosListos.length > 0) {
                  clientePorAtender.retirandoZapatos();
      
                  // Generamos el tiempo de atención.
                  rndAtencion = Math.random();
                  tiempoAtencion = this.getTiempoAtencion(rndAtencion);
                  finAtencion = reloj + tiempoAtencion;
                }
                // No hay zapatos listos para retirar, se va.
                else {
                  cantClientesRechazados++;
                  let indiceClienteAEliminar: number = clientesEnSistema.findIndex(cliente => cliente === clientePorAtender);
                  clientesEnSistema.splice(indiceClienteAEliminar, 1);
                }
                break;
              }
              // El cliente estaba esperando hacer un pedido de zapatos.
              case (EstadoCliente.ESPERANDO_HACER_PEDIDO): {
                clientePorAtender.haciendoPedido();
  
                // Generamos el tiempo de atención.
                rndAtencion = Math.random();
                tiempoAtencion = this.getTiempoAtencion(rndAtencion);
                finAtencion = reloj + tiempoAtencion;
                break;
              }
            }
          }
          break;
        }

        // Fin de reparación de un par de zapatos.
        case TipoEvento.FIN_REPARACION: {
          finReparacion = -1;
    
          // Buscamos el par de zapatos que estaba en reparación, le cambiamos el estado y lo agregamos a la cola de zapatos listos para retirar.
          let indiceParZapatosReparado: number = parZapatosEnSistema.findIndex(parZapatos => parZapatos.estaEnReparacion());
          let parZapatosReparado: ParZapatos = parZapatosEnSistema[indiceParZapatosReparado];
          parZapatosReparado.terminarReparacion();
          colaZapatosListos.push(parZapatosReparado);

          // Actualizamos el acumulador de tiempo de reparación de zapatos y el contador de zapatos reparados (ignoramos los primeros 10).
          if (parZapatosReparado.getId() > 10) {
            acumuladorTiempoReparacion += reloj - parZapatosReparado.getMinutoLlegada();
            cantZapatosReparados++;
          }

          // Preguntamos si hay zapatos por reparar
          if (colaZapatosAReparar.length === 0) zapatero.libre();
          else {
            // Quitamos un par de zapatos de la cola y cambiamos su estado.
            colaZapatosAReparar.shift().enReparacion();
            zapatero.reparando();
            // Calculamos el tiempo de reparación.
            rndReparacion = Math.random();
            tiempoReparacion = this.getTiempoReparacion(rndReparacion);
            tiempoSecado = this.tiempoSecado;
            finReparacion = reloj + tiempoReparacion + tiempoSecado;
          }

          break;
        }

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
          // Acumulamos los tiempos de atención para los clientes que quedaron en el sistema.
          //for (let i: number = 0; i < clientesEnSistema.length; i++) {
          //  acumuladorTiempoReparacion += reloj - clientesEnSistema[i].getMinutoLlegada();
          //}
          // Acumulamos los tiempos de reparación para los zapatos que quedaron en el sistema.
          break;
        }
      }

      // Comparamos la cantidad de zapatos en la cola de la iteración actual con la cantidad máxima.
      cantMaxZapatosEnColaReparacion = Math.max(colaZapatosAReparar.length, cantMaxZapatosEnColaReparacion);

      // Cargamos la matriz de estado a mostrar solo para el rango pasado por parámetro.
      if ((i >= eventoDesde && i <= indiceHasta) || i == cantEventos-1) {
        evento.push(
          i.toString(),
          TipoEvento[tipoEvento],
          dia.toString(),
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
    
          zapatero.getEstado(),
          colaClientes.length.toString(),
          tiempoRemanenteReparacion.toFixed(4),
          colaZapatosAReparar.length.toString(),
          colaZapatosListos.length.toString(),
    
          acumuladorTiempoReparacion.toFixed(4),
          cantZapatosReparados.toString(),
          cantMaxZapatosEnColaReparacion.toString(),
          acumuladorTiempoAtencion.toFixed(4),
          cantClientesAtendidos.toString(),
          cantClientesRechazados.toString()
        );

        for (let i: number = 0; i < clientesEnSistema.length; i++) {
          evento.push(
            clientesEnSistema[i].getId().toString(),
            EstadoCliente[clientesEnSistema[i].getEstado()],
            clientesEnSistema[i].getMinutoLlegada().toFixed(4),
          );
        }

        // Evitamos que los zapatos queden bajo los encabezados de las columnas de clientes.
        if (clientesEnSistema.length < this.limiteColumnasCliente) {
          let celdasVacias: number = (this.limiteColumnasCliente - clientesEnSistema.length) * 3;
          for (let i: number = 0; i < celdasVacias; i++) evento.push('-');
        }

        for (let i: number = 0; i < parZapatosEnSistema.length; i++) {
          evento.push(
            parZapatosEnSistema[i].getId().toString(),
            EstadoParZapatos[parZapatosEnSistema[i].getEstado()],
            parZapatosEnSistema[i].getMinutoLlegada().toFixed(4),
          );
        }

        this.matrizEstado.push(evento);

        // Actualizamos la cantidad máxima de pasajeros que hubo en el sistema.
        this.cantMaxClientes = Math.max(clientesEnSistema.length, this.cantMaxClientes);

        // Actualizamos la cantidad máxima de pares de zapatos que hubo en el sistema.
        this.cantMaxParZapatos = Math.max(parZapatosEnSistema.length, this.cantMaxParZapatos);

        // Calculamos las métricas para la última iteración.
        if (i == cantEventos-1) {
          if (cantZapatosReparados != 0)
          this.tiempoPromedioReparacion = acumuladorTiempoReparacion / cantZapatosReparados;

          this.cantMaxZapatosEnColaReparacion = cantMaxZapatosEnColaReparacion;

          if (cantClientesAtendidos != 0)
          this.tiempoPromedioAtencion = acumuladorTiempoAtencion / cantClientesAtendidos;

          if ((cantClientesAtendidos + cantClientesRechazados) != 0)
          this.porcentajeClientesRechazados = cantClientesRechazados / (cantClientesAtendidos + cantClientesRechazados) * 100;
        }
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

  public getMatrizEstado(): string[][] {
    return this.matrizEstado;
}

public getTiempoPromedioReparacion(): number {
  return this.tiempoPromedioReparacion;
}

public getCantMaxZapatosEnColaReparacion(): number {
  return this.cantMaxZapatosEnColaReparacion;
}

public getTiempoPromedioAtencion(): number {
  return this.tiempoPromedioAtencion;
}

public getPorcentajeClientesRechazados(): number {
  return this.porcentajeClientesRechazados;
}
  
  // Método que devuelve el evento que sigue, dados los tiempos de los eventos candidatos.
  public getSiguienteEvento(tiemposEventos: number[]): TipoEvento {
    let menor: number = Utils.getMenorMayorACero(tiemposEventos);
    for (let i: number = 0; i < tiemposEventos.length; i++) {
      if (tiemposEventos[i] === menor) return TipoEvento[TipoEvento[i+1]];
    }
    return -1;
  }

  // Devuelve la máxima cantidad de clientes que hubo en algún momento en el sistema para el intervalo de iteraciones a mostrar.
  public getCantMaxClientes(): number {
    return this.cantMaxClientes;
  }

  // Devuelve la máxima cantidad de pares de zapatos que hubo en algún momento en el sistema para el intervalo de iteraciones a mostrar.
  public getCantMaxParZapatos(): number {
    return this.cantMaxParZapatos;
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