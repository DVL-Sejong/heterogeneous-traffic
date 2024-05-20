var map;
var timeline;
var edgeMode;
var channelConditionData;

var cctvData = {};
var mapNodeData = {};
var selectNode = {};
var placeData = {};
var trafficData = [];
var routeData = {};

var trafficDataQueue;
var trafficDataName;

var mapboxToken = 'pk.eyJ1Ijoia2hhcmlzbWExMSIsImEiOiJjazM1M3dra2cwZjM0M2NwZXhmdWEybHIyIn0.ALDvfHZ6cPKoika-aEL65A';

// 메인
$(document).ready(function () {
    drawMap();
});
function drawMap() {
    // 지도 생성
    $('#map').empty();
    $('#map2').empty();
    $('#cctv-video').empty();
    $('#temporalAnomalyAnalysisView').empty();
    $('#eventPie1').empty();
    $('#eventPie2').empty();
    $('#eventPie3').empty();
    $('#eventDescription').empty();
    $('#replaceRank').empty();
    $('#sankeyDiagram').empty();
    mapboxgl.accessToken = mapboxToken;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/kharisma11/ck9m5mk1b0ps11io8iets480d',
        center: [127.0455, 37.515],
        zoom: 12.7
    });
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    // 지도 로드 시 호출되는 콜백
    map.on('load', function () {
        // 노드 아이콘을 사용하기 위해 지도에 추가함
        for (var i = 1; i <= 3; i++) {
            addImage(i);
        }

        function addImage(i) {
            map.loadImage('static/img/node/' + i + '.png', function (error, image) {
                if (error)
                    throw error;
                map.addImage('node-' + i, image);
            });
        }

        // 장소 데이터(place_data.json) 요청
        $.ajax({
            method: 'get',
            url: 'static/place_data.json',
            dataType: 'json',
            cache: false,
            async: false
        }).done(onPlaceDataResponse);

        // CCTV 데이터(cctv_data.json) 요청
        $.ajax({
            method: 'get',
            url: 'static/cctv_data.json',
            dataType: 'json',
            cache: false
        }).done(onCCTVDataResponse);
    });
    // 지도 내 이동 시 updateCCTVList(va-cctv-info.js) 호출
    // updateCCTVList는 CCTV info 패널의 Video sampling 섹션에 있는 CCTV 목록을 갱신하는 메소드임
    map.on('move', updateCCTVList);
    map.on('click', 'cctv', function (e) {
        // 지도에서 CCTV 아이콘 클릭 시 runCCTVVideo(va-cctv-info.js) 호출
        // runCCTVVideo는 Traffic CCTV Video 재생하는 메소드임
        var channel = e.features[0].properties.channel;
        channelConditionData = trafficConditionData[channel];
        console.log(channelConditionData);
        selectNode = cctvData[channel];
        console.log(selectNode);
        $('#eventArea').show();
        $('#map2').empty();
        $('#eventDescription').empty();
        $('#replaceRank').empty();
        $('#sankeyDiagram').empty();
        getTrafficConditionText(channelConditionData);
        //runCCTVVideo(channel);
        runCCTVVideo2(e.features[0].properties.name);
        drawAnomalyVis(channel);
        drawRank(channel);
        drawPie(channel);
        // Propagation view에서 CCTV 아이콘 클릭 시 미리 하드코딩된 traffic data 적용함
        if (edgeMode == 'propagation') {
            loadTrafficData('traffic_data_propagation_c');
        }

    });
    // CCTV 아이콘에 마우스 올릴 시 tooltip
    map.on('mouseenter', 'cctv', function (e) {
        map.getCanvas().style.cursor = 'pointer';
        var coordinates = e.features[0].geometry.coordinates.slice();
        var channel = e.features[0].properties.channel;
        var name = e.features[0].properties.name;
        var description = `<b>${channel}</b><br>${name}`;//`${name}`;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        popup
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });
    // CCTV 아이콘에서 마우스 떠날 때
    map.on('mouseleave', 'cctv', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
    // 지도 아무 지점이나 누르면 콘솔에 좌표 출력함
    // 디버깅용
    map.on('click', function (e) {
        console.log(e.lngLat.toArray());
    });
    // 지도 밑에 있는 타임슬라이더
    //$('#timeslider').on('change', onTimesliderChanged);
}
// 메인에서 요청한 CCTV 데이터 response되었을 때 호출됨
function onCCTVDataResponse(data) {
    cctvData = data;

    // CCTV 데이터를 지도에 반영하기 위해 geojson 형식으로 구성함
    var geojson = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    for (var id in cctvData) {
        var channel = cctvData[id];
        if (channel == undefined)
            continue;

        var direction = 0;
        /*
        if (channel.direction) {
            direction = channel.direction;
        }
        */
        if (trafficConditionData.hasOwnProperty(channel.channel.toString())) {
            if (trafficConditionData[channel.channel.toString()].direction == "원활")
                direction = 1;
            else if (trafficConditionData[channel.channel.toString()].direction == "정체")
                direction = 2;
            else if (trafficConditionData[channel.channel.toString()].direction == "혼잡")
                direction = 3;
        } else {
            direction = 0;
        }
        if (direction > 0) {
            geojson.data.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [channel.x, channel.y]
                },
                properties: {
                    direction: direction,
                    channel: channel.channel,
                    name: channel.cctvStrtSecnNm
                }
            });
        }
    }

    // 지도에 CCTV 데이터 반영
    map.addSource('cctv', geojson);
    map.addLayer({
        id: 'cctv',
        type: 'symbol',
        source: 'cctv',
        layout: {
            'icon-image': 'node-{direction}',
            'icon-size': .2,
            'icon-allow-overlap': true
        }
    });

    // Video sampling 섹션의 CCTV 목록 갱신
    updateCCTVList();
    mapNodeData=geojson;
    console.log(mapNodeData);
}

