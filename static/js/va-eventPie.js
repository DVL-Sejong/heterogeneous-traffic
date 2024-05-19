var pieHeight;

function drawPie(channel) {
    var pie = [];
    $('#eventPie1').empty();
    $('#eventPie2').empty();
    $('#eventPie3').empty();
    pie.push(channelConditionData.event.pie);
    pie.push(channelConditionData.accident.pie);
    pie.push(channelConditionData.construction.pie);
    console.log(pie);
    var piechart1 = new ApexCharts(document.querySelector("#eventPie1"), {
        series: [pie[0]],
        chart: {
            height: pieHeight,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '50%'//pie[0].toString() + '%'
                },
                dataLabels: {
                    showOn: 'always',
                    name: {
                        color: "#333",
                        show: true,
                    },
                    value: {
                        color: "#333",
                        fontSize: '20px',
                        show: true
                    }
                }
            }
        },
        stroke: {
            lineCap: "round",
        },
        labels: ['행사'],
    });
    var piechart2 = new ApexCharts(document.querySelector("#eventPie2"), {
        series: [pie[1]],
        chart: {
            height: pieHeight,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '50%'//pie[1].toString() + '%'
                },
                dataLabels: {
                    showOn: 'always',
                    name: {
                        color: "#333",
                        show: true,
                    },
                    value: {
                        color: "#333",
                        fontSize: '20px',
                        show: true
                    }
                }
            }
        },
        stroke: {
            lineCap: "round",
        },
        labels: ['교통사고'],
    });
    var piechart3 = new ApexCharts(document.querySelector("#eventPie3"), {
        series: [pie[2]],
        chart: {
            height: pieHeight,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '50%'//pie[2].toString() + '%'
                },
                dataLabels: {
                    showOn: 'always',
                    name: {
                        color: "#333",
                        show: true,
                    },
                    value: {
                        color: "#333",
                        fontSize: '20px',
                        show: true
                    }
                }
            }
        },
        stroke: {
            lineCap: "round",
        },
        labels: ['공사'],
    });

    piechart1.render();
    piechart2.render();
    piechart3.render();
}

function pieClick1() {
    addEventInfo('event')
    console.log("pieClick1");
}

function pieClick2() {
    addEventInfo('accident')
    console.log("pieClick2");
}

function pieClick3() {
    addEventInfo('construction')
    console.log("pieClick3");
}