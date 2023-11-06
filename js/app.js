let url                 = "https://mindicador.cl/api";
let moneda__option      = document.querySelector("#moneda__option");
let cantidadAcalcular   = document.getElementById("txtCantidad");
let btnCalcular         = document.querySelector("#btnCalcular");
let total               = 0;
let resultado           = document.querySelector("#resultado");
// Declarar myChart fuera de la función calcular
let myChart;

mostrarMonedas();

async function mostrarMonedas() {
  const monedita = await capturarMoneda();
  monedita.forEach((moneda) => {
    const option = document.createElement("option");
    option.value = moneda.valor;
    option.textContent = `${moneda.nombre}`;
    moneda__option.appendChild(option);
    return monedita;
  });
}

async function capturarMoneda() {
  try {
    const moneditas = await fetch(url);
    const data = await moneditas.json();
    const monedas = Object.keys(data);

    const monedasObj = monedas.map((moneda) => ({
      nombre: moneda,
      codigo: data[moneda].codigo,
      valor: data[moneda].valor,
      unidad_medida: data[moneda].unidad_medida,
      fecha: data[moneda].fecha,
    }));
  
    let monedap = monedasObj.filter((e) => e.codigo != undefined);
    return monedap;

  } catch (error) {
    alert("¡Algo salió mal!");
  }
}

async function calcular() {
  // Elimina la gráfica anterior si existe
  if (myChart) {
    myChart.destroy();
  }

  // Elimina el resultado anterior
  resultado.innerHTML = "";

  if (cantidadAcalcular.value === "") {
    alert("¡Debe ingresar un valor Numérico!");
    return;
  }
  
  let valorMoneda = moneda__option.value;
  valorMoneda = valorMoneda.replace(',', '.');
  total = cantidadAcalcular.value / valorMoneda;

  let monedaNombre  = moneda__option.options[moneda__option.selectedIndex].text;
  historicoMoneda   = await fetch(`https://mindicador.cl/api/${monedaNombre}`);
  historico         = await historicoMoneda.json();
  historico         = historico.serie;
  historico.sort(function (a, b) {
    if (b.fecha > a.fecha) {
      return 1;
    }
    if (b.fecha < a.fecha) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  
  historico10 = historico.slice(0, 10);

  const ejeY = historico10.map((e) => e.valor);
  const ejeX = historico10.map((e) => e.fecha);

  const formattedDates = ejeX.map((fecha) => dayjs(fecha).format('YYYY-MM-DD'));

  const data = {
    labels: formattedDates, 
    datasets: [
      {
        label: "Últimos 10 valores " + monedaNombre,
        data: ejeY,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
  };

  myChart = new Chart(document.getElementById("myChart"), config);

  resultado.innerHTML = total.toFixed(2) + " " + monedaNombre ;

  return resultado;
}