// 메인에서 요청한 장소 데이터 response되었을 때 호출됨
function onPlaceDataResponse(data) {
    placeData = data;
    drawSpeedModeEdges();
}

// 트래픽 데이터 요청하는 메소드
function loadTrafficData(filename) {
    trafficDataQueue = filename;
    $.ajax({
        method: 'get',
        url: `static/${filename}.json`,
        dataType: 'json',
        cache: false
    }).done(onTrafficDataResponse);
}

// 지도에 경로 엣지 그리는 메소드
/*
function drawRoutes() {
  for (var name in placeData) {
    var place = placeData[name];

    var weight = 0.0002;
    for (var destName of place.linked) {
      var dest = placeData[destName];
      var theta = Math.atan2(dest.coordinates[1]-place.coordinates[1], dest.coordinates[0]-place.coordinates[0]);
      var parallel = [weight * Math.cos(theta + Math.PI / 2), weight * Math.sin(theta + Math.PI / 2)];
      //var routeCoords = [place.coordinates, dest.coordinates];
      var routeCoords = [
        [place.coordinates[0]-parallel[0], place.coordinates[1]-parallel[1]],
        [dest.coordinates[0]-parallel[0], dest.coordinates[1]-parallel[1]]
      ];
      var routeName = name + '-' + destName;
      var routeTraffic = routeData[routeName];

      // 트래픽 데이터에서 지도의 시간대(지도 밑 타임슬라이더로 조정)와 일치하는 시간대의 교통정보로 엣지의 색상 변경함
      // 이 때 엣지의 색상은 엣지 모드에 따라 다름
      var color = '#888';
      if (routeTraffic) {
        for (tbp of routeTraffic.traffic) {
          if (tbp.time == mapTime) {
            if (edgeMode == 'volume') {
              if (tbp.avs < 15) // 정체
                color = '#fbb4b9';
              else if (tbp.avs < 30) // 서행
                color = '#f768a1';
              else // 원활
                color = '#7a0177';
            } else if (edgeMode == 'congestion') {
              if (tbp.avs < 15)
                color = '#ffd92f';
              else if (tbp.avs < 30)
                color = '#e78ac3';
              else if (tbp.avs < 50)
                color = '#66c2a5';
              else
                color = '#555';
            } else if (edgeMode == 'propagation') {
              if (tbp.avs < 10)
                color = '#ccc';
              else if (tbp.avs < 20)
                color = '#8c510a';
              else if (tbp.avs < 30)
                color = '#c19f56';
              else if (tbp.avs < 40)
                color = '#f7dfa0';
              else if (tbp.avs < 50)
                color = '#f5f5f5';
              else if (tbp.avs < 60)
                color = '#c7eae5';
              else if (tbp.avs < 70)
                color = '#5ab4ac';
              else
                color = '#01665e';
            } else {
              if (tbp.avs < 0)
                color = 'rgba(0, 0, 0, 0)';
              else if (tbp.avs < 15) // 정체
                color = 'rgb(192,0,0)';
              else if (tbp.avs < 30) // 서행
                color = 'rgb(254,199,31)';
              else // 원활
                color = 'rgb(0,176,80)';
            }

            break;
          }
        }
      }
      drawRoute(routeName + '-route', routeCoords, color, 3);
    }
  }
}

// 특정 엣지 한 개 그리는 메소드
function drawRoute(id, coordinates, color, width) {
  if (!map.getSource(id)) {
    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    });
  }
  if (!map.getLayer(id)) {
    map.addLayer({
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width
      }
    });
  } else {
    map.setPaintProperty(id, 'line-color', color);
    map.setPaintProperty(id, 'line-width', width);
  }
}
*/

