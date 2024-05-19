var map2;
var cctvData2 = {};
var placeData2 = {};
var trafficData2 = [];
var routeData2 = {};

var trafficDataQueue2;
var trafficDataName2;


function regenerateTrafficConditionData(from, to) {
    var fromOriVol, toOriVol;
    fromOriVol = trafficConditionData[from].volume * (100 / (trafficConditionData[from].percent + 100));

    toOriVol = trafficConditionData[to].volume * (100 / (trafficConditionData[to].percent + 100));

    trafficConditionData2[from].percent = ((trafficConditionData2[from].volume - fromOriVol) / fromOriVol) * 100;
    trafficConditionData2[to].percent = ((trafficConditionData2[to].volume - toOriVol) / toOriVol) * 100;
    console.log(trafficConditionData[from].volume, trafficConditionData2[from].volume, fromOriVol);
    console.log(trafficConditionData[from].percent, trafficConditionData2[from].percent);
    console.log(trafficConditionData[to].volume, trafficConditionData2[to].volume, toOriVol);
    console.log(trafficConditionData[to].percent, trafficConditionData2[to].percent);

    if (trafficConditionData[from].event.pie > 10) {
        trafficConditionData2[to].event = trafficConditionData[from].event;
        trafficConditionData2[to].event.pie -= 10;
    }
    if (trafficConditionData[from].accident.pie > 10) {
        trafficConditionData2[to].accident = trafficConditionData[from].accident;
        trafficConditionData2[to].accident.pie -= 10;
    }
    if (trafficConditionData[from].construction.pie > 10) {
        trafficConditionData2[to].construction = trafficConditionData[from].construction;
        trafficConditionData2[to].construction.pie -= 10;
    }

    trafficConditionData = trafficConditionData2;
    drawMap();
}

// 메인
function makeUnderMap(from, to) {
    $('#applyMap2').show();
    $('#map2').empty();

    var CustomControl = function () {
    };
    CustomControl.prototype.onAdd = function (map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'button mapboxgl-ctrl';
        this._container.textContent = '적용';
        this._container.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this._container.style.borderRadius = '10px';
        this._container.style.border = '2px solid #1f1f1f';
        this._container.style.color = '#ffff';
        this._container.style.padding = '10px';
        this._container.style.border = 'none';
        this._container.style.cursor = 'pointer';

        // 버튼 클릭 이벤트 처리
        this._container.addEventListener('click', function () {
            regenerateTrafficConditionData(from, to);
        });

        return this._container;
    };

    var customControl = new CustomControl();

    mapboxgl.accessToken = mapboxToken;
    map2 = new mapboxgl.Map({
        container: 'map2',
        style: 'mapbox://styles/kharisma11/ck9m5mk1b0ps11io8iets480d',
        center: [127.0455, 37.515],
        zoom: 12.7
    });
    // 지도 로드 시 호출되는 콜백
    map2.on('load', function () {
        // 노드 아이콘을 사용하기 위해 지도에 추가함
        for (var i = 1; i <= 3; i++) {
            addImage(i);
        }

        function addImage(i) {
            map2.loadImage('static/img/node/' + i + '.png', function (error, image) {
                if (error)
                    throw error;
                map2.addImage('node2-' + i, image);
            });
        }

        // 장소 데이터(place_data.json) 요청
        $.ajax({
            method: 'get',
            url: 'static/place_data.json',
            dataType: 'json',
            cache: false,
            async: false
        }).done(onPlaceDataResponse2);

        // CCTV 데이터(cctv_data.json) 요청
        $.ajax({
            method: 'get',
            url: 'static/cctv_data.json',
            dataType: 'json',
            cache: false
        }).done(onCCTVDataResponse2);
    });
    /*
    // CCTV 아이콘에 마우스 올릴 시 tooltip
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    map.on('mouseenter', 'cctv', function(e) {
      map2.getCanvas().style.cursor = 'pointer';
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
        .addTo(map2);
    });
    // CCTV 아이콘에서 마우스 떠날 때
    map2.on('mouseleave', 'cctv', function() {
      map2.getCanvas().style.cursor = '';
      popup.remove();
    });
    */
    map2.addControl(customControl);
}


function updateCCTVList2() {
    var $section = $('#cctv2-list').removeClass('empty').empty();
    var bounds = map2.getBounds();
    var we = [bounds.getWest(), bounds.getEast()];
    var sn = [bounds.getSouth(), bounds.getNorth()];

    for (var id in cctvData2) {
        var channel = cctvData2[id];

        if (channel.x >= we[0] && channel.x <= we[1] && channel.y >= sn[0] && channel.y <= sn[1]) {
            var col = '';
            var random = Math.floor(Math.random() * 18);
            if (channel.channel == 6092)
                col = 'red';
            else if (random < 6)
                col = 'blue';
            else if (random < 18)
                col = 'green';

            $section.prepend($('<div>')
                .addClass('cctv2-item')
                .addClass('cctv2-item-' + channel.channel)
                .addClass(col)
                .data('channel', channel.channel)
                .text(channel.channel)
            );
        }
    }
}


function onCCTVDataResponse2(data) {
    cctvData2 = data;

    // CCTV 데이터를 지도에 반영하기 위해 geojson 형식으로 구성함
    var geojson = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    for (var id in cctvData2) {
        var channel = cctvData2[id];
        if (channel == undefined)
            continue;

        var direction = 0;

        if (trafficConditionData2.hasOwnProperty(channel.channel.toString())) {
            if (trafficConditionData2[channel.channel.toString()].direction == "원활")
                direction = 1;
            else if (trafficConditionData2[channel.channel.toString()].direction == "정체")
                direction = 2;
            else if (trafficConditionData2[channel.channel.toString()].direction == "혼잡")
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
        geojson.data.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [channel.x, channel.y]
            },
            properties: {
                direction: direction,
                channel: channel.channel,
                name: channel.cctvStrtSecnNm + '_2'
            }
        });
    }

    // 지도에 CCTV 데이터 반영
    map2.addSource('cctv2', geojson);
    map2.addLayer({
        id: 'cctv2',
        type: 'symbol',
        source: 'cctv2',
        layout: {
            'icon-image': 'node2-{direction}',
            'icon-size': .2,
            'icon-allow-overlap': true
        }
    });

    // Video sampling 섹션의 CCTV 목록 갱신
    updateCCTVList2();
}

// 메인에서 요청한 장소 데이터 response되었을 때 호출됨
function onPlaceDataResponse2(data) {
    placeData2 = data;
    loadTrafficData2('traffic_data_f');
}

// 트래픽 데이터 요청하는 메소드
function loadTrafficData2(filename) {
    trafficDataQueue2 = filename;
    $.ajax({
        method: 'get',
        url: `static/${filename}.json`,
        dataType: 'json',
        cache: false
    }).done(onTrafficDataResponse2);
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
function onTrafficDataResponse2(data) {
    trafficDataName2 = trafficDataQueue2;
    trafficData2 = data;
    for (var traffic of trafficData2) {
        routeData2[traffic.from + '-' + traffic.to] = traffic;
    }

    // timeline
    var volume = [];
    for (var i = 0; i < 24; i++)
        volume[i] = 0;
    for (var traffic of trafficData2) {
        for (var tpb of traffic.traffic) {
            volume[tpb.time] += tpb.volume;
        }
    }
}
