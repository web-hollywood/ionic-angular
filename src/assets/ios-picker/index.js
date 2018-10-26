$(function(){
    hours = [];
    minutes = [];
    for(var i=0; i<=10; i=i+1) {
        $('#pagehour').append("<option value='"+i+"'>"+i+"</option>");
        $('#pagehour_finish1').append("<option value='"+i+"'>"+i+"</option>");
        hours.push(i);
    }
    for(var i=0; i<=60; i=i+2) {
        $('#pageminute').append("<option value='"+i+"'>"+i+"</option>");
        $('#pageminute_finish1').append("<option value='"+i+"'>"+i+"</option>");
        minutes.push(i);
    }

    $("#pagehour_picker").picker({
        data: hours,
        lineHeight: 30,
        selected: 0
    }, function (s) { 
        i = $('.output').html();
        $('#pagehour').val(hours[i]);
    });
    $("#pageminute_picker").picker({
        data: minutes,
        lineHeight: 30,
        selected: 10
    }, function (s) {
        i = $('.output').html();
        $('#pageminute').val(minutes[i]);
    });

    $("#pagehour_finish1_picker").picker({
        data: hours,
        lineHeight: 30,
        selected: 0
    }, function (s) {
        i = $('.output').html();
        $('#pagehour_finish1').val(hours[i]);
    });
    $("#pageminute_finish1_picker").picker({
        data: minutes,
        lineHeight: 30,
        selected: 10
    }, function (s) {
        i = $('.output').html();
        $('#pageminute_finish1').val(minutes[i]);
    });
})