// 트래픽 데이터 response될 때
function onTrafficDataResponse(data) {
    trafficDataName = trafficDataQueue;
    trafficData = data;
    for (var traffic of trafficData) {
        routeData[traffic.from + '-' + traffic.to] = traffic;
    }

    // timeline
    var volume = [];
    for (var i = 0; i < 24; i++)
        volume[i] = 0;
    for (var traffic of trafficData) {
        for (var tpb of traffic.traffic) {
            volume[tpb.time] += tpb.volume;
        }
    }
    //drawTimeline(now, volume);

    // routes
    //drawRoutes();
}

/*
function drawTimeline(volume) {
  timeline = Highcharts.chart('timeline', {
    chart: {
      type: 'areaspline',
      marginBottom: 25,
      events: {
        click: function(e) {
          mapTime = Math.round(e.xAxis[0].value);
          timeline.xAxis[0].options.plotLines[0].value = time;
          timeline.xAxis[0].update();
        }
      }
    },
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },

    xAxis: {
      categories: [
        '0','1','2','3','4','5','6','7','8','9','10','11','12',
        '13','14','15','16','17','18','19','20','21','22','23'
      ],
      plotLines: [{
        color: 'rgba(99, 99, 99, .5)',
        dashstyle: 'longdashdot',
        value: mapTime,
        width: 3
      }],
      labels: {
        style: {
          fontSize: 14
        }
      }
    },
    yAxis: {
      labels: {
        enabled: false
      },
      title: {
        text: ''
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' units'
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        marker:{ enabled: false },
        fillOpacity: 0.2,
        lineWidth: 0,
      }
    },
    series: [{
      name: 'Traffic',
      data: volume,
      color:'#636363'
    }]
  });
}
*/

// 타임슬라이더 조정 시
/*
function onTimesliderChanged() {
    mapTime = ($('#timeslider').val() - 5) * 5;
    var $text = $('<div>')
        .addClass('handle-text')
        .appendTo($('.timeslider-wrapper .slider-handle').empty());
    if (mapTime != 0) {
        if (mapTime > 0)
            $text.text('+' + mapTime);
        else
            $text.text(mapTime);
    }
}
*/
// 엣지 모드 Speed에서 타임슬라이더 시간대에 맞는 트래픽 데이터 적용하는 메소드
// 여기에서 적용되는 트래픽 데이터는 모두 시간대 별로 하드코딩된 것임

function drawSpeedModeEdges() {
    loadTrafficData('traffic_data_f');
}


/*
// 엣지 모드 변경 시
function onEdgeOptionChanged() {
  edgeMode = this.value;

  // 엣지 모드에 따라 하드코딩된 데이터 적용함
  if (edgeMode == 'speed')
    drawSpeedModeEdges();
  else if (edgeMode == 'volume')
    loadTrafficData('traffic_data_c');
  else if (edgeMode == 'congestion')
    loadTrafficData('traffic_data_d');
  else if (edgeMode == 'propagation')
    sta(0);
}

var bufFrom;
var bufTo;
function st(from_, to_, level, level2) {
  bufFrom = from_;
  bufTo = to_;

  var from, to;
  for (var id in placeData) {
    var place = placeData[id];
    if (place.cctv == from_)
      from = place.name;
    if (place.cctv == to_)
      to = place.name;
  }

  var avs = level * 10;
  for (var traffic of trafficData) {
    if (traffic.from == from && traffic.to == to) {
      for (var i of traffic.traffic) {
        i.avs = avs;
      }
      break;
    }
  }

  if (level2 != undefined) {
    st(to_, from_, level2);
  }
}
function sta(level) {
  for (var traffic of trafficData) {
    for (var i of traffic.traffic) {
      i.avs = level*10;
    }
  }
}
function op(level) {
  st(bufTo, bufFrom, level);
}
*/