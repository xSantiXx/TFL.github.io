// Obtener la secuencia de bits y graficar la señal NRZ-L
const readSecuence = (event) => {
    event.preventDefault();

    const secuence = document.getElementById("secuenciabinaria").value;

    const syncError = detectError(secuence);
    document.getElementById("syncError").textContent = syncError;

    const secuenceWhit0 = secuence + "0";

    document.getElementById("nrzLabelsContainer").textContent=secuence; 
    generateNRZL(secuenceWhit0);
    document.getElementById("dNRZ").style.display = "inline-flex";
    document.getElementById("amiLabelsContainer").textContent=secuence;
    generateAMI(secuenceWhit0);
    document.getElementById("dAMI").style.display = "inline-flex";

    const showHDB3 = document.getElementById("showHDB3");
    if (syncError.includes("Posible error")) {
        showHDB3.style.display="block";
        generateHDB3(secuenceWhit0);
    }else{
        showHDB3.style.display="none";
    }
    updateTextStyle();
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
    document.getElementById("dNRZ").style.display = "inline-flex";
    document.getElementById("amiLabelsContainer").textContent=hammingCode;
    generateAMI(secuenceWith0);
    document.getElementById("dAMI").style.display = "inline-flex";

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
            display: false,
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
                    ticks: {display:false}, 
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


function setupDownloadButton(buttonId, containerId,fileName) {
    const $button = document.querySelector(`#${buttonId}`);
    const $container = document.querySelector(`#${containerId}`);

    $button.addEventListener("click", () => {
        html2canvas($container).then(canvas => {
            const link = document.createElement("a");
            link.download = fileName;
            link.href = canvas.toDataURL();
            link.click();
        });
    });
}


setupDownloadButton("dNRZ", "nrz","NRZ_L.png");
setupDownloadButton("dAMI", "ami","AMI_png");
setupDownloadButton("dHDB3", "hdb3","HDB3.png");

// Escuchar el evento de hover en los iconos de información
const infoIcons = document.querySelectorAll('.info-icon');
const tooltip = document.createElement('div'); 
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = 'gray';
tooltip.style.borderRadius = '0px';
tooltip.style.zIndex = '1000';
document.body.appendChild(tooltip);  

infoIcons.forEach(icon => {
    icon.addEventListener('mouseover', function(e) {
        const contentType = e.target.getAttribute('data-content');
        let content = '';

        // Mostrar diferentes contenidos dependiendo de data-content
        switch (contentType) {
            case 'pngAMI':
                content = '<img src="images/AMI.png">';
                break;
            case 'pngHDB3':
                content = '<img src="images/HDB3.png">'; 
                break;
            case 'pngNRZ':
            content = '<img src="images/NRZ.png">'; 
            break;
            case 'gifHamm':
                content = '<img src="images/HAMM.gif">'; 
                break;
        }

        // Mostrar el contenido en el tooltip
        tooltip.innerHTML = content;

        // Posicionar el tooltip cerca del icono
        const iconRect = e.target.getBoundingClientRect();
        tooltip.style.top = `${iconRect.top + window.scrollY + 20}px`;
        tooltip.style.left = `${iconRect.left + window.scrollX - tooltip.offsetWidth / 2 + 8}px`;

        tooltip.style.display = 'block';
    });

    icon.addEventListener('mouseout', function() {
        // Ocultar el tooltip cuando el ratón sale del icono
        tooltip.style.display = 'none';
    });
});


function updateTextStyle() {
    
    const spacingValues = {
        0:{marginLeft:"null",letterSpacing:"null"},
        1:{marginLeft:"null",letterSpacing:"null"},
        2:{marginLeft:"null",letterSpacing:"null"},
        3:{marginLeft:"null",letterSpacing:"null"},
        4: { marginLeft: "100px", letterSpacing: "190px" },
        5: { marginLeft: "80px", letterSpacing: "145px" },
        6: { marginLeft: "70px", letterSpacing: "120px" },
        7: { marginLeft: "60px", letterSpacing: "100px" },
        8: { marginLeft: "50px", letterSpacing: "85px" },
        9: { marginLeft: "42px", letterSpacing: "77px" },
        10: { marginLeft: "40px", letterSpacing: "68px" },
        11: { marginLeft: "40px", letterSpacing: "60px" },
        12: { marginLeft: "35px", letterSpacing: "54px" },
        13: { marginLeft: "30px", letterSpacing: "49px" },
        14: { marginLeft: "25px", letterSpacing: "45px" },
        15: { marginLeft: "25px", letterSpacing: "41px" },
        16: { marginLeft: "25px", letterSpacing: "38px" },
        17: { marginLeft: "20px", letterSpacing: "35.5px" },
        18: { marginLeft: "25px", letterSpacing: "34px" },
        19: { marginLeft: "25px", letterSpacing: "32px" },
        20: { marginLeft: "25px", letterSpacing: "29.7px" },
        21: { marginLeft: "25px", letterSpacing: "27.7px" },
        22: { marginLeft: "20px", letterSpacing: "26px" },
        23: { marginLeft: "20px", letterSpacing: "24px" },
        24: { marginLeft: "20px", letterSpacing: "23px" },
        25: { marginLeft: "20px", letterSpacing: "21.5px" },
        26: { marginLeft: "20px", letterSpacing: "20.5px" },
        27: { marginLeft: "20px", letterSpacing: "19.6px" },
        28: { marginLeft: "20px", letterSpacing: "18.7px" },
        29: { marginLeft: "20px", letterSpacing: "17.5px" },
        30: { marginLeft: "19px", letterSpacing: "16.6px" },
    };

    const elements = document.querySelectorAll('.labels-contain');

    elements.forEach(element => {
        const textLength = element.textContent.length;
        if (spacingValues[textLength]) {
            const { marginLeft, letterSpacing } = spacingValues[textLength]; 
            element.style.marginLeft = marginLeft;
            element.style.letterSpacing = letterSpacing;
        }
    });
}