var trafficConditionData;
var trafficConditionData2;

function loadTrafficConditionData() {
  $.ajax({
    method: 'get',
    url: `static/traffic_condition.json`,
    dataType: 'json',
    cache: false
  }).done(function (data){
        trafficConditionData = data;
        trafficConditionData2 = data;
  });
}

function getTrafficConditionText(channel){
  $('#trafficConditionText').empty();
  $('#trafficConditionText').text(channelConditionData.direction);
  $('#trafficConditionPerText').text(channelConditionData.percent);
}

$(document).ready(function() {
  //App.init();
  //App.formElements();
  rankHeight = document.querySelector("#replaceRank").offsetHeight
  sankeyWidth = document.querySelector("#sankeyDiagram").offsetWidth;
  sankeyHeight = document.querySelector("#sankeyDiagram").offsetHeight;
  pieHeight = document.querySelector("#eventPie1").offsetHeight * 1.3;
  $('#eventArea').hide();
  $('#applyMap2').hide();
  loadTrafficConditionData();
});