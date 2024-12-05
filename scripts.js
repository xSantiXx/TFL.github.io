// Obtener la secuencia de bits y graficar la señal NRZ-L
const readSecuence = (event) => {
    event.preventDefault();

    const secuence = document.getElementById("secuenciabinaria").value;

    const syncError = detectError(secuence);
    document.getElementById("syncError").textContent = syncError;

    const secuenceWhit0 = secuence + "0";

    generateNRZL(secuenceWhit0);
    generateAMI(secuenceWhit0);

    const showHDB3 = document.getElementById("showHDB3");
    if (syncError.includes("Posible error")) {
        showHDB3.style.display="block";
        generateHDB3(secuenceWhit0);
    }else{
        showHDB3.style.display="none";
    }
}

const readCharacters = (event) => {
    event.preventDefault();

    const character = document.getElementById("inputchar").value;
    const asciiCode = character.charCodeAt(0).toString(2).padStart(8, '0');
    const hammingCode = hammingEncode(asciiCode);

    document.getElementById("hammingCode").textContent = hammingCode;
    document.getElementById("asciiCode").textContent = "ASCII:   "+asciiCode;

    const syncError = detectError(hammingCode);
    document.getElementById("syncError").textContent = syncError;

    let secuenceWith0 = hammingCode + "0";

    document.getElementById("nrzLabelsContainer").textContent=hammingCode;
    generateNRZL(secuenceWith0);
    document.getElementById("amiLabelsContainer").textContent=hammingCode;
    generateAMI(secuenceWith0);

    const showHDB3 = document.getElementById("showHDB3");
    if (syncError.includes("Posible error")) {
        showHDB3.style.display="block";
        const hdb3Secuence = hdb3Code(hammingCode);
        document.getElementById("hdb3LabelsContainer").textContent = hdb3Secuence;
        generateHDB3(secuenceWith0);
    }else{
        showHDB3.style.display="none";
    }
}   

function hdb3Code(bits) { 
    let zeroCount = 0;  
    let result = [];
    let oneCount = 0;
    
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            result.push(1);
            zeroCount = 0; 
            oneCount++;
        }else {
            zeroCount++;
            if (zeroCount == 4) {
                if (oneCount%2 === 1) {
                    result.push('V'); 
                    oneCount++;
                } else {
                    for(let c=0; c<3;c++){
                        result.pop();
                    }
                    result.push('B');
                    result.push(0);
                    result.push(0);
                    result.push('V');
                }
                zeroCount = 0;
            }else{
                result.push(0);
            }
        }
    }
    return result.join("");
}
// Función para codificar en Hamming
function hammingEncode(input) {

    const bits = input.split('').map(bit => parseInt(bit, 10));

    let hamming = [];
    
    hamming[0] = bits[0]; // n8
    hamming[1] = bits[1]; // n7
    hamming[2] = bits[2]; // n6
    hamming[3] = bits[3]; // n5
    hamming[5] = bits[4]; // n4
    hamming[6] = bits[5]; // n3
    hamming[7] = bits[6]; // n2
    hamming[9] = bits[7]; // n1

    hamming[11] = (bits[1] ^ bits[3] ^ bits[4] ^ bits[6] ^ bits[7]) % 2;
    hamming[10] = (bits[1] ^ bits[2] ^ bits[4] ^ bits[5] ^ bits[7]) % 2;
    hamming[8] = (bits[0] ^ bits[4] ^ bits[5] ^ bits[6]) % 2;
    hamming[4] = (bits[0] ^ bits[1] ^ bits[2] ^ bits[3]) % 2;

    return hamming.join('');
}

function detectError(binarySequence) {
    const regex = /0000/;
    if (regex.test(binarySequence)) {
        return "Posible error de sincronizacion por 4 o mas '0's consecutivos.";
    } else {
        return "No se detectó error de sincronización.";
    }
}

let nrzChart;

// Generar gráfico NRZ-L con etiquetas dinámicas
function generateNRZL(bits) {
    const nrzSignal = bits.split('').map(bit => (bit === '1' ? 1 : 0));

    // Gráfico de la señal
    const ctx = document.getElementById('nrzSecuence').getContext('2d');

    if (nrzChart) {
        nrzChart.destroy();
    }

    nrzChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: nrzSignal.length }, (_, i) => i + 1), // Índices
            datasets: [{
                label: 'Señal NRZ',
                data: nrzSignal,
                borderColor: '#e6ccff',
                borderWidth: 3,
                fill: false,
                tension: 0,
                stepped: true,
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: true, color: 'gray', lineWidth: 1 },
                    beginAtZero: true,
                    title: { display: false},
                    ticks: { display: false },
                },
                y: {
                    min: -0.2,
                    max: 1.2,
                    grid: { drawOnChartArea: true, color: 'gray', lineWidth: (context) => context.tick.value === 0 ? 2 : 0, },
                    beginAtZero: true,
                    title: { display: false},
                    ticks: {
                        callback: function(value) {
                            return value === 0 || value === 1 ? value : '';
                        },
                    },
                }
            },
        }
    });
}


