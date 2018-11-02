var alreadyAnimated = false;

function mergeItems()
{
    console.log("THEME JS - merging items");    

    // create a hidden parking space for the merged items. That way Domoticz still updates their data, and then this theme scrapes that data.
    if(!$('#dashcontent > #hiddenmerged').length){
        $('#dashcontent').append('<div id="hiddenmerged"></div>');
        $('#dashcontent > #hiddenmerged').hide();
    }

    // If it doesn't exist yet, create the list of items that should be merged into 'bands'.
    if(isEmptyObject(bands) && currentPage == "dashboard"){
        console.log("THEME JS - bands was empty, recreating list");

        //Lets find the possible 'bands' first, and store them in an object. 
        var $suspects = $('section:not(#dashScenes) .item:not(:has(.selectorlevels)):not(:has(.btn-group)):not(:has(.img2))').parent();
        // For a future more precise version: don't select items with .selectorlevels .img2
        
        $suspects = $suspects.filter(function(index) {
            if($('.options > div', this).length == 0 && $(this).find('.name span:contains("-")').length == 1){   
                return true;
            }
        })
        //console.log("THEME JS - suspected bandmembers count: " + $suspects.length);
        if($suspects.length == 0){
            console.log("THEME JS - Nothing to merge (yet)");
            return;
        }
        $suspects.each(function () {
            var oldname = $(this).find('.name span').text();
                bandname = oldname.substr(0, oldname.indexOf('-')); 
            var bandnameClass = machineName(bandname);
            var instrument = oldname.split('-')[1];
                instrument = instrument.trim().toLowerCase();   
            var bandmemberID = "" + $(this).attr("id");
            if(!bands[bandname]){
                bands[bandname] = [];
            }
            bands[bandname].push({"id":bandmemberID,"instrument":instrument});
        });
        // Remove solo acts from the object.
        $.each(bands, function(key,value){
            if(value.length == 1){
                delete bands[key];
            }
        });
        console.log(bands);
    }else{
        console.log("THEME JS - merging: bandlist existed.");
    }
    
    // Now to do the actual merging
    $.each(bands, function(key,member){
        //console.log("THEME JS - merging " + key);
        var bandnameClass = machineName(key);
        var bandsizeClass = "statuscount" + member.length;
        //console.log("bandleader (0) id = " + member[0].id);
        //console.log("wrapper count " + $("#" + member[0].id + " .status > .wrapper > span").length);
        //console.log("member length " + member.length);
        
        // Check if we have done the preparation before
        if($("#" + member[0].id + " .item .status > .wrapper > span ").length != member.length){
            
            // upgrading bandleader to hold bandmembers data
            console.log("THEME JS - upgrading bandleader" + member[0].id);
            $("#" + member[0].id + " .item").removeClass (function (index, className) {
                return (className.match (/(^|\s)statuscount\S+/g) || []).join(' ');
            });
            
            //$("#" + member[0].id).hide();
            $("#" + member[0].id + " .item").removeClass('withoutstatus').addClass("bandleader withstatus").addClass(bandsizeClass);
            $("#" + member[0].id + " .item .status > span").remove();
            $("#" + member[0].id + " .item .status").append('<span class="wrapper"></span>');
            $("#" + member[0].id + " .item .status").show();
            $("#" + member[0].id + " .item .status").removeClass('status');
            if($("#" + member[0].id + " .item .status").length == 0){
                $("#" + member[0].id + " .item #status").after( '<td class="status"><span class="wrapper"></span></td>' );
                $("#" + member[0].id + " .item #status").hide();
            }
            // prepare space for each bandmember's icon and data
            $.each(member, function(index, memberProperties){
                $("#" + memberProperties.id + " .item").addClass(bandnameClass).addClass("bandmember");
                var newSpan = '<div class="iconholder' + index +'"></div><span class="value' + index +'"></span>';
                $("." + bandnameClass + ".bandleader .status > .wrapper").append(newSpan);
            });
            // hide bandmembers that are not the band leader
            $('.' + bandnameClass).show();
            if( theme.features.extras_and_animations.enabled == true && alreadyAnimated == false){
                $('.' + bandnameClass + '.bandleader').parent().hide();
                $('.' + bandnameClass + '.bandleader').parent().slideDown(1500);
                $('.' + bandnameClass + ':not(.bandleader)').slideUp(1500, function(){
                    $('.' + bandnameClass + ':not(.bandleader)').parent().appendTo('#hiddenmerged');
                });
            } else{
                $('.' + bandnameClass + ':not(.bandleader)').parent().hide();
                $('.' + bandnameClass + '.bandleader').parent().show();
                $('.' + bandnameClass + ':not(.bandleader)').parent().appendTo('#hiddenmerged'); 
            }
        } else{
            console.log("merging: bandleader already prepared");
        }

        $.each(member, function(index, memberProperties){
            // put some text form status into bigtext, so that it also gets merged into the new item.
            var rawtext = $("#" + memberProperties.id + " .item.Text .status").text();
            var shorttext = rawtext.substring(0, 25);
            $("#" + memberProperties.id + " .item.Text .bigtext").text(shorttext);
        });

        // copy values and images from bandmembers to the bandleader
        $.each(member, function(index, memberProperties){
            // Remove old images, and replace with updated image.
            $("." + bandnameClass + ".bandleader .status > .wrapper > .iconholder" + index + " > a").remove();
            $("#" + memberProperties.id + " .img a").clone().appendTo($("." + bandnameClass + ".bandleader .status > .wrapper > .iconholder" + index));
            // Copy new data values into span holders.
            var newValue = ""+ $("#" + memberProperties.id + " .bigtext").text();
            var doublecheck = newValue.toLowerCase();
            if(doublecheck.indexOf(memberProperties.instrument) != -1){
                newValue = newValue.toLowerCase();
                newValue = newValue.replace(memberProperties.instrument,'');
            }
            newValue = memberProperties.instrument + ": " + newValue;
            $("." + bandnameClass + ".bandleader .status > .wrapper > span.value" + index).text(newValue);
            if(index != 0){
                $("#" + memberProperties.id).css('opacity','.5');
            }
        });
        
        // clean up band leader
        $("#" + member[0].id + " .item .name > span").html('<span>' + key + '</span>');
        $("#" + member[0].id + " .item .bigtext").hide();
        $("#" + member[0].id + " .item .img").hide(); // hide original image
        $("#" + member[0].id + " .item .status a").show(); // show new image inside status td
        
        //dramatic entrance
        if( theme.features.extras_and_animations.enabled == true && alreadyAnimated == false){
            $("#" + member[0].id).slideDown( 1500 );
        }else{
            $("#" + member[0].id).show();
        }
    });
    alreadyAnimated = true;
    // If a column is empty now, then it should be removed.
    $('section:not(:has(.item))').hide();
}

