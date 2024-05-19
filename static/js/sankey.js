var sankeyHeight;
var sankeyWidth;
var sankeyColor = [];
var sankeyLabel = [];
var sankeyLink = {
    source: [],
    target: [],
    value: [],
    color: []
};

function generateSankeyData(from, to, addedVolume) {
    console.log(addedVolume);
    sankeyLabel.push(trafficConditionData2[from].name);
    sankeyLabel.push(trafficConditionData2[from].name);
    sankeyLabel.push(trafficConditionData2[to].name);
    sankeyLabel.push(trafficConditionData2[to].name);

    if(trafficConditionData2[from].direction == "원활"){
        sankeyColor.push('#006400');
        sankeyLink.color.push('#006400');
        sankeyLink.color.push('#006400');
    }
    else if(trafficConditionData2[from].direction == "정체"){
        sankeyColor.push('#FFD700');
        sankeyLink.color.push('#FFD700');
        sankeyLink.color.push('#FFD700');
    }
    else if(trafficConditionData2[from].direction == "혼잡"){
        sankeyColor.push('#B22222');
        sankeyLink.color.push('#B22222');
        sankeyLink.color.push('#B22222');
    }

    trafficConditionData2[from].volume -= addedVolume;
    sankeyLink.value.push(trafficConditionData2[from].volume);
    if (trafficConditionData2[from].volume < 100) {
        trafficConditionData2[from].direction = "원활";
        sankeyColor.push('#006400');
    } else if (trafficConditionData2[from].volume < 150) {
        trafficConditionData2[from].direction = "정체";
        sankeyColor.push('#FFD700');
    } else {
        trafficConditionData2[from].direction = "혼잡";
        sankeyColor.push('#B22222');
    }

    if(trafficConditionData2[to].direction == "원활"){
        sankeyColor.push('#006400');
        sankeyLink.color.push('#006400');
    }
    else if(trafficConditionData2[to].direction == "정체"){
        sankeyColor.push('#FFD700');
        sankeyLink.color.push('#FFD700');
    }
    else if(trafficConditionData2[to].direction == "혼잡"){
        sankeyColor.push('#B22222');
        sankeyLink.color.push('#B22222');
    }

    sankeyLink.source.push(0);
    sankeyLink.source.push(0);
    sankeyLink.source.push(2);
    sankeyLink.target.push(1);
    sankeyLink.target.push(3);
    sankeyLink.target.push(3);

    sankeyLink.value.push(addedVolume);
    sankeyLink.value.push(trafficConditionData2[to].volume);
    trafficConditionData2[to].volume += addedVolume;
    if (trafficConditionData2[to].volume < 100) {
        trafficConditionData2[to].direction = "원활";
        sankeyColor.push('#006400');
    } else if (trafficConditionData2[to].volume < 150) {
        trafficConditionData2[to].direction = "정체";
        sankeyColor.push('#FFD700');
    } else {
        trafficConditionData2[to].direction = "혼잡";
        sankeyColor.push('#B22222');
    }
    makeUnderMap(from, to);
}

function generateSankey(from, to, addedVolume) {
    $('#sankeyDiagram').empty();
    //배열 비우기
    sankeyLabel.splice(0, sankeyLabel.length);
    sankeyColor.splice(0, sankeyColor.length);
    sankeyLink.source.splice(0, sankeyLink.source.length);
    sankeyLink.target.splice(0, sankeyLink.target.length);
    sankeyLink.value.splice(0, sankeyLink.value.length);
    sankeyLink.color.splice(0, sankeyLink.color.length);

    //console.log(Object.keys(trafficConditionData));
    generateSankeyData(from, to, addedVolume);
    var data = {
        type: "sankey",
        domain: {
            x: [0, 1],
            y: [0, 1]
        },
        orientation: "h",
        valueformat: ".0f",
        node: {
            pad: 15,
            thickness: 15,
            line: {
                color: "black",
                width: 0.5
            },
            label: sankeyLabel,
            color: sankeyColor
        },

        link: {
            source: sankeyLink.source,
            target: sankeyLink.target,
            value: sankeyLink.value,
            color: sankeyLink.color
        }
    }

    var data = [data]

    var layout = {
        width: sankeyWidth,
        height: sankeyHeight,
        font: {
            size: 10
        },
        margin: {
            t: 10,  // 상단 여백 크기 조절
            b: 10,   // 하단 여백 크기 조절
            l: 10,   // 하단 여백 크기 조절
            r: 10   // 하단 여백 크기 조절
        }
    }

    Plotly.newPlot('sankeyDiagram', data, layout)
}