
function prepareCameraPreviews()
{
    $('#bigtext a[href*="ShowCameraLiveStream"] ').each(function(){
        var item = $(this).closest('.item');
        item.addClass('camera');
    });
    
    if (theme.features.dashboard_highlight_all.enabled === true){
                var selection = 'section .span4 .item:not(.keepclear) .bigtext a[href*="ShowCameraLiveStream"] ';
            }else{
                var selection = 'section .span4:nth-child(-n+3) .item:not(.keepclear) .bigtext a[href*="ShowCameraLiveStream"] ';
            }
    $(selection).each(function(){ //img[src~="' + camera + '"]
        console.log("THEME JS - found camera item, preparing it for live preview");
        var href = $(this).attr('href');
        var cameraidx = href.substring(href.lastIndexOf("','")+3,href.lastIndexOf("')"));
        console.log("camera ID = #" + cameraidx);
        var item = $(this).closest('.item');
        item.addClass('keepclear');
        item.find('.status').before('<div class="cameraPlayButtons"><button class="playpause playing"></button>'); //<br/><br/><span class="play" style="display:none">playing</span><span class="pause"></span></div>');
        item.find('.playpause').click(function(){
            $(this).toggleClass('playing');
            if($(this).hasClass('playing')){
                startcamera($(this));
                $(this).closest('.item').addClass('keepclear');
            }else{
                item.find('tr').css('background-image','none');
                $(this).closest('.item').removeClass('keepclear');
            }
            return false;
        });        
        startcamera($(this));
    });
}

function startcamera(cameraimg)
{
    var item = $(cameraimg).closest('.item');
    var href = item.find('.bigtext a[href*="ShowCameraLiveStream"]').attr('href');
    var cameraidx = href.substring(href.lastIndexOf("','")+3,href.lastIndexOf("')"));
    var newHREF = '/camsnapshot.jpg?idx=' + cameraidx + '&dtime=' + Math.floor(Date.now() / 1000);
    item.find('tr').css('background-image', 'url(' + newHREF + ')');
    setTimeout(updateCamImage, 100);
    function updateCamImage() {
        if(currentPage == "dashboard" && item.find('.cameraPlayButtons .playpause').hasClass('playing')){
            console.log("THEME JS - grabbing new camera image for #" + cameraidx);
            var newBG = 'background-image: url(/camsnapshot.jpg?idx=' + cameraidx + '&dtime=' + Math.floor(Date.now() / 1000) + ')!important;background-size:100%!important;background-position: center!important';
            //console.log(newBG);
            item.find('tr').attr('style', newBG);
            setTimeout(updateCamImage, 20000);
        }else{
            console.log("camera: no longer updating image.");
            item.find('tr').css('background-image','none');
        }
    }
}
