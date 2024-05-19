function addEventInfo(type) {
    $('#eventDescription').empty();
    var newDiv = document.createElement('div');
    if (channelConditionData[type].pie > 0) {
        console.log(type);
        console.log(channelConditionData[type]);
        if (channelConditionData[type].article.articleType == "SNS") {
            newDiv.innerHTML = '<div class="header" style="font-size: 16px;">' + channelConditionData[type].info.place + '</div>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 16px;">' + channelConditionData[type].info.time + '</div>';
            newDiv.innerHTML += '<hr><img style="width: 100%;" src=' + channelConditionData[type].article.image + '>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 14px;">' +
                '<hr><div  class="header" style="font-size: 12px; margin-bottom: 10px;">' + channelConditionData[type].article.writer + ' '
                + channelConditionData[type].article.writerID + '</div>' + '</div>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 14px;">' + channelConditionData[type].article.text + '</div>';
        }
        else if (channelConditionData[type].article.articleType == "article") {
            newDiv.innerHTML = '<div class="header" style="font-size: 16px;">' + channelConditionData[type].info.place + '</div>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 16px;">' + channelConditionData[type].info.start + ' ~ ' + '</div>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 14px;">' + channelConditionData[type].info.end + '</div>';
            newDiv.innerHTML += '<hr><img style="width: 100%;" src=' + channelConditionData[type].article.image + '>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 14px;">' + channelConditionData[type].article.title + '</div>';
            newDiv.innerHTML += '<div  class="header" style="font-size: 14px; text-align: left;">' + channelConditionData[type].article.text + '</div>';
            newDiv.innerHTML += '<hr><div  class="header" style="font-size: 12px; text-align: left;">' + channelConditionData[type].article.text2 + '</div>';
            newDiv.innerHTML += '<div class="header" style="font-size: 12px; text-align: center;"><출처: <a href="'+channelConditionData[type].article.url+'" class="header" style="font-size: 12px; text-align: center;">' + channelConditionData[type].article.writer + '</a>></div>';
        }
    }
    // 새로운 div를 기존의 div에 추가
    document.getElementById('eventDescription').appendChild(newDiv);
}