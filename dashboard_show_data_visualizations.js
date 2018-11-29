var datavizButtonsGenerated = false;

/*

ABOUT

sensor = Don't know why, but Domoticz needs you to specify for which type of sensor you are requesting data.
key = Which data from the device do you want? Some devices have multiple sensors. use "any" to just get the first one.
theid = the ID number of the item/device that the dataviz gets attached to.
range = Domoticz can take a range argument for the timeperiod for which it should get data (day, week, month, year). Not all types have week.

*/

/* Adds Data Visualisations to the first three items of each section. They will only be shown if highlights are enabled. */
addDataviz = function () 
{
    //if ($scope.config.DashboardType == 0) { // Only do all this on normal display.
        console.log("THEME JS - dataviz is enabled");
        setTimeout(function () { // small delay to make sure the main html has been generated, and to lower the burden on the system.
            
            //$('section .span3, section .span4').each(function(){
            
            if (theme.features.dashboard_highlight_all.enabled === true){
                var selection = "section .span4, section .span3";
            }else{
                var selection = "section .span4:nth-child(-n+3), section .span3:nth-child(-n+3)";
            }
            
            $(selection).each(function(){
                $(this).find('.item.temp:not(.bandmember):not(:has(.dataviz))').each(function(){
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this), "temp", "te");
                });
                $(this).find('.item.ice:not(.bandmember):not(:has(.dataviz))').each(function(){
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this), "temp", "te");
                });
                $(this).find('.item.percentage:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"Percentage", "any");
                });
                $(this).find('.item.lux:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "any");
                });
                $(this).find('.item.current:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                $(this).find('.item.custom:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"Percentage", "any");
                });
                $(this).find('.item.baro:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"temp", "ba");
                });
                $(this).find('.item.rain:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"rain", "mm");
                });								            
                $(this).find('.item.wind:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"wind", "sp");
                });
                $(this).find('.item.air:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "co2");
                }); 
                $(this).find('.item.speaker:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                $(this).find('.item.moisture:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                $(this).find('.item.uv:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"uv", "uvi");
                });
                $(this).find('.item.visibility:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                $(this).find('.item.radiation:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                $(this).find('.item.leaf:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                $(this).find('.item.thermostat:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"temp", "te");
                });
                $(this).find('.item.gauge:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"temp", "hu");
                });
                $(this).find('.item.scale:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
                /*       Waterflow uses same image as moisture but percent instead of counter as moisture but seem to work */
                $(this).find('.item.Waterflow:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"Percentage", "v");
                });
                $(this).find('.item.gasmeter:not(.bandmember):not(:has(.dataviz))').each(function () {
                    $(this).addClass('hasdataviz');
                    generateDataviz($(this),"counter", "v");
                });
            });
            
            if($('.datavizbtn').length < 1){
                console.log("THEME JS - adding dataviz buttons, they didn't exist yet");
                setTimeout(generateDatavizButtons,5000);
            }else{
                //console.log("dataviz buttons already existed");
            }
        }, 4250);
        
        // Create new  timer if it does not already exist
        if (typeof datavizTimer === 'undefined' || datavizTimer === null) {
            console.log("THEME JS - creating new Dataviz timer, updating dataviz every 5 minutes"); 

            if(typeof datavizTimer === "undefined"){
                datavizTimer = window.setInterval(addDataviz, 300000); // updates the dataviz every 5 minutes.
                console.log(datavizTimer);
            }
        }
    //}
}

function generateDatavizButtons(){
    console.log("THEME JS - generating dataviz buttons");
    
    var datavizButtons = '<div class="datavizbtn day active" data-i18n="Day">day</div><div style="display:none" class="datavizbtn month" data-i18n="Month">month</div>';
    
    if( !$('.datavizbtn').length ){
        $('.hasdataviz .dataviz:has(.highcharts-container)').append(datavizButtons);
    }

    $('.datavizbtn').click(function() {
        $(this).hide();
        var item = $(this).closest('.item');
        item.find('.dataviz > div > div').remove();
        var theid = item.parent().attr('id');
        var sensor = item.find('.dataviz > div').attr('data-sensor');
        var thekey = item.find('.dataviz > div').attr('data-thekey');
        //console.log("theid " + theid);
        //console.log("sensor " + sensor);
        //console.log("range " + range);
        //console.log("the key " + thekey);
        var range = "";
        if( $(this).hasClass('day') ){
            range = "month";
            item.addClass('dataviz-month').removeClass('dataviz-day'); 
            item.find('.datavizbtn.month').fadeIn(1000);
        }else{
            range = "day";
            item.addClass('dataviz-day').removeClass('dataviz-month');           
            item.find('.datavizbtn.day').fadeIn(1000);
        }
        generateDataviz(item, sensor, thekey);
    });    
}


