/*  blockly function to import and export creations  */

function makeBlocklyExportHTML()
{
    $.ajax({
        url: "/json.htm?type=events&param=list",
        async: true,
        dataType: 'json',
        success: function (data) {
            if (data.status == "ERROR") {
                $('#exportpopup').append('<div><h3>Domoticz returned an error.</h3></div>');
                console.log("server responded with error while getting user variables");
            }
            // If we got good data from Domoticz:
            if (typeof data.result !== "undefined") {
                console.log(data.result);
                $.each(data.result, function(variable, value) {
                    console.log("THEME JS - adding " + value.name + " to the export list");
                    console.log( value.name );
                    var appendme = '<li class="' +  value.id + '">' + value.name + '</li>';
                    $('#exportpopup ul').append(appendme);
                })
                $( "#exportpopup ul li" ).each(function(index) {
                    $(this).on("click", function(){
                        var id = $(this).attr('class'); 
                        getExportCode(id)
                    });
                });
            }
        },
        error: function () {
            $('#exportpopup').append('<div><h3>Error communicating with Domoticz</h3></div>');
            console.log("The theme was unable to get data from Domoticz");
        }
    });
}


function getExportCode(id)
{   
    var getThis = '/json.htm?type=events&param=load&event=' + id;
    $.get( getThis, function( data ) {
        console.log(data);
        console.log("interpreter: " + data.result[0].interpreter);
        if(data.result[0].interpreter == "Blockly"){
            var prepend = 'name=' + escape(data.result[0].name) + '&interpreter=Blockly&eventtype=All&xml=';
            console.log("prepend is " + prepend);
            var codeHTML = ''+ prepend + encodeURIComponent(data.result[0].xmlstatement);
            $('#exportpopupcode').html( codeHTML );
            $('#exportpopupcode').fadeIn('slow');
            $('#exportcodeheader').fadeIn('fast');

        }else{
            $('exportpopup li.' + id).hide();
            $('#exportcodeheader').hide();
            $('#exportpopupcode').html('Sorry, not a Blocky.');
        }
    });
    
    $('#blocklycopytoclipboard').click(function() {
        $('#exportpopupcode').focus();
        $('#exportpopupcode').select();
        document.execCommand("copy");
    });
}


function blocklyExport()
{
    console.log("Clicked export");
    HideNotify();
    var alertString = '<div id="exportpopup"><h2>Choose event:</h2><div id="exportpopupmenu"><ul></ul></div><div id="exportcodeheader"><h2 id="copythiscode">Share this code:</h2><button class="btn btn-info" id="blocklycopytoclipboard">Copy to clipboard</button></div><textarea id="exportpopupcode"></textarea> </div>';
    bootbox.alert(alertString);
    setTimeout(makeBlocklyExportHTML,300);
}


function blocklyImport()
{
    console.log("Clicked import");
    HideNotify();
    var alertString = '<div id="importpopup"><h2>Paste in the Blockly code to import: </h2><div><textarea id="textareaholder"></textarea></div><div id="importpopupfooter"><button class="btn btn-info" id="startblocklyimportbtn">Import</button></div>'
    bootbox.alert(alertString);
    setTimeout(createSaveButton,300);
    
    function createSaveButton(){
        $( "#startblocklyimportbtn" ).click(function() {
            var importData = $('#textareaholder').val();
            saveBlocklyImport(importData);
        });
    }
}


function saveBlocklyImport(importData)
{
    HideNotify();
    bootbox.alert('<h2>Blockly imported</h2></p>Refresh the page to see it.</p>');
    if(importData == "" || typeof importData === "undefined"){return}
    var importString3 = '&logicarray={"eventlogic":[{"conditions":"","actions":""}]}&eventid=&eventstatus=0';
    var saveString = importData + importString3;
    //console.log("save string = " + saveString);
    $.ajax({
        url: "/event_create.webem",
        type: "POST",
        data: saveString,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        processData: false, // avoid the data being parsed to query string params
        success: function(r) {
            console.log("THEME JS - import: apparent success");
        },
        error: function(r) {
            console.log("THEME JS - import: error sending data to domoticz");
        }
    });  
}