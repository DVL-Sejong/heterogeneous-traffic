var rankHeight;

function drawRank(channel) {
    var rankData = {
        channel: [],
        name: [],
        volume: []
    };
    var sortedRankData = {
        channel: [],
        name: [],
        volume: []
    };
    var appendVolume = {
        channel: [],
        name: [],
        volume: []
    }
    var selectedChannel = trafficConditionData[channel];
    for (var idx in selectedChannel.near) {
        var c = selectedChannel.near[idx];
        rankData.channel.push(c);
        rankData.name.push(trafficConditionData[c].name);
        rankData.volume.push(trafficConditionData[c].volume);
    }

    sortedRankData.volume = rankData.volume.slice().sort((a, b) => a - b);
    sortedRankData.name = rankData.volume.map((item, index) => rankData.name[rankData.volume.indexOf(sortedRankData.volume[index])]);
    sortedRankData.channel = rankData.volume.map((item, index) => rankData.channel[rankData.volume.indexOf(sortedRankData.volume[index])]);

    appendVolume.channel = sortedRankData.channel;
    appendVolume.name = sortedRankData.name;
    if (selectedChannel.direction == '원활') {
        for (var idx in sortedRankData.channel)
            appendVolume.volume.push(0);
    }
    else {
        var max = selectedChannel.volume - 100;
        for (var idx in sortedRankData.channel) {
            appendVolume.volume.push(Math.floor(Math.random() * max) + 1);
        }
        appendVolume.volume.sort(function (a, b) {
            return b - a;
        });
        for (var idx in appendVolume.volume){
            if(trafficConditionData[appendVolume.channel[idx]].volume+appendVolume.volume[idx]>=150){
                appendVolume.volume[idx] = 129-trafficConditionData[appendVolume.channel[idx]].volume;
                if(appendVolume.volume[idx] < 0){
                    appendVolume.volume[idx] = 0;
                }
            }
        }
    }


    var options = {
        series: [{
            name: '통행량',
            data: sortedRankData.volume
        },
            {
                name: '증가되는 통행량',
                data: appendVolume.volume
            }],
        chart: {
            type: 'bar',
            height: rankHeight,
            stacked: true,
            events: {
                dataPointSelection: function (event, chartContext, config) {
                    // 이벤트가 발생한 데이터 포인트의 인덱스
                    var dataIndex = config.dataPointIndex;

                    // 여기서 원하는 함수를 호출하세요
                    console.log(sortedRankData.channel[dataIndex],appendVolume.volume[dataIndex]);
                    generateSankey(channel, sortedRankData.channel[dataIndex],appendVolume.volume[dataIndex]);
                    //console.log("bar click test: ", sortedRankData.channel[dataIndex], sortedRankData.name[dataIndex]);
                    //handleClickFunction(xValue, yValue);
                }
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                dataLabels: {
                    total:{
                        enabled: true
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            /*
            formatter: function (value){
                return "통행량: " + value.toString();
            }*/
        },
        xaxis: {
            categories: sortedRankData.name,
        },
        title: {
            align: 'center',
            text: '대체 경로 후보'
        }
    };
    var chart = new ApexCharts(document.querySelector("#replaceRank"), options);
    chart.render();
}