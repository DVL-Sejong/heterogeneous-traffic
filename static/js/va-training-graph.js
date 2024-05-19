$(document).ready(function() {
  $('#dg-remove').on('click', function() {
    $('#directed-graph').empty();
  });
  $('#dg-estimation').on('click', function() {
    alert('Complete');
  });
  $('#dg-apply').on('click', function() {
    $('#timeslider').bootstrapSlider('setValue', 6);
    onTimesliderChanged();
  });
});

// called by va-map.js
function drawForceDirectedGraph(places) {
  var data = convertPlaceDataToFDGData(places);

  var colors = d3.scaleOrdinal(d3.schemeCategory10);
  var section = d3.select('#directed-graph').html(''),
    width = parseInt(section.style('width')) - parseInt(section.style('border-left-width')) - parseInt(section.style('border-right-width')),
    height = parseInt(section.style('height')) - parseInt(section.style('border-top-width')) - parseInt(section.style('border-bottom-width')),
    node,
    link;
  var svg = section.append('svg')
    .attr('width', width)
    .attr('height', height);

  var defs = svg.append('defs');

  defs.append('marker')
    .attrs({
      'id':'arrowhead',
      'viewBox':'-0 -5 10 10',
      'refX':22,
      'refY':0,
      'orient':'auto',
      'markerWidth':13,
      'markerHeight':13,
      'xoverflow':'visible'})
    .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke','none');
  
  for (var i = 1; i <= 8; i++) {
    defs.append('pattern')
      .attrs({
        'id': 'node-' + i,
        'x': 0,
        'y': 0,
        'patternUnits': 'objectBoundingBox',
        'width': '30px',
        'height': '30px'
      })
      .append('image')
        .attrs({
          'x': 0,
          'y': 0,
          'xlink:href': '/static/img/node/' + i + '.png',
          'width': '30px',
          'height': '30px'
        });
  }

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(50).strength(1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  /*d3.json("/static/graph.json", function (error, graph) {
    if (error) throw error;
    update(graph.links, graph.nodes);
  })*/
  update(data.links, data.nodes);

  function update(links, nodes) {
    link = svg.selectAll(".link")
      .data(links)
      .enter()
      .append("line")
        .attrs({
          'class': 'link',
          'stroke': function(d) {
            if (d.edgeCount == 1) return '#3690c0';
            else if (d.edgeCount == 0) return '#ff0000'; 
            return '#999';
          },
          'stroke-width': function(d) {
            if (d.edgeCount != 2) return '5px';
            return '1px';
          }
        });

    link.append("title")
      .text(function (d) {return d.type;});

    edgepaths = svg.selectAll(".edgepath")
      .data(links)
      .enter()
      .append('path')
      .attrs({
        'class': 'edgepath',
        'fill-opacity': 0,
        'stroke-opacity': 0,
        'id': function (d, i) {return 'edgepath' + i}
      })
      .style("pointer-events", "none");

    /*edgelabels = svg.selectAll(".edgelabel")
      .data(links)
      .enter()
      .append('text')
      .style("pointer-events", "none")
      .attrs({
        'class': 'edgelabel',
        'id': function (d, i) {return 'edgelabel' + i},
        'font-size': 10,
        'fill': '#aaa'
      });

    edgelabels.append('textPath')
      .attr('xlink:href', function (d, i) {return '#edgepath' + i})
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .attr("startOffset", "50%")
      .text(function (d) {return d.type});*/

    node = svg.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        //.on("end", dragended)
      );

    node.append("circle")
      .attr("r", 15)
      //.style("fill", '#FFF')
      //.style("stroke", function (d, i) {return colors(i);})
      .style("fill", function(d) {
        var direction = 1;
        if (d.direction) direction = d.direction;
        return `url(#node-${direction})`;
      });

    node.append("title")
      .text(function (d) {return d.id;});

    node.append("text")
      .attr("dx", "1em")
      .attr("dy", "1.2em")
      .attr("font-size", "12px")
      .text(function (d) {return d.name;})
      .style("fill", function(d) {
        return (d.direction > 1)? 'rgb(192,0,0)': null;
      });

    simulation
      .nodes(nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(links);
  }

  function ticked() {
    link
      .attr("x1", function (d) {return d.source.x;})
      .attr("y1", function (d) {return d.source.y;})
      .attr("x2", function (d) {return d.target.x;})
      .attr("y2", function (d) {return d.target.y;});

    node
      .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

    edgepaths.attr('d', function (d) {
      return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
    });

    /*edgelabels.attr('transform', function (d) {
      if (d.target.x < d.source.x) {
        var bbox = this.getBBox();

        rx = bbox.x + bbox.width / 2;
        ry = bbox.y + bbox.height / 2;
        return 'rotate(180 ' + rx + ' ' + ry + ')';
      }
      else {
        return 'rotate(0)';
      }
    });*/
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
}

function convertPlaceDataToFDGData(places) {
  var graphData = {
    nodes: [],
    links: []
  };

  for (var cctv in places) {
    var place = places[cctv];
    var channel = cctvData[place.cctv];

    graphData.nodes.push({
      id: place.cctv,
      name: place.cctv,
      direction: channel.direction
    });

    for (var linked of place.linked) {
      var linkedPlace = placeData[linked];
      if (linkedPlace && places[linkedPlace.cctv]) {
        var linkData = {
          source: place.cctv,
          target: linkedPlace.cctv,
          edgeCount: 0
        };
        var edgecount = 0;
        for (var traffic of trafficData) {
          if (traffic.from == place.name && traffic.to == linkedPlace.name) {
            for (var t of traffic.traffic) {
              if (t.avs >= 0)
                edgecount++;
            }
          } else if (traffic.from == linkedPlace.name && traffic.to == place.name) {
            for (var t of traffic.traffic) {
              if (t.avs >= 0)
                edgecount++;
            }
          }
        }
        linkData.edgeCount = edgecount;
        graphData.links.push(linkData);
      }
    }
  }
  
  return graphData;
}
