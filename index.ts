import { RungeKutta } from './src/simulacion/RungeKutta';
import { Simulador } from './src/simulacion/Simulador';
import { HTMLUtils } from './src/utils/HTMLUtils';
import './style.css';

// Definición de los cuadros de texto de la interfaz de usuario.
const txtCantEventos: HTMLInputElement = document.getElementById('txtCantEventos') as HTMLInputElement;
const txtEventoDesde: HTMLInputElement = document.getElementById('txtEventoDesde') as HTMLInputElement;
const txtProbRetiro: HTMLInputElement = document.getElementById('txtProbRetiro') as HTMLInputElement;
const txtProbPedido: HTMLInputElement = document.getElementById('txtProbPedido') as HTMLInputElement;

const txtMediaLlegadaClientes: HTMLInputElement = document.getElementById('txtMediaLlegadaClientes') as HTMLInputElement;

const txtTiempoAtencionClienteA: HTMLInputElement = document.getElementById('txtTiempoAtencionClienteA') as HTMLInputElement;
const txtTiempoAtencionClienteB: HTMLInputElement = document.getElementById('txtTiempoAtencionClienteB') as HTMLInputElement;

const txtTiempoReparacionZapatosA: HTMLInputElement = document.getElementById('txtTiempoReparacionZapatosA') as HTMLInputElement;
const txtTiempoReparacionZapatosB: HTMLInputElement = document.getElementById('txtTiempoReparacionZapatosB') as HTMLInputElement;

// Definición de las alertas para mostrar las métricas.
const alertTiempoPromedioReparacion: HTMLDivElement = document.getElementById('alertTiempoPromedioReparacion') as HTMLDivElement;
const alertCantMaxColaZapatos: HTMLDivElement = document.getElementById('alertCantMaxColaZapatos') as HTMLDivElement;
const alertTiempoPromedioAtencionClientes: HTMLDivElement = document.getElementById('alertTiempoPromedioAtencionClientes') as HTMLDivElement;
const alertPorcentajeClientesRechazados: HTMLDivElement = document.getElementById('alertPorcentajeClientesRechazados') as HTMLDivElement;

// Definición de la secciones.
const divTablaSimulacion: HTMLDivElement = document.getElementById('divTablaSimulacion') as HTMLDivElement;
const divRungeKutta: HTMLDivElement = document.getElementById('divRungeKutta') as HTMLDivElement;

// Definición de la tablas de simulación de colas.
const tablaSimulacion: HTMLTableElement = document.getElementById('tablaSimulacion') as HTMLTableElement;
const cantEncabezadosTablaSimulacion = tablaSimulacion.rows[0].cells.length;
const cantSubEncabezadosTablaSimulacion = tablaSimulacion.rows[1].cells.length;
const indicesEventosCandidatos: number[] = [5, 10, 14, 17, 20, 24, 26, 29];
const columnasClientes: string[] = ['N° Cliente', 'Estado', 'Minuto llegada'];
const columnasParZapatos: string[] = ['N° Par', 'Estado', 'Minuto llegada'];

// Definición de botones de la interfaz de usuario.
const btnSimular: HTMLButtonElement = document.getElementById('btnSimular') as HTMLButtonElement;
const btnRK: HTMLButtonElement = document.getElementById('btnRK') as HTMLButtonElement;

// Definición de los objetos que realizan la simulación de colas.
let simulador: Simulador;
let matrizEstado: string[][];
let rungeKutta: RungeKutta;

// Definición de los parámetros.
let cantEventos: number;
let eventoDesde: number;

let probRetiro: number;
let probPedido: number;

let mediaLlegadaClientes: number;

let tiempoAtencionClienteA: number;
let tiempoAtencionClienteB: number;

let tiempoReparacionZapatosA: number;
let tiempoReparacionZapatosB: number;

//Ocultamos la seccion en donde esta la tabla.
HTMLUtils.ocultarSeccion(divTablaSimulacion);
HTMLUtils.ocultarSeccion(divRungeKutta);

// Detecta que el valor de la probabilidad de retiro de zapatos es ingresado por teclado y calcula la de pedido.
txtProbRetiro.addEventListener('input', () => {
  txtProbPedido.value = (1 - Number(txtProbRetiro.value)).toFixed(2);
});

// Detecta que el valor de la probabilidad de pedido de zapatos es ingresado por teclado y calcula la de retiro.
txtProbPedido.addEventListener('input', () => {
  txtProbRetiro.value = (1 - Number(txtProbPedido.value)).toFixed(2);
});

// Disparamos la simulación.
btnSimular.addEventListener('click', () => {
  HTMLUtils.ocultarSeccion(divTablaSimulacion);
  HTMLUtils.ocultarSeccion(divRungeKutta);
  simular();
});

// Mostramos la tabla de Runge-Kutta.
btnRK.addEventListener('click', () => {
  mostrarRK();
});