generateDataviz = function (item, sensor, thekey) 
{
    var agent = '' + item.parent().attr('id');
    
    var range = "day";
    if(item.hasClass('dataviz-month')){
        range = "month";
    } 
        
    //var agent = '' + theid;
    var n = agent.lastIndexOf('_');
    var idx = agent.substring(n + 1);
    console.log('making dataviz for item: ' + agent);
    var urltoload = 'json.htm?type=graph&sensor=' + sensor + '&idx=' + idx + '&range=' + range;

    var datavizArray = [];
    $.getJSON(urltoload, function (data) {
        //console.log( "Dataviz - JSON load success" );
        if (typeof data.result != "undefined") {
            if (data.result.length > 4){
                if( item.find('.dataviz > div').length == 0){
                    $('<td class="dataviz"><div id="' + idx + '" data-sensor="' + sensor+ '" data-thekey="' + thekey+ '" class="' + range + '"></div></td>').insertBefore(item.find('.status'));
                }
                var showData = item.find('.dataviz > div');
                var modulo = 1
                if (data.result.length > 100) { modulo = 2; }
                if (data.result.length > 200) { modulo = 4; }
                if (data.result.length > 300) { modulo = 6; }
                if (data.result.length > 400) { modulo = 8; }
                if (data.result.length > 500) { modulo = 10; }
                if (data.result.length > 600) { modulo = 16; }
                for (var i in data.result) {
                    var key = i;
                    var val = data.result[i];
                    if ((i % modulo) == 0) { // this prunes and this limits the amount of datapoints, to make it all less heavy on the browser.
                        for (var j in val) {
                            var readytobreak = 0;
                            var key2 = j;
                            var val2 = val[j];
                            if (thekey != 'any') {
                                if (key2 == thekey) {
                                    //console.log("adding data");
                                    var addme = Math.round(val2 * 10) / 10;
                                    datavizArray.push(addme);
                                }
                            } else if (key2 != 'd') {
                                var addme = Math.round(val2 * 10) / 10;
                                datavizArray.push(addme);
                                readytobreak = 0
                            }
                            if (readytobreak == 1) { break; } // if grabbing "any" value, then break after the first one.
                        }
                    }
                }
                // Attach the datavizualisation
                if (datavizArray.length > 0) {
                    showData.highcharts({
                        chart: {
                            type: 'line',
                            backgroundColor: 'transparent',
                            plotBorderWidth: null,
                            marginTop: 0,
                            height: 40,
                            marginBottom: 0,
                            marginLeft: 0,
                            plotShadow: false,
                            borderWidth: 0,
                            plotBorderWidth: 0,
                            marginRight: 0
                        },
                        tooltip: {
                            userHTML: true,
                            style: {
                                padding: 5,
                                width: 100,
                                height: 30,
                                backgroundColor: '#FCFFC5',
                                borderColor: 'black',
                                borderRadius: 10,
                                borderWidth: 3,
                            },
                            formatter: function () {
                                return '<b>' + this.y + '</b>'; // (' + range + ')';
                            },
                            height: 30,
                            width: 30
                        },
                        title: {
                            text: ''
                        },
                        xAxis: {
                            gridLineWidth: 0,
                            minorGridLineWidth: 0,
                            enabled: false,
                            showEmpty: false,
                        },
                        yAxis: {
                            gridLineWidth: 0,
                            minorGridLineWidth: 0,
                            title: {
                                text: ''
                            },
                            showEmpty: true,
                            enabled: true
                        },
                        credits: {
                            enabled: false
                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            line: {
                                lineWidth: 1.5,
                                lineColor: '#cccccc',
                            },
                            showInLegend: true,
                            tooltip: {
                            }
                        },
                        exporting: {
                            buttons: {
                                contextButton: {
                                    enabled: false
                                }
                            }
                        },
                        series: [{
                            marker: {
                                enabled: false
                            },
                            animation: true,
                            name: '24h',
                            data: datavizArray //[19.5,20,17]  
                        }]
                    });
                }
            }
        }
    });
};
