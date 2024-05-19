var date = "";
var height = document.getElementById('temporalAnomalyAnalysisView').clientHeight - 15;

function convertNode(node) {
    var channels = ['721', '6034', '6035', '6036', '6070', '6071', '6072', '6073', '6074', '6092', '6927', '6932', '7365']
    if (channels.includes(node))
        return node
    else {
        // 리스트에서 랜덤한 원소를 반환
        var randomIndex = Math.floor(Math.random() * channels.length);
        var randomElement = channels[randomIndex];
        return randomElement;
    }
}

function drawAnomalyVis(node) {
    $('#temporalAnomalyAnalysisView').empty();
    var convertedNode = convertNode(node);
    readRawData(convertedNode);
}

function readRawData(node) {
    $.ajax({
        url: '../static/data/date/' + node + '.csv',
        dataType: 'text',
    }).done(function (data) {
        var rawAxis = [];
        var rawData = [];
        var allRows = data.split(/\r?\n|\r/);
        for (var singleRow = 1; singleRow < allRows.length - 1; singleRow++) {
            var rowCells = allRows[singleRow].split(',');
            for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
                if (rowCell == 0) {
                    //console.log(rowCells[rowCell]);
                    rawAxis.push(rowCells[rowCell]);
                } else {
                    //console.log(rowCells[rowCell]);
                    rawData.push(parseFloat(rowCells[rowCell]).toFixed(2));
                }
            }
        }

        readAnomalyData(rawAxis, rawData, node);
        return;
    })
        .fail(function (xhr, status, errorThrown) {
            console.log('rawDataFail: ' + node + '.csv');
            console.log('rawDataFail: ', xhr, status, errorThrown);
        })
}

function readAnomalyData(rawAxis, rawData, node) {
    $.ajax({
        url: '../static/data/anomaly/col_' + node + '.csv',
        dataType: 'text',
    }).done(function (data) {
        var anomalyData = [];
        var allRows = data.split(/\r?\n|\r/);
        for (var singleRow = 1; singleRow < allRows.length - 1; singleRow++) {
            var rowCells = allRows[singleRow].split(',');
            anomalyData.push(parseFloat(rowCells[3]).toFixed(2));
        }

        drawAnomalyBarAndLineChart(rawAxis, rawData, anomalyData);
        return;
    })
        .fail(function (xhr, status, errorThrown) {
            console.log('rawDataFail: ' + node + '.csv');
            console.log('rawDataFail: ', xhr, status, errorThrown);
        })
}

function drawAnomalyBarAndLineChart(rawAxis, rawData, anomalyData) {
    var options = {
        series: [
            {
                name: 'Anomaly Score',
                type: 'column',
                data: anomalyData//[23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
            },
            {
                name: 'Speed',
                type: 'line',//'area',
                data: rawData//[44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
            }],
        chart: {
            height: height,
            type: 'line',
            stacked: false,
            events: {
                markerClick: function (event, chartContext, {seriesIndex, dataPointIndex, config}) {
                    $.ajax({
                        type: 'POST',
                        url: '/convertDate',
                        cache: false,
                        data: dataPointIndex.toString(),
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            date = data;
                            showNewWords(myWordCloud);
                        }
                    })
                }
            },
            toolbar: {
                show: false
            },
        },
        stroke: {
            width: [0, 4],
            curve: 'smooth'
        },

        plotOptions: {
            bar: {
                columnWidth: '30%'
            }
        },
        colors: ['#FADBD8', '#626567'],
        labels: rawAxis, //['01/01/2003', '02/01/2003', '03/01/2003', '04/01/2003', '05/01/2003', '06/01/2003', '07/01/2003','08/01/2003', '09/01/2003', '10/01/2003', '11/01/2003'],
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: [{
            opposite: true,
            title: {
                text: 'Anomaly Score',
            },

        }, {
            title: {
                text: 'Speed',
            }
        }],
        title: {
            text: '과거 교통 정보',
            align: 'center',

        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return y.toFixed(2) + " points";
                    }
                    return y;
                }
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#temporalAnomalyAnalysisView"), options);
    chart.render();
}