const mostrarRK = () => {
  divRungeKutta.innerHTML = '';
  HTMLUtils.mostrarSeccion(divRungeKutta);

  divRungeKutta.innerHTML += '<h1 class="text-center">Tabla de Runge-Kutta de tiempo de secado:</h1>';
  let tablaRK: number[][] = rungeKutta.getMatrizRK();
  let tablaRKHTML: string = HTMLUtils.crearTablaRK(tablaRK, 'S');
  divRungeKutta.innerHTML += tablaRKHTML;
}

const simular = () => {
  // Validamos los parámetros ingresados por el usuario.
  if (!validarParametros()) return;

  // Mostramos las métricas.
  alertTiempoPromedioReparacion.innerHTML = 'Tiempo Promedio de Reparación de Par de Zapatos: ';
  alertCantMaxColaZapatos.innerHTML = 'Cantidad Máxima de Par de Zapatos a Reparar en la Cola: ';
  alertTiempoPromedioAtencionClientes.innerHTML = 'Tiempo Promedio de Atención de Clientes: ';
  alertPorcentajeClientesRechazados.innerHTML = 'Porcentaje de Clientes Rechazados: ';

  var startTime = performance.now();
  HTMLUtils.limpiarTablaSimulacion(tablaSimulacion, cantEncabezadosTablaSimulacion, cantSubEncabezadosTablaSimulacion);
  console.log(`La limpieza tardó ${performance.now() - startTime} milisegundos`);

  // Realizamos la simulación.
  startTime = performance.now();
  simulador = new Simulador();
  rungeKutta = new RungeKutta();
  let tiempoSecado: number = rungeKutta.getTiempoSecado(0, 0, 0.001);

  simulador.simular(cantEventos, eventoDesde, probRetiro, probPedido, mediaLlegadaClientes, tiempoAtencionClienteA, tiempoAtencionClienteB, tiempoReparacionZapatosA, tiempoReparacionZapatosB, tiempoSecado);

  console.log(`La simulación tardó ${performance.now() - startTime} milisegundos`);

  matrizEstado = simulador.getMatrizEstado();
  let cantMaxClientes: number = simulador.getCantMaxClientes();
  let cantMaxParZapatos: number = simulador.getCantMaxParZapatos();

  // Cargamos la tabla a mostrar.
  startTime = performance.now();
  HTMLUtils.agregarEncabezados(cantMaxClientes, tablaSimulacion, columnasClientes);
  HTMLUtils.agregarEncabezados(cantMaxParZapatos, tablaSimulacion, columnasParZapatos);
  HTMLUtils.llenarTablaSimulacion(matrizEstado, indicesEventosCandidatos, tablaSimulacion);
  console.log(`La renderización tardó ${performance.now() - startTime} milisegundos`);
  HTMLUtils.mostrarSeccion(divTablaSimulacion);
}

// Validación de los parámetros del usuario.
function validarParametros(): boolean {
  if (txtCantEventos.value === '' || txtEventoDesde.value === '') {
    alert('Tiene que ingresar todos los parámetros solicitados.');
    return false;
  }

  cantEventos = Number(txtCantEventos.value);
  eventoDesde = Number(txtEventoDesde.value);
  probRetiro = Number(txtProbRetiro.value);
  probPedido = Number(txtProbPedido.value);
  mediaLlegadaClientes = Number(txtMediaLlegadaClientes.value);
  tiempoAtencionClienteA = Number(txtTiempoAtencionClienteA.value);
  tiempoAtencionClienteB = Number(txtTiempoAtencionClienteB.value);
  tiempoReparacionZapatosA = Number(txtTiempoReparacionZapatosA.value);
  tiempoReparacionZapatosB = Number(txtTiempoReparacionZapatosB.value);

  if (cantEventos <= 0) {
    alert('La cantidad de eventos a generar debe ser mayor a cero.');
    return false;
  }

  if (eventoDesde < 0 || eventoDesde > cantEventos) {
    alert('El evento desde ingresado debe estar comprendido entre 0 y ' + cantEventos + '.');
    return false;
  }

  if (probRetiro < 0 || probRetiro > 1) {
    alert('El valor de probabilidad de hacer un retiro debe estar entre 0 y 1');
    return false;
  }

  if (probPedido < 0 || probPedido > 1) {
    alert('El valor de probabilidad de hacer un pedido debe estar entre 0 y 1');
    return false;
  }

  if (mediaLlegadaClientes) {
    alert('La media de la llegada de clientes no puede ser un valor negativo.');
    return false;
  }

  if (tiempoAtencionClienteA >= tiempoAtencionClienteB) {
    alert('El valor de "B" del tiempo de atención de clientes debe ser mayor a "A".');
    return false;
  }

  if (txtTiempoReparacionZapatosA >= txtTiempoReparacionZapatosB) {
    alert('El valor de "B" del tiempo de reparación de zapatos debe ser mayor a "A".');
    return false;
  }

  return true;
}