//Inicializa la variable de la Grafica de AMI
let amiChart;

//Genera el Grafico de la Señal en NRZ
function generateAMI(bits) {
    let lastLevel= -1;
    const amiSignal = bits.split('').map(bit =>{
        if(bit==='1'){
            lastLevel*=-1;
            return lastLevel;
        }else{
            return 0;
        }
    });


    const labels = Array.from({ length: amiSignal.length }, (_, i) => i + 1);

    const ctx = document.getElementById('amiSecuence').getContext('2d');

    if (amiChart) {
        amiChart.destroy();
    }

    amiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: amiSignal,
                borderColor: '#ccffe6', 
                borderWidth: 3,
                fill: false,
                tension: 0,
                stepped: true,
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false 
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        drawOnChartArea: true,  
                        color: 'gray',
                        lineWidth: 1,
                    },
                    beginAtZero: true,
                    title: {display:false},
                },
                y: {
                    min: -1.2,
                    max: 1.2,
                    grid: {
                        drawOnChartArea: true, 
                        color: 'gray', 
                        lineWidth: (context) => context.tick.value === 0 ? 2 : 0,
                    },
                    beginAtZero: true,
                    title: {
                        display: false},
                    ticks: {
                        callback: function(value) {
                            return value === 0 || value === 1 || value=== -1 ? value : '';
                        },
                    },
                }
            },
        }
    });
}

// Función para aplicar la codificación HDB3
function hdb3Encode(bits) {
    let lastLevel = -1; 
    let zeroCount = 0;  
    let result = [];
    let oneCount = 0;

    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            lastLevel *= -1; // Invertir nivel cuando hay un 1
            result.push(lastLevel);
            zeroCount = 0; 
            oneCount++;
        } else {
            zeroCount++;
            if (zeroCount == 4) {
                if (oneCount%2 === 1) {
                    result.push(lastLevel); 
                    oneCount++;
                } else {
                    for(let c=0; c<3;c++){
                        result.pop();
                    }
                    lastLevel*=-1;
                    result.push(lastLevel);
                    result.push(0);
                    result.push(0);
                    result.push(lastLevel);
                    lastLevel*=1;
                }
                zeroCount = 0;
            }else{
                result.push(0);
            }
        }
    }
    return result;
}



let hdb3Chart;

function generateHDB3(bits) {
    const hdb3Signal = hdb3Encode(bits);

    const labels = Array.from({ length: hdb3Signal.length }, (_, i) => i + 1);

    const ctx = document.getElementById('hdb3Secuence').getContext('2d');
    if (hdb3Chart) {
        hdb3Chart.destroy();
    }

    hdb3Chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Secuencia HDB3',
                data: hdb3Signal,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                fill: false,
                tension: 0,
                stepped: true,
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        drawOnChartArea: true,
                        color: 'gray',
                        lineWidth: 1,
                    },
                    beginAtZero: true,
                    title: {display: true},
                    ticks: { display: false}
                },
                y: {
                    min: -1.2,
                    max: 1.2,
                    grid: {
                        drawOnChartArea: true,
                        color: 'gray',
                        lineWidth: (context) => context.tick.value === 0 ? 2 : 0,
                    },
                    beginAtZero: true,
                    title: {display: false},
                    ticks: {
                        callback: function(value) {
                            return value === 0 || value === 1 || value === -1 ? value : '';
                        },
                    },
                }
            },
        }
    });
}

document.getElementById("downloadImage").addEventListener("click", (event) => {
    event.preventDefault();

    // Seleccionar el contenedor que quieres capturar
    const graficsContainer = document.querySelector(".section");

    // Usar html2canvas para capturar el contenedor
    html2canvas(graficsContainer).then(canvas => {
        // Convertir el canvas en una URL de imagen en formato JPG
        const imgData = canvas.toDataURL("image/jpeg", 1.0);

        // Crear un enlace de descarga
        const a = document.createElement("a");
        a.href = imgData;
        a.download = "grafics.jpg"; // Nombre del archivo descargado
        document.body.appendChild(a);
        a.click();

        // Limpiar el enlace temporal
        document.body.removeChild(a);
    });
});