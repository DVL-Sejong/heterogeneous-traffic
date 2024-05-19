var currentChannel;

// called by va-map.js
function updateCCTVList() {
  var $section = $('#cctv-list').removeClass('empty').empty();
  var bounds = map.getBounds();
  var we = [bounds.getWest(), bounds.getEast()];
  var sn = [bounds.getSouth(), bounds.getNorth()];

  for (var id in cctvData) {
    var channel = cctvData[id];

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
        .addClass('cctv-item')
        .addClass('cctv-item-' + channel.channel)
        .addClass(col)
        .data('channel', channel.channel)
        .text(channel.channel)
        .on('click', onCCTVItemClicked)
      );
    }
  }
}

function onCCTVItemClicked() {
  var channel = $(this).data('channel');
  $('#cctv-list .cctv-item').removeClass('selected');
  $(this).addClass('selected');
  runCCTVVideo(channel);
}

function runCCTVVideo(channel) {
  var name = cctvData[channel].cctvStrtSecnNm;
  $.ajax({
    method: 'get',
    url: 'video/' + channel,
    cache: false
  }).done(function(html) {
    $('#cctv-video')
      .removeClass('empty')
      .html(html);
    
    currentChannel = channel;
    console.log('CCTV 재생: ' + channel + ', ' + name);
    $('input[name=cctv_direction][value=ne]').prop('checked', true);
  });
}
