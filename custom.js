/*  

Dear themer 

You can use this file to add your own javascript functions to your theme. 

Some useful things to get you started:

1.
To find out which classes are available to you, have a look at the page on the WIKI about theming.
http://domoticz.com/wiki/How_to_theme_Domoticz


2.
Here are some snippets you may find useful:

- Check is a theme feature is enabled: 
if (theme.features.featurename.enabled === true) { // do something here}

- Check if the user is on a mobile device
if(  $('body#onmobile') ) { // do something here }



HOW THIS THEME WORKS

- It stores all data in a local storage object called 'theme'.
- it syncs that data with Domoticz, but only which features are enabled. Design settings are only stores in the browser (for now).
- Once the theme has checked in with Domoticz to check the stored features list, it loads all the relevant JS and CSS files.

- It hooks into Domoticz by responding to succesful ajax queries, watching for page changes, and listenening for variable changes. 


If the entire app is just starting:
document.ready -> themeLoadObject -> checkIfDomoticzHasThemeSettings -> get settings from domoticz (2x) -> enable theme features -> load theme featuers
Most of these functions are at the top half of this document.

If the user changes to a new view:
pageChangeDetected ->load observer & ajax(in DocumentReady) ->

    The 'waterfall' of changes then starts:
    1. frontendImporvement: when a new 'page' is loaded, like the dashboard or settings, for example. It removes all the divider row.
    2. improve classes. This adds lots of html that is required to other fuctions to work. This must often be re-added, as Domoticz 
        likes to overwrite the html a lot. Especiallt on the weather and temperature pages, which rely heavily on the JS framework, 
        but which is really unwieldy an slow.
    3. new data: this is a response to sensors and other items being continuously updated. The theme tries to quickly style these responses.

This waterfall also starts on numerous other occasions, like when new data arrives (ajax in DocumentReady), when a canary observer spots 
changes, when the load observer spots bigchanges, or sometimes just through an 'oldschool' setTimeout function that just keeps checking if 
things have loaded.

The theme also adds a settings tab when the settings page is opened. This has its own little waterfall at the bottom of this document.

At the very bottom of this document you will find helper functions.


OTHER DETAILS

The theme adds tags to the HTML to make theming easier. Important tags you may want to look into:
- item. This is the core div for each item where all the classes are added
- Bandleader & bandmember. These are for merged items. The bandleader gathers all data, and the other bandmembers are hidden in a hidden div.
- withstatus & statuscount. This defines if an item has multiple datafeeds to display.
- on/of. This reflects if a switch is on or off.
- sensor type tags. Sensors get tags, based on the image they have.

*/

var folder = "";
var theme = {}; // object that holds all the theme settings
var bands = {}; // object that holds all the items to be merged
var currentPage = "login";
var frontend = true;
var onMobile = false;
var themeMachineName = "";
var lastOpenedBlockly = {};
var fullscreenPossible = false;
var lastPrivacyPrunedTime = 0;
//var oldLastUpdateTime = 0; // used to check if domoticz has incorporated new updated data.
var freshJSON = {}; // the latest data from domoticz.
//var newDataWatcherIsRunning = false;
var lastUpdateWatcherisRunning = false;
var clockIsRunning = false;
var limbo = true; // When on a new page, but items have not loaded yet.
var waterfallRunning = false; // If the upgrade proces is already running, then no need to run it again.
var rerunImprovement = false; // if improvements called while already running, this helps run it again after it's done.
var loadedThemeObject = false;
var loadedSettingsFromDomoticz = false;
var loadedThemeCSSandJS = false;

var baseURL = "";

/*
try {
    var pathArray = location.href.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    console.log("folder = " + pathArray[3]);
    if (pathArray[3] != "" && pathArray[3].charAt(0) != "#") { folder = "/" + pathArray[3] } // pathArray[3]!="#") && 
    var baseURL = protocol + '//' + host + folder;
    console.log("base URL = " + baseURL);
}
catch (e) {
    console.log("THEME JS - ERROR: not able to find out what the base path is.");
    $.get('/json.htm?type=command&param=addlogmessage&message=Theme Error - the theme is not able to find out what the base path is.');
}
*/


// for debugging:
//localStorage.clear();


// this function sets the body ID to reflect if we ae on a mobile device or not.
function areWeOnMobile(){
    console.log("THEME JS - areweonmobile: checking if on mobile device");
    // mobile device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        $("body").attr('id', 'onMobile');
        document.body.setAttribute("id", "onMobile");
        $('body').attr('id', 'onMobile');
        onMobile = true;
    } else {
        if (typeof theme.name !== "undefined") {
            if (theme.features.mobile_phoney.enabled === true && theme.features.mobile_on_non_mobile.enabled === true) {
                console.log("THEME JS - setting mobile tag on non-mobile device");
                //document.body.setAttribute("id", "onMobile");
                $('body').attr('id', 'onMobile');
                onMobile = true;
            } else {
                //document.body.setAttribute("id", "notMobile");
                $('body').attr('id', 'notMobile');
                onMobile = false;
            }
        }
    }
    if (frontend === true) {
        $("body").addClass('frontend').removeClass('backend'); // a small quick hack to find out why these tags are disappearing. Probably domoticz doing that.
    }
}


// This function is the start of loading the theme settings. It loads an object with all the settings from the theme.json file.
// Form then on it checks if Domoticz has alternative settings to the defaults.
function themeLoadObject() {
    console.log("THEME JS - starting processes of loading theme preferences");
    // If there are no locally stored settings yet, then load defaults from server.
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("themeObject") === null) {
            console.log("THEME JS - No locally stored theme object found, now loading the theme json.");
            loadJSON('styles/aurora/theme.json',
                function (themex) {
                    theme = themex; // set global object
                    console.log("THEME JS - Theme name = " + theme.name);
                    themeMachineName = machineName(theme.name);
                    if (isEmptyObject(theme) === false) {
                        localStorage.setObject("themeObject", theme);
                    }
                    console.log("+++ theme object succesfully loaded from theme.json file, and stored in local storage");
                    pageChangeDetected(); // continue with the first-load checklist.
                //checkIfDomoticzHasThemeSettings(); // if there were no local settings, perhaps Domoticz also has no settings. Let's make sure.
                }, function(xhr) { console.error(xhr); }
            );
        } else { // If local preferences have been set, try to load those.
            console.log("THEME JS - theme object was already found in the browser.");
            theme = localStorage.getObject("themeObject");
            console.log(theme);
            themeMachineName = machineName(theme.name);
            pageChangeDetected();
        }
    } else {
        // FALL BACK. No Web Storage support.. Old browser? Loading backup css file.
        var CSSfile = "styles/aurora/oldbrowser.css";
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", CSSfile);
        document.getElementsByTagName("head")[0].appendChild(fileref);
        console.log("-----------");
        console.log("THEME JS - IMPORTANT: BROWSER CANNOT REALLY RUN THIS THEME, IT DOES NOT SUPPORT LOCAL STORAGE.");
        console.log("-----------");
        /*HideNotify();
        bootbox.alert($.t('This browser cannot really run this theme because it does not support "local storage".'));*/
        $.get('/json.htm?type=command&param=addlogmessage&message=Theme Error - your browser does not support local storage, so cannot save preferences.');
    }
}


// No local settings found in the browser. Local json files was loaded as default. The next step is checking for settings inside Domoticz, and to update the preferences from that, if possible. This will take a while..
function checkIfDomoticzHasThemeSettings() 
{
    $.ajax({
        url: "/json.htm?type=command&param=getuservariables",
        async: true,
        dataType: 'json',
        success: function (data) {
            if (data.status == "ERR") {
                console.log("server responded with error while getting user variables");
                $.get('/json.htm?type=command&param=addlogmessage&message=Theme Error - The theme was unable to load your preferences from Domoticz.');
            }
            // If we got good data from Domoticz, load the preferences.
            else if (typeof data.result !== "undefined") {
                var didDomoticzHaveSettings = false;
                var featuresVarName = "theme-" + themeMachineName + "-features";
                var stylingVarName = "theme-" + themeMachineName + "-styling";
                
                $.each(data.result, function(variable, value) {
                    console.log("looping over user variables list");
                    if(value.Name == featuresVarName){
                        console.log("THEME JS - found theme feature settings in Domoticz database (user variable #" + value.idx + ")");
                        didDomoticzHaveSettings = true;
                        theme.userfeaturesvariable = value.idx;
                        getThemeFeatureSettingsFromDomoticz(value.idx);
                    }
                    if(value.Name == stylingVarName){
                        console.log("THEME JS - found theme styling settings in Domoticz database (user variable #" + value.idx + ")");
                        didDomoticzHaveSettings = true;
                        theme.userstylingvariable = value.idx;
                        getThemeStylingSettingsFromDomoticz(value.idx);
                    }
                });
                if(didDomoticzHaveSettings === false){
                    console.log("THEME JS - Domoticz didn't have settings for the theme, will create them now from defaults.");
                    enableThemeFeatures(); // load defaults from the object
                    storeThemeSettingsInDomoticz("add"); // store new default settings in Domoticz, for next time..
                }else{
                    console.log("THEME JS - Succesfully received user variable numbers from Domoticz.");
                }
            } else {
                console.log("User variable list: data.result was undefined. So the list must be completely empty. Time to save the variables.");
                if(typeof theme.name !== "undefined"){
                    storeThemeSettingsInDomoticz("add");
                    enableThemeFeatures();
                }
            }
        },
        error: function () {
            console.log("The theme was unable to check if Domoticz had theme settings. Permission denied? Still on login page? No connection? Stopping..");
        }
    });
}


// here we get the styling preferences that are stored in Domoticz (colors, background image)
function getThemeStylingSettingsFromDomoticz(idx)
{
    console.log("THEME JS - getting styling settings from Domoticz. User variable ID = " + idx);
    $.ajax({
        url: "json.htm?type=command&param=getuservariable" +
        "&idx=" + idx,
        async: true,
        dataType: 'json',
        success: function (data) {
            if (data.status == "ERR") {
                console.log("THEME JS - Although they seem to exist, there was an error loading theme styling settings from Domoticz");
            }
            // If we got good data from Domoticz, load the preferences.
            if (typeof data.result !== "undefined") {
                var themeStylingSettingsFromDomoticz = JSON.parse(decodeURIComponent(data.result[0].Value));
                // Update the theme object with the settings from Domoticz.
                theme.textcolor = themeStylingSettingsFromDomoticz[0];
                theme.backgroundcolor = themeStylingSettingsFromDomoticz[1];
                theme.backgroundimage = themeStylingSettingsFromDomoticz[2];
                setUserColors();
            }
            console.log("THEME JS - succesfully loaded theme styling settings from Domoticz");
            if (isEmptyObject(theme) === false){
                localStorage.setObject("themeObject", theme);
            }
        },
        error: function () {
            console.log("THEME JS - ERROR reading styling settings from Domoticz for theme" + theme.name + "from user variable #" + idx);
        }
    });
}


// here we get the feature settings that are stored in domoticz as a user variable.
function getThemeFeatureSettingsFromDomoticz(idx)
{
    console.log("THEME JS - getting feature settings from Domoticz. User variable ID = " + idx);
    $.ajax({
        url: "json.htm?type=command&param=getuservariable" +
        "&idx=" + idx,
        async: true,
        dataType: 'json',
        success: function (data) {
            if (data.status == "ERR") {
                console.log("THEME JS - Although they seem to exist, there was an error loading theme preferences from Domoticz");
                $.get('/json.htm?type=command&param=addlogmessage&message=Theme Error - The theme was unable to load your user variable.');
                loadedSettingsFromDomoticz = false;
                pageChangeDetected();
            }
            // If we got good data from Domoticz, load the preferences.
            else if (typeof data.result !== "undefined") {
                console.log("THEME JS - succesfully loaded theme feature settings from Domoticz");
                var themeSettingsFromDomoticz = JSON.parse(data.result[0].Value);
                // Update the theme object with the settings from Domoticz.
                $.each(theme.features, function(key,feature){
                    if($.inArray(feature.id, themeSettingsFromDomoticz) > -1){
                        theme.features[key].enabled = true;
                    }else{
                        theme.features[key].enabled = false;
                    }
                });
                
                localStorage.setObject("themeObject", theme); // save loaded preferences in local object.
                loadedSettingsFromDomoticz = true;
                pageChangeDetected();
            }else{
                console.log("THEME JS - ERROR, couldn't load your theme preferences from Domoticz. They were there before..");
                pageChangeDetected();
            }
            
        },
        error: function () {
            console.log("THEME JS - ERROR reading feature settings from Domoticz for theme" + theme.name + "from user variable #" + idx);
            // load defaults, just to be safe.
            enableThemeFeatures();
            loadedSettingsFromDomoticz = false;
            pageChangeDetected();
        }
    });
}


function storeThemeSettingsInDomoticz(action)
{
    // prepare variables
    console.log("THEME JS - storing settings in Domoticz");
    
    // 1. FEATURES
    var themeSettingsForDomoticz = [];
    $.each(theme.features, function(key,feature){
        if(feature.enabled === true){
            themeSettingsForDomoticz.push(feature.id);
        }
    });
    
    // store/update features
    var variableURL = 'json.htm?type=command&param=' + action + 'uservariable&vname=theme-' + themeMachineName + '-features&vtype=2&vvalue='+ JSON.stringify(themeSettingsForDomoticz);    
    $.ajax({
        url: variableURL,
        async: true,
        dataType: 'json',
        success: function (data) {
            if (data.status == "ERR") {   
                HideNotify();
                bootbox.alert($.t('Unable to store theme settings in Domoticz. Try clearing ALL your cache.'));
                console.log("THEME JS - unable to create theme settings storage in Domoticz. (tip:max datasze is 200 bytes)");
            }
            //wait 1 second
            setTimeout(function () {
                HideNotify();
            }, 1000);

            // If we got good data from Domoticz.
            if (typeof data.result !== "undefined") {
                console.log("THEME JS - Got this response from Domoticz about the user variable:");
                console.log(data.result);
            }
        },
        error: function () {
            console.log("THEME JS - Ajax error wile creating or updating user variable in Domotcz.");
        }
    });
    
    // 2. STYLING
    var themeStylingSettingsForDomoticz = [];
    themeStylingSettingsForDomoticz.push(theme.textcolor);
    themeStylingSettingsForDomoticz.push(theme.backgroundcolor);
    themeStylingSettingsForDomoticz.push(theme.backgroundimage);
    
    // store/update user's styling preferences
    var stylingURL = 'json.htm?type=command&param=' + action + 'uservariable&vname=theme-' + themeMachineName + '-styling&vtype=2&vvalue='+ encodeURIComponent(JSON.stringify(themeStylingSettingsForDomoticz));
    $.ajax({
        url: stylingURL,
        async: true,
        dataType: 'json',
        success: function (data) {
            if (data.status == "ERR") {   
                HideNotify();
                bootbox.alert($.t('Unable to store theme styling settings in Domoticz. Try clearing ALL your cache.'));
                console.log("THEME JS - unable to create theme styling settings storage in Domoticz. (tip:max datasze is 200 bytes)");
            }
            //wait 1 second
            setTimeout(function () {
                HideNotify();
            }, 1000);

            // If we got good data from Domoticz.
            if (typeof data.result !== "undefined") {
                console.log("THEME JS - Got this response from Domoticz about the user styling variable:");
                console.log(data.result);
            }
        },
        error: function () {
            console.log("THEME JS - Ajax error wile creating or updating user styling variable in Domotcz.");
        }
    });   
}


function enableThemeFeatures()
{
    // load all JS and CSS files
    $.each(theme.features, function(key,feature){
        if(feature.enabled === true){
            if(feature.files.length > 0){
                loadThemeFeatureFiles(key);
            }
        }
    });
    
    loadUserCSS();
    setUserColors();
    
    // Everything should be loaded. Let's start checking for page content
    console.log("THEME JS - everything is loaded. Calling pageChangeDetected.");
    //pageChangeDetected();
    loadedThemeCSSandJS = true;
}


function loadThemeFeatureFiles(featureName) // feed this function the feature name
{
    //console.log("THEME JS - loading files for " + featureName + " feature");
    
    // get file list from theme settings object
    var files = theme.features[featureName].files;
    var arrayLength = files.length;
    for (var i = 0; i < arrayLength; i++) {
        if(files[i].split('.').pop() == "js"){
            console.log("THEME JS - loading javascript for " + featureName + " feature");
            var getviarequire = "../styles/aurora/" + featureName;
            requirejs([getviarequire], function(util) {
                console.log("THEME JS - Javascript loaded by RequireJS");
            });
        }
        if(files[i].split('.').pop() == "css"){
            var CSSfile = "" + baseURL + "/styles/aurora/" + files[i] + "?" + themeMachineName;
            console.log(CSSfile);
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", CSSfile);
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }
}

function unloadThemeFeatureFiles(featureName) // feed this function the feature name
{
    $('head link[href*=' + featureName + ']').remove();
    $('head script[src*=' + featureName + ']').remove();
}


function setUserColors()
{
    
    // Should we use the mobile view when on desktop?
    if (theme.features.mobile_phoney.enabled === true && theme.features.mobile_on_non_mobile.enabled === true) {
        console.log("THEME JS - setting mobile tag on non-mobile device");
        document.body.setAttribute("id", "onMobile");
    
    }else {

        // load text color
        if(theme.textcolor != ""){        
            console.log("THEME JS - text color: " + theme.textcolor);
            $('body').css('color', theme.textcolor);
        }else{
            console.log("THEME JS - no text color set");
            $('body').css('color', "#fff");
        }

        // load background color
        if(theme.backgroundcolor != ""){
            $('html,body').css("background", ""); // reset for styling.css
            console.log("THEME JS - background color: " + theme.backgroundcolor);
            $('html,body').css('background-color', theme.backgroundcolor);
        }else{
            console.log("THEME JS - no background color set");
        }

        // load background image  
        //if(typeof theme.backgroundimage !== "undefined"){
        if(theme.backgroundimage != ""){
            console.log("THEME JS - background image: " + theme.backgroundimage);
            $('body').css('background-image','url(' + theme.backgroundimage + ')');
        }else{
            console.log("THEME JS - no background image set");
        }
    }
}


// this function manages the step by step loading of the theme. each loading step calls back to the function, which then moves to the next stage.
function pageChangeDetected(){
    //console.log("THEME JS - inside page change detected. currentPage was " + currentPage);
    waterfallRunning = false;
    
    
    // 1. First we make sure that angular has done it's thing of creating a proper angular URL.
    try {
        // detect current page based on url in the browser.
        console.log(window.location.href);
        var url = window.location.href;
        if(typeof url.slice(-1) === "undefined"){console.log("slice undefined");return;} // this can probably be removed.
        if ( url.indexOf("/#/") < 1 ){
            console.log("no /#/ in url");
            return;
        }else{
            console.log("THEME JS - pageChangeDetected. currentPage was " + currentPage);
            currentPage = url.split("/#/")[1].toLowerCase();
            baseURL = url.split("/#/")[0];
            console.log("THEME JS - pageChangeDetected. currentPage is " + currentPage);
            //console.log("THEME JS - pagechangedetected: new base URL is " + baseURL);
        }
        //f(url.slice(-1) == "/"){console.log("url ended in slash. Probably just opened. Cancelling, have to wait a bit.");return}
        //if(typeof url.split("/#/")[1] === "undefined"){console.log("/#/ was undefined, couldn't split url.");return}
        //currentPage = url.split("/#/")[1].toLowerCase(); 
        //console.log("THEME JS - pagechangedetected: current page is " + currentPage);
    }
    catch (e) {
        console.log("THEME JS - ERROR: not able to find out what page we are on:");
        console.log(e);
        $.get('/json.htm?type=command&param=addlogmessage&message=Theme Error - the theme is unable to figure out what page you are on!');
        //currentPage = "Dashboard";
        return;
    }

    
    // 2. then we check if we are on the login page or not, and if the theme object has been loaded.
    console.log("+++ pagechangedetected: theme object on next line. Empty? "+ isEmptyObject(theme));
    console.log(theme);
    
    if(currentPage == "login" && isEmptyObject(theme) === true ){
        console.log("THEME JS - On the login page, and theme object is empty. Cancelling, waiting for user to log in first. ");
        return;
    }
    if(currentPage != "login" && isEmptyObject(theme) === true ){
        console.log("THEME JS - pageChangeDetected: we're not on the login page, but the theme object is empty. We may be early.. or late. ");
        if(loadedThemeObject === false){
            loadedThemeObject = true;
            themeLoadObject();
        }
        return;
    } 

    
    // In theory you can only get here if the theme object has been loaded.
    
    if(typeof theme.name === "undefined"){
        console.log("WEIRD: no theme object yet. Cancelling. This should not be possible.");
        themeLoadObject();
        return;
    }
    
    // 3. we make sure there is a connection with Domoticz, and get the feature preferences stored there. Finally, the files are loaded.
    if(currentPage != "login" && isEmptyObject(theme) === false){
        
        // loading all the theme's CSS and JS files.
        if(loadedSettingsFromDomoticz === false && loadedThemeCSSandJS === false){
            if(typeof theme.userfeaturesvariable !== "undefined"){
                console.log("THEME JS - found a locally stored index (" + theme.userfeaturesvariable + ") for preferences stored in Domoticz. Will quickly load them.");
                getThemeFeatureSettingsFromDomoticz(theme.userfeaturesvariable);            
                console.log("THEME JS - found a locally stored styling index (" + theme.userstylingvariable + ") for preferences stored in Domoticz. Will quickly load them.");
                getThemeStylingSettingsFromDomoticz(theme.userstylingvariable);

            }else{
                console.log("THEME JS - user variable ID was NOT found inside theme object. Will try to get user variables list from Domoticz.");
                checkIfDomoticzHasThemeSettings();
                //enableThemeFeatures();
            }
        }
        else if (loadedSettingsFromDomoticz === true && loadedThemeCSSandJS === false) {
            startLoadObserver();    
            enableThemeFeatures(); // finally!

        }
        
    }
    
    //
    
    
    if(currentPage == "login" && isEmptyObject(theme) === false && loadedThemeCSSandJS === true){
        // we returned to the login page after the theme objectand files were already loaded. Period of inactivity?
        console.log(" ");
        console.log(" ");
        console.log("_________________________________________________");
        console.log("user was logged out after a period of inactivity?");
    }
     
    // are we on the front or backend?
    if( currentPage == ""   
        || currentPage == "dashboard" 
        || currentPage == "floorplans" 
        || currentPage == "lightswitches"
        || currentPage == "temperature" 
        || currentPage == "weather" 
        || currentPage == "scenes" 
        || currentPage == "utility" ){
        
        console.log("THEME JS - NEW FRONT END");
        frontend = true;
        
    }else{
        console.log("THEME JS - NEW BACK END");
        frontend = false;
    }
    
    
    //if( loadObserver === "undefined"){
    //    console.log("this shouldn't happen: pagechangedetected is starting the load observer.");
    //    startLoadObserver();   
    //}
    
}

// the observer checks if new things are being loaded into the main content area.
function startLoadObserver()
{
    
    if (!$( ".bannercontent" ).length){console.log("loadObserver couldn't start: no bannercontent container yet.");return;}
    
    var contentHolder = $( ".bannercontent" )[0]; 
    // Create an observer instance. It will check if content has loaded.
    //if(typeof loadObserver === "undefined"){
    if(typeof window.loadObserver === "undefined"){
        loadObserver = new window.MutationObserver(function( mutations ) {
            console.log("____load observer fired");
            console.log(mutations);
            if(currentPage == "weather" || currentPage == "temperature" || currentPage == "dashboard"){
                setTimeout(frontendImprovement,19);
            }
            mutations.forEach(function( mutation ) {
                console.log("loadobserver: currentPage = " + currentPage);
                console.log("loadobserver: frontend = " + frontend);
                if (currentPage != "login"){
                    var newNodes = mutation.addedNodes; // DOM NodeList
                    if( newNodes !== null ) { // If there are new nodes added
                        //console.log('new nodes..');
                        var $nodes = $( newNodes ); // jQuery set
                        $nodes.each(function() {
                            var $node = $( this );
                            //console.log($node);
                            if ( $node.attr('id') == "main-view" ){
                                console.log('__observer: A new mainview was loaded.');
                                //loadObserver.disconnect();
                                limbo = false;

                                // here the road splits:

                                $("body").removeClass();
                                $("body").addClass(currentPage);
                                if(frontend === true){
                                    $("body").addClass('frontend').removeClass('backend'); 
                                    $('#backendpagetitle').hide();
                                    console.log("__loadobserver found mainview__");
                                    frontendImprovement();
                                    //loadObserver.disconnect();
                                    //loadObserver.observe(contentHolder, {childList:true});
                                    //return;
                                }else{
                                    $("body").addClass('backend').removeClass('frontend'); 
                                    if(currentPage == "setup" 
                                        || currentPage == "events" 
                                        || currentPage == "update" 
                                        || currentPage == "forecast" 
                                        || currentPage == "login" 
                                        || currentPage == "about" ){ 
                                        $('#backendpagetitle').hide();
                                    }else{
                                        $('#backendpagetitle').text(currentPage);
                                        $('#backendpagetitle').show();
                                    }
                                    //loadObserver.disconnect();
                                    backendImprovement();
                                }
                                oncePerPage();
                            }
                        });
                    }
                }
            });
        });
        // Pass in the target node, as well as the observer options
        if(typeof contentHolder !== "undefined"){
            console.log("observer: observing mainview container");
            loadObserver.observe(contentHolder, {childList:true});
            //console.log("__just set loadobserver__");
            //setTimeout(frontendImprovement,1);
        }else{
            console.log("observer: error observing main content container. starting improvement in 2 seconds. ");
            console.log("__failed loadobserver__");
            setTimeout(frontendImprovement,2000);
        }
    }
}





function oldschool()
{
    function race() {
        if ( !$('#name').length ) {
            console.log('oldschool race');
            setTimeout(race, 1);
        }else {
            console.log("oldschool: content loaded, starting improvement.");
            frontendImprovement();
        }
    }
    race();
}


    
function backendImprovement()
{
    console.log("THEME JS - now in backend improvements");
    
    areWeOnMobile();
    
    // events    
    if(currentPage == "events"){
        //blocklyCreateExportButtons();
        
        /* experiment with injecting CSS and JS into the blockly iFrame.
        var $iframe = $('#IMain');
        $iframe.ready(function() {
            console.log("THEME JS - injecting JS and CSS into events iframe");
            //var iFrameHead = window.frames["IMain"].document.getElementsByTagName("head")[0];         
            var myscript = document.createElement('script');
            myscript.type = 'text/javascript';
            myscript.src = '/styles/aurora/events.js';
            $("#IMain").contents().find("head").append(myscript);
            //iFrameHead.appendChild(myscript);
            var mycss = document.createElement('link');
            mycss.rel = 'stylesheet';
            mycss.type = 'text/css';
            mycss.href = '/styles/aurora/events.css';
            //iFrameHead.appendChild(mycss);
            $("#IMain").contents().find("head").append(mycss);
        });
        */
    }
    
    // settings
    if(currentPage == "setup"){showThemeSettings();}
    
    // log: privacy pruning if necessary
    if(currentPage == "log"){
        
        // full privacy: only let the error part of the log remain.
        if (theme.features.extra_privacy.enabled === true && theme.features.full_privacy.enabled === true){
            
            console.log("THEME JS - Log: going full privacy");
            $('#logcontent a[data-i18n="All"]').parent().remove();
            $('#logcontent a[data-i18n="Status"]').parent().remove();
            $('#logcontent li:first-of-type').addClass('active'); // set error tab as active
            $('#logcontent #taball').remove();
            $('#logcontent #tabstatus').remove();
            $('#logcontent > table td:last-of-type').hide(); // hide search
            $('#logcontent #taberror').show(); // set error tab as active

        // extra privacy: remove status tab and remove some items from the log feed.
        } else if (  theme.features.extra_privacy.enabled === true ){
                
            console.log("log: extra privacy pruning");
            // remove status tab entirely, as it has mainly user switch commands.
            $('#logcontent #tabs a[data-i18n="Status"]').parent().remove();
            $('#logcontent #tabstatus').remove();
            
            // The datalogs to be monitored
            var allLogdataDiv = $( "#logdata" )[0];
            var errorLogdataDiv = $( "#logdata_error" )[0];

            // Create an observer instance. It will try to delete privacy data as quickly as possible.
            var privacyObserver = new window.MutationObserver(function( mutations ) {
                
                console.log("log updates that must be privacy pruned: ");
                console.log(mutations);
                mutations.forEach(function( mutation ) {
                    var newNodes = mutation.addedNodes; // DOM NodeList
                    if( newNodes !== null ) { // If there are new nodes added
                        var $nodes = $( newNodes ); // jQuery set
                        $nodes.each(function() {
                            //console.log("new log update");
                            var $node = $( this );
                            if($node.children('span').hasClass('logstatus')){
                                $node.remove();
                            }
                            if($node.is(':contains("User:")')){
                                $node.remove();
                            }
                            if($node.is(':contains("Light/Switch")')){
                                $node.remove();
                            }
                        });
                    }
                });    
            });
            // Configuration of the observer:
            var config = {
                childList: true, 
                characterData: true 
            };
            // Pass in the target node, as well as the observer options
            privacyObserver.observe(errorLogdataDiv, config);
            privacyObserver.observe(allLogdataDiv, config);
        }
    }
    
    
    // custom icons
    if(currentPage == "customicons"){
        $( 'body.customicons #iconsmain > table:first-of-type tr' ).prepend('<td id="customiconsmenu"><button id="browseIconsBtn" class="button">Browse..</button><p id="browseIconsLabel">No file selected.</p></td>');

        $( '#browseIconsBtn' ).click(function(){
           $( '#fileupload' ).click();
        });

        $( '#fileupload').change(function(){
           $( '#browseIconsLabel' ).text($( this ).val() ); 
            if( $( this ).val() != "No file selected."){
            }
        });
        $('#fileupload').hide();
    }
    $('#holder').show();
}



$( document ).ready(function()
{   
    console.log( "THEME JS - DOM is ready" );
    requirejs.config({ waitSeconds: 30 }); // makes sure there is no timeout. There are some synchronous calls somewhere (not in this theme!), which slow everthing down.
    
    // first, load in the CSS file with the most changes to the styling. This could become a settings option with a dropdown, so the user can pick a 'subtheme' styling variant.
    console.log("THEME JS - Loading theme.css");
    var CSSfile = "styles/aurora/theme.css?aurora";
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", CSSfile);
    document.getElementsByTagName("head")[0].appendChild(fileref);
    
    startLoadObserver(); // will give notice when Domoticz reloads (or unloads) entire views.
    
    pageChangeDetected(); //bootstrap
    
    // continuously check if the URL has changed. The theme then responds to that by setting the variable 'limbo' to true. When new content is loaded the limbo state is disabled at the end of the frontend waterfall.
    $(window).on('hashchange', function(e){
        console.log("THEMEJS - URL change detected");        
        limbo = true;
        clockIsRunning = false;             
        freshJSON = {};
        bands = {};
        
        pageChangeDetected();
        
        if (typeof observerCanary !== "undefined") {
            observerCanary.disconnect();
            delete observerCanary;
        }
        if (typeof privacyObserver !== "undefined") {
            privacyObserver.disconnect();
            delete privacyObserver;
        }
        if (typeof weatherAndTempObserver !== "undefined") {
            weatherAndTempObserver.disconnect();
            delete weatherAndTempObserver;
        }
    });

    //screenfull.toggle();
    if (screenfull.enabled) {
        screenfull.request();
    }
    
    
    // Many changes to the Domoticz HTML output have been proposed, but not all made it in. This theme adds those changes via JS.  
    $('#appnavbar li.divider').remove();
    $('#cLightSwitches img').attr('src', 'images/lightbulb.png');
    var newbackendpagetitle = '<h1 id="backendpagetitle"></h1>';
    $('#holder').prepend(newbackendpagetitle);    
    
    // add fullscreen button.
    if (screenfull.enabled) {
        var fullscreenMenuItem = '<li id="mFullscreen"><a id="cFullscreen"><img src="images/fullscreen32.png"> <span data-i18n="Fullscreen">Fullscreen</span></a></li>';
        $('#mAbout').after(fullscreenMenuItem);
        $('#mFullscreen').click(function() {
            screenfull.toggle();
        });
	//$("#appnavbar").i18n(); // Make the translation (Add tags in languagefile mnually)
    }
    
    // hooking into the ajax responses.
    $( document ).ajaxSuccess(function( event, xhr, settings ) {

        //limbo = false;
        waterfallRunning = false;
        
        if(onMobile){ $('body').attr('id','onMobile'); } // this means war :-)
        
        if (frontend === false){return;}
        if(frontend === false){
            console.log("I should not exist on the backend");
        }
        
        // This is where the theme hooks into the AJAX calls that are made to Domoticz, and then tries to keep the HTML updated as best as possible.
        if ( settings.url.startsWith("json.htm?type=command&param=switchdeviceorder") ) {
            console.log( "THEME JS - ajax listener: switch order" );
            bands = {};
            pageChangeDetected();
            console.log("__switch device order__");
            frontendImprovement();
        }
        else if ( settings.url.startsWith("json.htm?type=command&param=makefavorite") ) {
            console.log( "THEME JS - ajax listener: make favourite" );
            pageChangeDetected();
            console.log("__make favourite__");
            frontendImprovement();
        }
        else if ( settings.url.startsWith("json.htm?type=plans") ) {
            console.log("plans:");
            console.log(xhr.responseJSON.result);
            //oldschool();
        }
        
        else if ( settings.url.startsWith("json.htm?type=devices") ) { 
            if(limbo === true){limbo = false; return;}
            console.log("__//ajax devices__");
            //frontendImprovement();

            console.log("-------------");
            console.log( "THEME JS - ajax listener: devices update" );

            if(typeof xhr.responseJSON.result !== "undefined" ){
                console.log("THEME JS - ajax: observer: fresh JSON for devices");
                console.log(xhr.responseJSON.result);
                freshJSON = xhr.responseJSON.result;
                console.log("__fresh json, starting in 20 milliseconds.__");
                setTimeout(frontendImprovement,20); // hell why not.
                return;
            }else{ 
                console.log("ajax: boring, no real new data");
                setTimeout(frontendImprovement,1);
            }

            if( !$('.item #name').length){
                console.log( "THEME JS - got device data, but no items (#name) loaded onto the page yet." );
            } else if( $('.item td#name').length  != $('.item td.name').length){  
                console.log("THEME JS - there are items on the page, and they need to be upgraded");
            } else {
                console.log("THEME JS - as many items have #name as .name");
            }


            // EXPERIMENT use object watcher to check if domoticz updates the timestamp.

            //console.log("lastUpdateWatcherisRunning = " + lastUpdateWatcherisRunning);
            console.log("last update time: " + $.LastUpdateTime);
            if(lastUpdateWatcherisRunning === false && typeof $.LastUpdateTime !== "undefined"){
                lastUpdateWatcherisRunning = true;
                console.log("+++ inside, starting lastUpdate watcher");

                watch($, "LastUpdateTime", function(){
                    console.log("LastUpdateTime: Improving.");
                    console.log("__//lastUpdateWatcher__");
                    //frontendImprovement();
                });
            }


            // EXPERIMENT - watch the incoming items for html change. This is very useful for the weather and temperature pages, which completely reset the html when an update comes in.
            //if( currentPage == "dashboard" || lastUpdateWatcherisRunning === false){
                //console.log("MUTATION OBSERVER to the resque.");

                // we have good data, so let's put an observer in place to check if these items' html changes, and then immediately fix it.
                if(typeof xhr.responseJSON.result !== "undefined" ){

                    console.log("type of observerCanary");
                    console.log(typeof observerCanary);
                    // good data means that the canary, if it existed, has to go.
                    if(typeof observerCanary === "undefined"){
                        console.log("canary undefined.");

                        observerCanary = new window.MutationObserver(function( mutations ) {
                            console.log("canary mutationobserver: mutationslength: " + mutations.length);
                            console.log(mutations);
                            console.log("mutationobserver: disconnecting observerCanary on dashboard after first hit, and starting improvement");
                            observerCanary.disconnect();
                            console.log("__canary__");
                            frontendImprovement();
                        });
                    }

                    var config = {
                        attributes:true,
                        childList:true,
                        subtree: true,
                        characterData: true 
                    }; 

                    console.log("mutationobserver: will try to choose a canary in the coalmine from the fresh data");
                    var closingdiv = xhr.responseJSON.result.length - 1;
                    ///var targetidx = xhr.responseJSON.result[closingdiv].idx;
                    //if( $('div[class^="span"]').length ){
                    //if( $('div[id*="' + xhr.responseJSON.result[closingdiv].idx + '"] #bigtext').length ){
                    console.log("name length: " + $('#name').length );
                    console.log( $('#name') );
                    if( $('#name').length ){

                        console.log("canary observer: there is fresh data, and the target exists. Selecting new canary.");
                        //canary = $( 'div[id*="' + xhr.responseJSON.result[closingdiv].idx + '"] #bigtext')[0];
                        canary = $( '*[id*="' + xhr.responseJSON.result[closingdiv].idx + '"] #name')[0];
                        console.log("canary observer: starting to observe:");
                        console.log(canary);
                        if(typeof canary !== "undefined"){
                            console.log('__starting canary observer');
                           observerCanary.observe(canary, config);
                        }else{
                            console.log("__no canary to observe, starting oldschool");
                            //startViewChangeObserver();
                            oldschool();
                        }
                    }else{
                        console.log('found no items, starting oldschool detector.');
                        console.log("__canary starts oldschool__");
                        oldschool();
                        //setTimeout(frontendImprovement,100);
                    }

                // there's no fresh data, and no canary observer so we're pretty desperate. Let's just grab the first item we can find.
                }else if( typeof observerCanary === "undefined"){
                    if( $('.item').length ){
                        console.log("mutationobserver: no observer, and no fresh data, so picking first item available as canary.");
                        canary = $('.item')[0]; // this should still catch big changes to the html.
                    }else{
                        console.log("STOP mutationobserver: no observer, no fresh data and no items. //Will watch entire container..");
                        //var canary = $( ".bannercontent" )[0];
                    }
                }

                // This is a long longer used bit of script that would check if there really is new data based on the LastUpdateTime timestamp that Domoticz uses internally to describe the time since the last update. 
                // console.log("repetitious $.LastUpdateTime = " + $.LastUpdateTime);
                /*
                if(newDataWatcherIsRunning === false && typeof $.LastUpdateTime !== "undefined"){
                    console.log("THEME JS - setting interval for data update watcher");
                    setInterval(function() {
                        //if (typeof $.LastUpdateTime !== "undefined"){
                            if(oldLastUpdateTime != $.LastUpdateTime && $.LastUpdateTime != "undefined") {
                                oldLastUpdateTime = $.LastUpdateTime;
                                console.log('domo last update time changed.');
                                setTimeout(newData,1);
                            }
                        //}
                    }, 1);
                    newDataWatcherIsRunning = true;
                }
                */
            //}
        }
        else if ( settings.url.startsWith("json.htm?type=command&param=getSunRiseSet") ) {
            console.log("ajax: sunrise sunset");
            $('#main-view').show();
            areWeOnMobile(); // apparently the theme is too fast, and Domoticz overwrites this after the theme sets it. So here we set it again.
            console.log("__sunrise sunset in 100 milliseconds__");
            setTimeout(frontendImprovement,100);
            //frontendImprovement();
        }
        /*
        else if ( settings.url.startsWith("json.htm?type=graph") ) {
            console.log("graph");
        } 
        else{
            //console.log("ajax Leftovers: " + settings.url);
        }*/
    });
});


function oncePerPage()
{
    console.log("THEME JS - doing once per page things. ");
    // if there is a background image, tweak the colours to pop out more.
    if(theme.backgroundimage != "" && onMobile === false){
        var darkerbg = hexToRgbA(theme.backgroundcolor);
        $('h1,h2,h3').css('opacity', '1');
        $('.span3, .span4, .navbar').css('background-color', darkerbg);
    }
    
    if(onMobile === true){
        $('#timesun').remove();
    }
    
    if(currentPage == "weather" || currentPage == "temperature"){
        startWeatherAndTempObserver();
        console.log("__once per page__");
        //frontendImprovement();
        setTimeout(frontendImprovement,20);
        setTimeout(frontendImprovement,4000);
    }
    
    areWeOnMobile();
}


// this is needed because the weather and temperature pages change a lot of html.
function startWeatherAndTempObserver()
{
    console.log("THEME JS - starting weather and temperature observer");
    if(typeof weatherAndTempObserver === "undefined"){
        var weatherAndTempObserver = new window.MutationObserver(function( mutations ) {
            //console.log("weather and temp mutationobserver: mutationslength: " + mutations.length);
            
            if( mutations[0].addedNodes[0] !== null ){
                console.log("Weather and temp mutationobserver: added nodes length: " + mutations[0].addedNodes.length);
                weatherAndTempObserver.disconnect();
                console.log("__weather and temp observer__");
                var whatever = frontendImprovement();
                setTimeout(startWeatherAndTempObserver,250);
            }    
        });
    }
    
    if(currentPage == "weather"){
        //console.log("angular html refresh..");
        var target = $('#weatherwidgets')[0];
        weatherAndTempObserver.observe(target, {childList:true});
    }
    if(currentPage == "temperature"){
        //console.log("angular html refresh..");
        var target = $('#tempwidgets')[0];
        weatherAndTempObserver.observe(target, {childList:true});
    }
}


// this watches for big changes after a new page has been loaded. An observer instead of a timer is used to help slow devices.
function startViewChangeObserver()
{
    //console.log("setting viewchangeobserver");
    if(typeof viewChangeObserver === "undefined"){
        var viewChangeObserver = new window.MutationObserver(function( mutations ) {
            console.log("viewChangeObserver mutationobserver: mutationslength: " + mutations.length);
            console.log(mutations[0].addedNodes.length);
            if( mutations[0].addedNodes[0] !== null ){
                viewChangeObserver.disconnect();
                console.log("__view change observer__");
                var whatever = frontendImprovement();
                setTimeout(viewChangeObserverObserver,250);
            }    
        });
    }
    if(currentPage == "dashboard"){
        console.log("starting dashboard observer");
        var contentHolder = $( ".bannercontent" )[0];
        //viewChangeObserver.observe(target, {childList:true});
        viewChangeObserver.observe(contentHolder, {childList:true});
    }
}


//This can always be called to check if content has loaded and has been upgraded.
function frontendImprovement()
{
    if( !$('.divider').length ){
        console.log("==THEME JS - ERROR: frontend improvement: no dividers to work with on the page yet. Cancelling frontendImprovement");
        return;
    }
    if( typeof theme.name === "undefined" ){
        console.log("==THEME JS - ERROR: frontend improvement: no theme object available while starting improvement");
        return;
    }    
    if(waterfallRunning === false){
        waterfallRunning = true;
    }else{
        console.log("____frontendImprovement already running, cancelling");
        //waterfallRunning = false;
        rerunImprovement = true;
        return;
    }
    if( $('.item td#name').length  != $('.item td.name').length){
        console.log("Items exist, but upgrades are missing! Running improvements.");
        waterfall();
    }else if( $('section > h2').length  < $('section > .divider').length + 1){
        console.log("Dividers exist but have not been merged. Running improvements.");
        waterfall();
    }
    
    function waterfall(){
        mergeDividers();
        improveClasses();
        newData();
        if (currentPage == "dashboard"){ addDashboardGoodies(); }
    }
}


// makes changes to HTML on each new loaded page.
function mergeDividers()
{
    
    //$('main-view').hide();
    //$('main-view').css('background-color','red');
    console.log("inside mergeDividers");
    
    // simply the dashboard, remove dividers so that more fluid layouts become possible.
    if(currentPage == "dashboard"){
        /*
        if( !$('section.dashCategory').length ){
            console.log("error: no categories loaded yet.");
            waterfallRunning = false;
            //oldschool();
            return;
        }*/
        
        // merge dividers into one divider. This allows CSS to take over, and thus create more flexible layouts.
        $('section.dashCategory:has(.divider:nth-of-type(2))').each(function() {
            //console.log('divider count: ' + $(this).find('div.divider').length ); 
            console.log('unwrapping ' + $(this).find('div.divider > div[class^="span"]').length + ' dividers.' ); 
            $(this).find('div.divider > div[class^="span"]').unwrap();
            $(this).find('div[class^="span"]').wrapAll( "<div class='row divider' />");
            //$(this).find('div.divider > div.span3').unwrap();
            //$(this).find('div.span3').wrapAll( "<div class='row divider' />");    
        });
        
        // merge weather into temperature
        if (theme.features.dashboard_merge_temp_and_weather.enabled === true){
            if($('#dashWeather div[class^="span"]').length && $('#dashTemperature div[class^="span"]').length){
                console.log("THEME JS - merging weather and temperature");
                $('#dashWeather div[class^="span"]').prependTo('#dashTemperature .divider')[0];
                $('#dashWeather').remove();
                $('#dashTemperature > h2').text($.t('Environment sensors'));
            }
        }
    }else{
        // When we're not on the dashboard div unwrapping works a little different..
        console.log("THEME JS - transforming not the dashboard: removing dividers");
        if( $('div.divider').length > 1  ){
            $('div.divider:not(div[id="weatherwidgets"]:not(div[id="tempwidgets"])) > div.item').unwrap();
            $( ".container > div.item" ).wrapAll( "<div class='row divider' />");
        }
    }
    
    //setTimeout(improveClasses,1);
}


// adds all kinds of classes to make theming easier.
function improveClasses()
{
    console.log("THEME JS - improveClasses starting, currentPage = " + currentPage);
    
    // add missing classes
    if( $('.item td#name').length != $('.item td.name').length ){
        $('.item td[id]').each(function(){
            console.log("id -> class");
            //if($(this).attr('id')){
                var oldid = $(this).attr('id');
                $(this).addClass(oldid);
        });
        // fix it when angular removes classes and just leaves them empty.
        $('.item td[class=""]').each(function(){
            console.log("id -> class refill");
            //if($(this).attr('id')){
                var oldid = $(this).attr('id');
            if(typeof oldid !== "undefined"){
                $(this).addClass(oldid);
            }
        });
    }

    // give a name to the unnamed TD in the item.
    if(currentPage == "dashboard"){
        $('.item td:not([class])').addClass("selectors");
    }else{
        $('.item td:not([class])').addClass("options");
    }

    // add a Type TD if one doesn't exist. This allows ID data to be shown.
    if( currentPage != "dashboard" && currentPage != "scenes" ){
        $('.item:not(:has(.type))').each(function(){
            $(this).find('.options').before('<td class="type"></td>');
        });
        console.log("THEME JS - appending Type TD so that item ID can be shown");
    }

    // hide duplicate output if status is the same as bigtext
    $('.item tr').each(function(){
        if($(this).find('.bigtext').text() == $(this).children('.status').text()){
            $(this).find('.status').hide();
        }
    });
    

    // simplify type details, but only if there are no sliders, since it damages those (because it replaces the html, so funcions are detached) 
    //console.log("THEME JS - improveClasses: upgrading type data (adding ID, etc)");
    // Add ID and simplify type info for items without a BR first. These are simple ones without buttons.
    // future todo: just lift the entire button-thing into a new td called 'selectors'. After that, fixing this thing could be a lot simpler too.
    
    if(currentPage != "dashboard"){
        $('body:not(.dashboard) .type:not(:has(br)):not(:has(.idnumber)):not(:has(.dimslider)):not(:has(.selectorlevels))').each(function(index) {
            console.log("THEME JS - adding ID number");
            var oldType = "";
            //var testje = oldType.split(',').pop();
            oldType = $(this).text();
            var myNumber = "?";
            if(currentPage == "weather" || currentPage == "temperature"){
                if( $(this).closest('.span4').length ){ myNumber = $(this).closest('.span4').attr('id'); }
                if( $(this).closest('.span3').length ){ myNumber = $(this).closest('.span3').attr('id'); }
            }else{
                myNumber = $(this).closest('.item').attr('id');
            }
            var newType = '<span class="idnumber">'+ myNumber + '</span><span class="typedata">' + $.trim( oldType.split(',').pop() ) + '</span>';

            $(this).html(function(index,html){
                return html.replace(oldType,newType);
            });
        });

        // add item ID number to type details which have a BR in them, but don't have a slider. Basically: items with buttons.
        $('body:not(.dashboard) .type:has(br):not(:has(.idnumber)):not(:has(.dimslider)):not(:has(.selectorlevels))').each(function(index) {
            $(this).html(function(index,html){
                var pattern = "<br>";
                var oldType = truncateAfter(html, pattern); // get only the part before the BR
                var newType = '<span class="idnumber">'+ $(this).closest('.item').attr('id') + '</span><span class="typedata">' + $.trim( oldType.split(',').pop() ) + '</span>';
                return html.replace(oldType,newType); // replace the old part of the string
            });
        });
    }
    
    // adding classes for certain types of icons to support a little animation and dataviz. Not all of them are currently used, but future themers might enjoy them.    
    $('img[src*="images/Fan"]').closest('.item').addClass('fan');
    $('img[src*="images/baro"]').closest('.item').addClass('baro');
    if(currentPage == "dashboard" && theme.features.dashboard_show_data_visualizations.enabled === true){
        $('img[src*="images/temp"]').closest('.item').addClass('temp');
        $('img[src*="images/current"]').closest('.item').addClass('current');
        $('img[src*="images/Light"]').closest('.item').addClass('light');
        $('img[src*="images/gauge"]').closest('.item').addClass('gauge');
        $('img[src*="images/Water"]').closest('.item').addClass('water');
        $('img[src*="images/Heating"]').closest('.item').addClass('heating');
        $('img[src*="images/fire"]').closest('.item').addClass('heating');
        $('img[src*="images/Percentage"]').closest('.item').addClass('percentage');
        $('img[src*="images/lux"]').closest('.item').addClass('lux');
        $('img[src*="images/Custom"]').closest('.item').addClass('custom');
        $('img[src*="images/Wind"]').closest('.item').addClass('wind'); 
        $('img[src*="images/ice"]').closest('.item').addClass('ice');
        $('img[src*="images/rain"]').closest('.item').addClass('rain');
        $('img[src*="images/air"]').closest('.item').addClass('air');
        $('img[src*="images/Speaker"]').closest('.item').addClass('speaker'); 
        $('img[src*="images/moisture"]').closest('.item').addClass('moisture'); 
        $('img[src*="images/uv"]').closest('.item').addClass('uv');
        $('img[src*="images/visibility"]').closest('.item').addClass('visibility');
        $('img[src*="images/radiation"]').closest('.item').addClass('radiation');
        $('img[src*="images/leaf"]').closest('.item').addClass('leaf');
        $('img[src*="images/override"]').closest('.item').addClass('thermostat');
        $('img[src*="images/scale"]').closest('.item').addClass('scale');
        $('img[src*="images/Gas"]').closest('.item').addClass('gasmeter');
    }

    // give all banner navigation tables a class name.
    $('#timesun').closest('table:not(.bannav)').addClass("prebannav");
    
    
    // privacy feature: show last updated time
    if (theme.features.extra_privacy.enabled === true && theme.features.full_privacy.enabled === true){
            $('.lastupdate,#lastupdate').remove();
    }
    
    // show last update time?
    if (currentPage == "dashboard" && theme.features.dashboard_show_last_update.enabled === true && theme.features.full_privacy.enabled === false){
        console.log("THEME JS - showing last update in new footer");

        // creating a brand new footer div.
        $('body.dashboard .lastupdate').hide();

        // privacy features, like removing last update time where necessary, removing log buttons, etc.
        if (theme.features.extra_privacy.enabled === true && theme.features.full_privacy.enabled === true){
            $('.lastupdate,#lastupdate').remove(); // full privacy
        }else if (theme.features.extra_privacy.enabled === true){ // some privacy
            $('section:not(#dashSwitches) .item:not(:has(.itemfooter))').append('<div class="itemfooter"><div class="lastupdated"></div><div class="timeagooutput"></div></div>');
            setTimeout(updateLastUpdated,1000); // tick tock, this is a clock that updates the 'time ago' time.
        } else if(!$('.itemfooter').length){ // no privacy
            $('.item:not(:has(.itemfooter))').append('<div class="itemfooter"><div class="lastupdated"></div><div class="timeagooutput"></div></div>');
            setTimeout(updateLastUpdated,1000); // tick tock, this is a clock that updates the 'time ago' time.
        }
        
        // set the battery data
        if(theme.features.full_privacy.enabled !== true){
            console.log("THEME JS - Adding battery icon.");
            $.each(freshJSON, function(key,itemData){
                if( itemData.BatteryLevel < 101 ){
                    //console.log("THEME JS - improveClasses: adding first battery level info for " + itemData.Name);
                    var batteryLevelHeight = itemData.BatteryLevel + '%';
                    var batteryLevelClass = 'batterylevel' + Math.round(itemData.BatteryLevel/10);
                    if( $('.span4').length){
                        if( !$('.span4[id$="' + itemData.idx + '"] .battery').length ){
                            $('.span4[id$="' + itemData.idx + '"]').find('.itemfooter').append('<div class="batterywrapper"><span class="batterypercentage">' + batteryLevelHeight + '</span><span class="battery"><span class="level"></span></span></div>'); //' + itemData.BatteryLevel + '
                        }
                        $('.span4[id$="' + itemData.idx + '"] .battery .level').css('width', batteryLevelHeight);
                        $('.span4[id$="' + itemData.idx + '"] .item').addClass(batteryLevelClass);
                    }else{
                        if( !$('.span3[id$="' + itemData.idx + '"] .battery').length ){
                            $('.span3[id$="' + itemData.idx + '"]').find('.itemfooter').append('<div class="batterywrapper"><span class="batterypercentage">' + batteryLevelHeight + '</span><span class="battery"><span class="level"></span></span></div>'); //' + itemData.BatteryLevel + '
                        }
                        $('.span3[id$="' + itemData.idx + '"] .battery .level').css('width', batteryLevelHeight);
                        $('.span3[id$="' + itemData.idx + '"] .item').addClass(batteryLevelClass);
                    }
                }
            });
        }
    }
    //newData();
    //setTimeout(newData,1);
}


// This part is mostly focussed on standardises the output of incoming data. This function assumes that improveClasses has 
// already run to prepare things. 
// These two functions have become quite inseperable, as I've found some pages of Domoticz (weather, temperature) that just 
// completely replace the entire item when there is new data.
// todo: merge these two functions.
function newData() //freshJSON
{

    console.log("THEME JS - inside newData."); // Optional data object:")
    //console.log(freshJSON);
    
    // wrap a span around TD elements that don't have any span inside them.
    $('td[id="name"]:not(:has(span)),td[id="bigtext"]:not(:has(span)),td[id="status"]:not(:has(span)),td[id="type"]:not(:has(span)),td[id="lastupdate"]:not(:has(span))').each(function(index) {
    //$('td.name:not(:has(span)),td.bigtext:not(:has(span)),td.status:not(:has(span)),td.type:not(:has(span)),td.lastupdate:not(:has(span))').each(function(index) { // this is the future version.. but just to be safe lets use the ID-based verison for now.
        $(this).wrapInner('<span><\/span>');
    });
    
    if(currentPage == "dashboard"){
        // Check items that have multiple data outputs. Some of these are empty, and those must be removed.
        $('td.status > .wrapper > span').each(function(index) {
            if( $(this).text().length < 1 ){
                console.log("THEME JS - newdata: removing empty data span");
                $(this).remove(); //item = $(this).closest('.item').
            }
        });

        // check if items that claim to have output in the status td actually do.
        $('.withstatus:not(.bandmember) td#status > span').each(function(index) {
            //console.log("____________");
            //console.log("td #status > span text: " + $(this).text() );
            if( $(this).text().length < 1 ){ // if it's empty, it shouldn't have a withstatus output.
                console.log("THEME JS - newData: fake news! Empty status. Fixing it.");
                var item = $(this).closest('.item');
                //console.log("removing withstatus from: " +  item.find('#name').text() );
                item.removeClass('withstatus');
                item.removeClass (function (index, className) {
                    return (className.match (/(^|\s)statuscount\S+/g) || []).join(' ');
                });
            } 
        });
    }
    
    //Domoticz outputs messy HTML: multiple data inside one tag, full of BR's to seperate them. This function tries to clean it up.
    $('td.status > span').has( 'br' ).each(function(index) {
        console.log("THEME JS - found a BR in status output, surgically removing");
        var foundDataCount = 0;
        
        $(this).html(function(index,html){

            // Turn BR delimination into proper span wrapped data.
            var i;
            var newhtml = "";
            var brExp = /<br\s*\/?>/i;
            var lines = html.split(brExp);
            for (i = 0; i < lines.length; ++i){
                if (lines[i].length > 0){
                    foundDataCount = foundDataCount + 1;
                    newhtml += '<span class="value' + i + '">' + lines[i] + '</span>';
                }
            }
            return newhtml;
        });
        var item = $(this).closest('.item');
        item.removeClass (function (index, className) {
            return (className.match (/(^|\s)statuscount\S+/g) || []).join(' ');
        });
                    
        // update the 'withstatus' and 'statuscount' classes on the item.
        if(foundDataCount > 0){
            item.addClass("withstatus");
            item.addClass("statuscount" + foundDataCount);
            //console.log("THEHE JS - newData: upgraded statuscount on " + item.find('#name').text())
        }else{
            item.removeClass('withstatus');
            //console.log("newData: removing withstatus on " + item.find('#name').text())
        } 
    });

    // fix comma separated data, place each output in a span.
    $('td.status > span:contains(", ")').each(function(index) {
        console.log("THEME JS - fixing found comma separated data"); 
        var foundDataCount = 0;
        $(this).html(function(index,html){
            
            /* Turn ", " delimination into proper span wrapper data .*/
            var i;
            var newhtml = "";
            var brExp = /\, /i;
            var lines = html.split(brExp);
            for (i = 0; i < lines.length; ++i){
                if (lines[i].length > 0){
                    foundDataCount = foundDataCount + 1;
                    newhtml += '<span class="value'+i+'">' + lines[i] + '</span>';
                }
            }
            return newhtml;
        });
        
        var item = $(this).closest('.item');
        
        // fix issue where some data has too many spans.
        item.find('span > span > span').unwrap();
        item.find('.status > span').addClass('wrapper'); 
        
        item.removeClass (function (index, className) {
            return (className.match (/(^|\s)statuscount\S+/g) || []).join(' ');
        });
                    
        // update the 'withstatus' and 'statuscount' classes on the item.
        if(foundDataCount > 0){
            item.addClass("withstatus");
            item.addClass("statuscount" + foundDataCount);
            //console.log("THEHE JS - newData: upgraded statuscount on " + item.find('#name').text())
        }else{
            item.removeClass('withstatus');
            //console.log("newData: removing withstatus on " + item.find('#name').text())
        } 
    });
    
    // remove some BR tags on the weather and temperature pages.
    $('body:not(.dashboard) #status br[ng-show]').replaceWith('<span class="wasbr ng-show"> </span>');
    $('body:not(.dashboard) .status br[ng-show]').replaceWith('<span class="wasbr ng-show"> </span>');    
    
    // derive on or off CSS classes from the image that is currently used.
    $('img[src*="_On"]').closest('.item').addClass('on');
        $('img[src*="_On"]').closest('.item').removeClass('off');
    $('img[src*="_Off"]').closest('.item').addClass('off');
        $('img[src*="_Off"]').closest('.item').removeClass('on');
    
    
    // privacy pruning - removing log buttons
    if (theme.features.extra_privacy.enabled === true && theme.features.full_privacy.enabled === true){
        console.log("should hide log buttons on switches");
        $('.btnsmall[data-i18n="Log"]').remove();
        $('.lastupdate').remove();
        $('.itemfooter').remove();
    } else if (theme.features.extra_privacy.enabled === true){
        if(currentPage == "lightswitches" || currentPage == "scenes"){
            console.log("should hide log buttons on switches and scenes page");
            $('.btnsmall[data-i18n="Log"]').remove();
        }
    }
    
    // privacy pruning - removing last update time on dashboard switches
    if (theme.features.extra_privacy.enabled === true && currentPage == "dashboard"){
        console.log("THEME JS - privacy: should hide last updated on dashboard");
        $('#dashSwitches .lastupdate').remove();
        $('#dashSwitches .itemfooter').remove();
    } 

    
    if(currentPage == "dashboard"){
        
        // Merges items with similar names. Yes that's a lot of safety checks :-)
        if (typeof(Storage) !== "undefined" && typeof theme.features.dashboard_merge_items_with_same_name.enabled !== "undefined") {
            if (theme.features.dashboard_merge_items_with_same_name.enabled === true) {
                if (typeof mergeItems === "function") {
                    mergeItems(); 
                }
            }
        }
            
        // Update battery level data, forecast string, based on the received json data from domoticz.
        $.each(freshJSON, function(key,itemData){

            //battery icon
            if(theme.features.full_privacy.enabled !== true){ // its a bit of a shame that this is inside the footer. The footer is hidden when privacy feature is enabled. todo: improve this.
                if( itemData.BatteryLevel < 101 ){
                    console.log("THEME JS - newdata: updating battery level info for " + itemData.Name);
                    var batteryLevelHeight = itemData.BatteryLevel + '%';
                    var batteryLevelClass = 'batterylevel' + Math.round(itemData.BatteryLevel/10);
                    
                    if( !$('*[id$="' + itemData.idx + '"] .battery').length ){
                        //create battery icon
                        $('*[id$="' + itemData.idx + '"]').find('.itemfooter').append('<div class="batterywrapper"><span class="batterypercentage">' + batteryLevelHeight + '</span><span class="battery"><span class="level"></span></span></div>'); //' + itemData.BatteryLevel + '
                    }else{
                        // just update
                        $('*[id$="' + itemData.idx + '"] .item').removeClass (function (index, className) {
                            return (className.match (/(^|\s)batterylevel\S+/g) || []).join(' ');
                        });
                        $('*[id$="' + itemData.idx + '"] .battery .level').css('width', batteryLevelHeight);
                        $('*[id$="' + itemData.idx + '"] .item').addClass(batteryLevelClass);
                    }
                }
            }

            // weather forecast
            if( theme.features.extras_and_animations.enabled === true && typeof itemData.ForecastStr !== "undefined"){
                console.log("THEME JS - adding forecast data to item for visualisation");

                var prediction = "prediction-" + machineName(itemData.ForecastStr);
                $('div[class^="span"][id$="' + itemData.idx + '"] .item').removeClass (function (index, className) {
                    return (className.match (/(^|\s)prediction-\S+/g) || []).join(' ');
                });
                $('div[class^="span"][id$="' + itemData.idx + '"] .item.baro.statusNormal').addClass(prediction);
            }
			
			// Remove Confort and Dew Point data in Temp Hum Baro devices.
			if( theme.features.dashboard_remove_dewpoint.enabled === true){
				$( "body.dashboard .item:contains('Dew Point')" ).removeClass('withstatus');
				console.log("THEME JS - hiding Dew Point data");
			}else{
				$( "body.dashboard .item:contains('Dew Point')" ).addClass('withstatus');
				console.log("THEME JS - showing Dew Point data");
			}
        });

        // A small fix for some items that have a weird status output.
        //console.log("THEME JS - wrapping orphaned status data output");
        $('.statuscount1 .status > span.wrapper:not(:has(span))').wrapInner( "<span class='value1'></span>" );

    
    
    // thermostat setpoint
    prepareInlineSetPoint();
    }    
    
    // end of the entire waterfall of fixes. phew!
    //$('main-view').show();
    $('main-view').css('background-color','transparent');

    if(rerunImprovement === true){
        console.log("__rerunning improvements in 50 milliseconds__");
        setTimeout(frontendImprovement,40);
    }else{
        waterfallRunning = false;
    }
    
    // Edit text items
    if(currentPage == "utility"){
        $( ".item:not(:has(.editable)) .typedata:contains('Text')" ).each(function() {
            var item = $(this).closest('.item');
            var mytext = item.find('.status > span').text();
            var inputHTML = '<input class="editable" value="' + mytext+ '">';
            item.find('.status').append(inputHTML);
            item.find('.status .editable').focusout(function() {
                newValue = $(this).val();
                $(this).hide();
                var item = $(this).closest('.item');
                var itemID = item.find('.idnumber').text();
                var textSetterURL = baseURL + '/json.htm?type=command&param=udevice&idx=' + itemID + '&nvalue=0&svalue=' + newValue;
                console.log(textSetterURL);
                $.get(textSetterURL);
                
                item.find('.status > span').text(newValue);
                item.find('.status > span').show();
            });
            item.find('.status .editable').hide();
            item.find('.status > span').click(function(){
                $(this).hide();
                var item = $(this).closest('.item');
                item.find('.status > input').show();
            });
            
        });
    }
	
	if(currentPage == "dashboard"){
		$( ".item:not(.miniframe) .status .value1:contains('http')" ).each(function() {
			var item = $(this).closest('.item');
			textValue = item.find('.status .value1').text();
			console.log("possible url" + textValue);
			if (textValue.startsWith("http")){
				console.log("THEMEJS - creating miniframe for " + textValue);
				item.find('.bigtext').hide();
				item.find('.img').hide();
				iframeHtml = '<td class="frameholder"><iframe src="' + textValue + '" /></td>';
				item.find('.status').after(iframeHtml);

				item.find('.status').hide();
				item.addClass('miniframe');
				
				//item.find('.lastupdate').hide();
				//item.find('.itemfooter').hide();
			}
			
		});
		$( ".miniframe .frameholder" ).resizable();
	}
	
}


// finally, after the waterfall of html and css improvements, add the fun stuff (dataviz, etc).
function addDashboardGoodies()
{
    if (typeof(Storage) !== "undefined" && typeof theme.name !== "undefined"){
        
        if (theme.features.dashboard_merge_items_with_same_name.enabled === true) {
            if (typeof mergeItems === "function") {
                mergeItems(); 
            }
        }
        
        if (theme.features.dashboard_highlighted.enabled === true &&  theme.features.dashboard_camera_previews.enabled === true){
            if (typeof prepareCameraPreviews === "function") {
                setTimeout(prepareCameraPreviews,1500);
            }
        }

        if (theme.features.dashboard_clock_item.enabled === true && currentPage == "dashboard" ) {
            if( !$('#clockitem').length ){
                console.log("THEME JS - creating clock item");
                $('#timesun').remove();

                if( $('.span4').length ){
                    var clockitem = '<div class="span4" id="clockitem" style="position: relative;"><div id="bstatus" class="item statusNormal withstatus statuscount2"><table id="itemtablesmall" class="itemtablesmall" cellspacing="0" cellpadding="0" border="0"><tbody><tr>';
                }else{
                    var clockitem = '<div class="span3" id="clockitem" style="position: relative;"><div id="bstatus" class="item statusNormal withstatus statuscount2"><table id="itemtablesmall" class="itemtablesmall" cellspacing="0" cellpadding="0" border="0"><tbody><tr>';
                }
                clockitem += '<td id="name" class="name"><span data-i18n="Clock">Clock</span></td><td id="status" class="status"><span class="wrapper"><span id="timesun">...</span></span></td><td id="lastupdate" class="lastupdate"><span>&nbsp;</span></td></tr></tbody></table</div><!--item end--></div>'
                $('#dashSwitches .divider').prepend(clockitem);
            }
        }
	 $("#name").i18n(); // Make the translation (Add tags in languagefile mnually)
	    
        if (theme.features.dashboard_highlighted.enabled === true && theme.features.dashboard_show_data_visualizations.enabled === true && currentPage == "dashboard") {
            if (typeof addDataviz === "function") {
                setTimeout(addDataviz,1000);
            }
        }
    }
}


// add buttons to thermostat setpoint items
function prepareInlineSetPoint()
{
    //console.log("=====preparing inline setpoint=========");
    $('.Thermostat.SetPoint').each(function() {
        var itemdata = $(this).find('.img img').attr('onclick');
        //console.log(itemdata);
        var partsOfStr = itemdata.split(',');
        var idx = partsOfStr[1];
        var temp = partsOfStr[4];
        temp  = Number(temp.replace(");", ""));
        //console.log('idx ' + idx);        
        //console.log('temp ' + temp);        
        var updownhtml = '<span class="upicon flipvertical"  onclick="inlineSetPoint(' + idx + ',' + temp + ',\'down\');"></span><span class="upicon" onclick="inlineSetPoint(' + idx + ',' + temp + ',\'up\');"></span>';
        $(this).find('#bigtext .wrapper .upicon').remove();
        $(this).find('#bigtext .wrapper:not(:has(.temp))').wrapInner('<span class="temp"></span>');
        $(this).find('#bigtext .wrapper:not(:has(.upicon))').append(updownhtml);
    });
}


function inlineSetPoint(idx,temp,change){
    //console.log("inside inline setpoint");
    if(change == "up"){temp = temp + 1;}
    if(change == "down"){temp = temp - 1;}    
    console.log("THEME JS - setpoint: newly chosen temperature is " + temp);

    $('div[class^="span"][id$="' + idx + '"] .item #bigtext .wrapper .upicon').addClass('loading');
    
	$.ajax({
		url: "json.htm?type=command&param=setsetpoint&idx=" + idx +
		"&setpoint=" + temp,
		async: true,
		dataType: 'json',
		success: function (data) {
			if (data.status == "ERR") {
				HideNotify();
				bootbox.alert($.t('Problem setting Setpoint value'));
			}
			//wait 1 second
			setTimeout(function () {
				HideNotify();
				//$.refreshfunction();
			}, 1000);
            
            console.log("THEME JS - new setpoint set");
            //$('div[class^="span"][id$="' + idx + '"] .item #bigtext .wrapper .upicon').remove();

            
            // EXPERIMENTS - trying to call a refresh function inside angular's scope.
            //$.refreshfunction();
            //console.log( angular.element(document.getElementById('html')) );
            /*
            console.log( angular.element($("html")).scope() );
            console.log( angular.element($("html")).controller() );

            var scope = angular.element($("html")[0]).scope();
            var injector = angular.element($("html")).injector();
            console.log(injector);
            var $rootScope = injector.get('$rootScope');
            console.log($rootScope);
            
            
            //var scope = angular.element(document.getElementById("MainWrap")).scope();
            scope.$apply(function () {
                scope.refreshfunction();
                console.log("tried to run in scope");
            });
            */
            //console.log( angular.element("html").controller() );
            //frontendImprovement();
            
            /*       
            var appElement = document.querySelector('[ng-app=app]');
            var appScope = angular.element(appElement).scope();
            var controllerScope = appScope.$$childHead;
            console.log(controllerScope.user);
            */
            /*
            var controllerElement = document.querySelector('html');
            console.log(angular.element(controllerElement));
            var controllerScope = angular.element(controllerElement).scope();
            console.log(controllerScope);
            */
            /*
            var elem = angular.element(document.querySelector('[ng-app]'));
            var injector = elem.injector();
             var $rootScope = injector.get('$rootScope');
            console.log($rootscope);
             $rootScope.$apply(function(){
               $rootScope.text = new Date();
             });
             */
            
		},
		error: function () {
			HideNotify();
			bootbox.alert($.t('Problem setting Setpoint value'));
		}
	});
}


// Blockly import export buttons
function blocklyCreateExportButtons()
{
    if ( currentPage == "events" && !$('#IMain').length ){
        console.log("THEME JS - waiting for blockly to load ZZZzzz");
        setTimeout(blocklyCreateExportButtons,1000);
        return;
    }
    if ( !$('#blocklyimportexportbuttons').length ){
        
        // append buttons
        $('<div id="blocklyimportexportbuttons"><button id="blocklyimportbtn" class="btnstyle3">import</button><button id="blocklyexportbtn" class="btnstyle3">export</button></div>').insertAfter($('#IMain'));
        $('#blocklyexportbtn').click(function(){
            console.log("hoi");
            blocklyExport(); 
        });
        $('#blocklyimportbtn').click(function(){
            console.log("ha");
            blocklyImport(); 
        });
    }
}


// tick tock, update time ago
function updateLastUpdated()
{   
    //console.log("THEME JS - starting the clock");
    
    
    if (theme.features.time_ago.enabled === true){
        $('.lastupdated').hide();

        $('.timeagooutput').click(function() {
            console.log("swapping last updated time output");
            $(this).hide();
            $(this).siblings('.lastupdated').show();
        });
        $('.lastupdated').click(function() {
            console.log("swapping last updated time output");
            $(this).hide();
            $(this).siblings('.timeagooutput').show();
        });        
    }
    
    function updateClocks() {
        if ( $('.lastupdate > span').length ) {
            console.log('THEME JS - clock: tick tock');
            
            // why not. Let's just copy the old time to a brand new footer. This makes adding the battery status a sure thing,
            $('.item').each(function(index) {
                $(this).find('.itemfooter .lastupdated').text( $(this).find('.lastupdate > span').text() );
            });
            
            if (typeof(Storage) !== "undefined" && theme.features.time_ago.enabled === true) {
                if (typeof $.lately !== "undefined") {
                    $.lately({
                    'target' : '.lastupdate > span'
                    }); 
                }
            }
            setTimeout(updateClocks, 7000);
        }else {
            console.log("THEME JS - can't and won't update clock because lastupdate items disappeared (probably opening new page)");
            clockIsRunning = false;
        }
    }
    if(clockIsRunning === false){
        clockIsRunning = true;
        updateClocks();
    }
}


// this sets the user CSS.
function loadUserCSS(){
    var userCSS = localStorage.getItem('userCSS');
    if(typeof userCSS !== "undefined"){
        console.log("THEME JS - inserting user CSS");
        $('head').append("<style>" + userCSS + "</style>");
    }else{
        console.log("THEME JS - no user CSS");
    }
}


// This function is called when the settings page is opened. It adds a new theme tab.
function showThemeSettings()
{   
    console.log("THEME JS - inserting theme settings");
    
    if( !$('#tabsystem').length ){
        console.log("no tabsystem yet.. cancelling");
        setTimeout(showThemeSettings, 100);
        return;
    }
    
    //move some things to new positions. I have proposed a completely new grouping of settings elements for Domoticz, but it wasn't accepted in (yet)
    $('#emailsetup').appendTo('#notifications');
    $("#tabs li a[data-target='#tabemail']").parent().remove();
    
    // green save button
    $('body.setup li.pull-right > a').removeClass('btn-danger').addClass('btn-success');
    $('body.setup .sub-tabs-apply').removeClass('btn-danger').addClass('btn-success');
    
    // make info prettier
    $('#settings td > span + a.norm-link').each(function(){
        $(this).prev('span').addBack().wrapAll('<p class="tip" />');
    });
    
    // actually adding the settings tab.
    if (typeof(Storage) !== "undefined") { // Do we even have theme settings?
        if (!$('#tabtheme').length){
            
            // modifying settings menu
            $('#tabs .pull-right').before('<li id="themeTabButton"><a data-target="#tabtheme" data-toggle="tab" data-i18n="Theme">Theme</a></li>');
            // If were on a mobile phone, make the settingsmenu a dropdown.   
            $('#tabs li:not(.pull-right)').click(function() {
                if ($(window).width() < 480) {
                    $(this).parent().toggleClass('menuopen');
                    if( !$(this).parent().hasClass('menuopen') ){
                        $(this).siblings('li:not(.pull-right)').slideUp("fast");
                    }else{
                        $(this).siblings('li:not(.pull-right)').slideDown("fast");
                    }
                }else{
                    $(this).siblings().show(); //safety, if user scaled/rotated the screen.
                    $(this).parent().removeClass('menuopen');
                }
            });
            $("#tabs").i18n(); // Make the translation
		
            // inserting the themesettings.html
            $('#my-tab-content').append('<div class="tab-pane" id="tabtheme"><section id="theme">Loading..</section></div>');
            $('#my-tab-content #theme').load("styles/aurora/themesettings.html",loadedSettingsHTML);
            
            // loadedSettingsHTML() was here
            
        }
    } else {
        // No Web Storage support.. hmm.
    }
}
            function loadedSettingsHTML(){ // when inserting is done..
                console.log("THEME JS - theme settings html loaded");
                $('#ActiveTabs').appendTo('#theme');
                $('#ActiveTabs').wrapAll('<div class="row-fluid" />');
                $("#tabtheme .span6 input:checkbox").each(function() {
                    if(typeof theme.features[this.value] !== "undefined"){
                        if (theme.features[this.value].enabled === true) {
                            $(this).prop("checked", true);
                        }else if (theme.features[this.value].enabled === false) {
                            $(this).prop( "checked", false );
                        }
                    }else{
                        console.log("THEME SHOULD BE RESET");
                        if ( typeof theme.upgradeAlerted === "undefined"){
                            HideNotify();
                            bootbox.alert('<h3>Congratulations on the theme upgrade!</h3><p>Please reset the theme by clicking here:</p><p><a onClick="resetTheme(); return false;" href=""><button class="btn btn-info">reset theme</button></a></p><p>(or find the theme reset button on the theme settings page)<p>');
                            theme.upgradeAlerted = "true";
                            console.log("theme.upgradeAlerted = " + theme.upgradeAlerted)
                            if (isEmptyObject(theme) === false){
                                localStorage.setObject("themeObject", theme);
                            }
                            
                        }
                    }
                });
                
                // Text color
                $('#textcolorpicker').colpick({
                    flat: true,
                    layout: 'hex',
                    submit: 0,
                    color: theme.textcolor,
                    onChange: function (hsb, hex, rgb, fromSetColor) {
                        var newTextColor = "#" + hex;
                        console.log("THEME JS - newTextColor = " + newTextColor);
                        theme.textcolor = newTextColor;
                        $('body,#colordemo').css('color', newTextColor);
                        localStorage.setObject("themeObject", theme);
                    }
                });
                
                // Background color
                $('#backgroundcolorpicker').colpick({
                    flat: true,
                    layout: 'hex',
                    submit: 0,
                    color: theme.backgroundcolor,
                    onChange: function (hsb, hex, rgb, fromSetColor) {
                        var newBGcolor = "#" + hex;
                        console.log("THEME JS - newBGcolor = " + newBGcolor);
                        theme.backgroundcolor = newBGcolor;
                        $('body,#colordemo').css('background-color', newBGcolor);
                        localStorage.setObject("themeObject", theme);
                    }
                });
                
                $('#textcolorpicker,#backgroundcolorpicker').mouseup(function(e) {
                    console.log("THEME JS - storing new colors in Domoticz");
                    storeThemeSettingsInDomoticz("update");
                });
                
                
                // colors demo
                $('#colordemo').css('color', theme.textcolor);
                $('#colordemo').css('background-color', theme.backgroundcolor);
                
                // Background image
                if(typeof theme.backgroundimage !== "undefined"){
                    $('#backgroundimageurl').val(theme.backgroundimage);
                }
                $('#backgroundimagesetbtn').click(function() {
                    var newBGIMG = "" + $('#backgroundimageurl').val();
                    theme.backgroundimage = newBGIMG;
                    localStorage.setObject("themeObject", theme);
                    $('body,#colordemo').css('background-image','url(' + theme.backgroundimage + ')');
                    $('body,#colordemo').css('background-attachment','fixed');
                    $('body,#colordemo').css('background-size','cover');
                });
                
                // The theme immediately saves the changes. This is because it was difficult to hook into the existing save system.
                $("#tabtheme input:checkbox").click(function() {
                    if ($(this).is(':checked')) {
                        // Apply and immediately save the new setting.
                        //console.log("THEME JS - saving new preference: user checked " + this.value);
                        theme.features[this.value].enabled = true;
                        loadThemeFeatureFiles(this.value);
                        
                        // If privacy settings were changed, save that in the log.
                        if(this.value == "extra_privacy" || this.value == "full_privacy"){
                           $.get('/json.htm?type=command&param=addlogmessage&message=' + theme.name + ' theme: privacy setting "' + this.value + '" was enabled.');
                        }
                        
                    } else { 
                        // if unchecked, then unload files.
                        //console.log("THEME JS - saving new preference: user unchecked " + this.value);
                        theme.features[this.value].enabled = false;
                        unloadThemeFeatureFiles(this.value);
                        
                        // if a parent checkbox is unchecked, let's also take care of the child checkbox. Otherwise features can still be turned on, but this might not be visible or obvious to the user.
                        if( $(this).is('.parentrequired') ){
                            $(this).siblings().each(function() {
                                if( $(this).is('.parentrequiredchild') ){
                                    $(this).attr('checked', false);
                                    var childName = $(this).val();
                                    unloadThemeFeatureFiles( childName );
                                    theme.features[childName].enabled = false;
                                }
                            });
                        }
                           
                        // If privacy settings were changed, save that in the log. For accountability.
                        if(this.value == "extra_privacy" || this.value == "full_privacy"){
                           $.get('/json.htm?type=command&param=addlogmessage&message=' + theme.name + ' theme: privacy setting "' + this.value + '" was disabled.');
                        }
                    }
                    // store the new settings.
                    localStorage.setObject("themeObject", theme);
                    storeThemeSettingsInDomoticz("update");
                });
                
                // button to reset the theme.
                $('#themeResetButton').click(function() {
                    resetTheme();
                });
                
                //load user CSS into textarea
                if(typeof localStorage.getItem('userCSS') === "string"){
                    console.log("found user CSS, it was a string");
                    var userCSS = localStorage.getItem('userCSS');
                    $('#userCSSinput').html(userCSS);
                }
                // save user CSS
                $('#userCSSsavebtn').click(function() {
                    console.log("save CSS button clicked");
                    var userCSS = $('#userCSSinput').val(); //JSON.stringify();
                    console.log("user css = " + userCSS);
                    localStorage.setItem('userCSS', userCSS);
                });
            }

// reset theme to defaults. Useful after an upgrade.
function resetTheme(){
    if (typeof(Storage) !== "undefined") {
        console.log("THEME JS - Starting theme reset. User features var: " + theme.userfeaturesvariable);
        if(typeof theme.userfeaturesvariable !== 'undefined'){
            var deleteFeaturesURL = '/json.htm?type=command&param=deleteuservariable&idx=' + theme.userfeaturesvariable;
            //console.log(deleteFeaturesURL);
            $.ajax({
                url: deleteFeaturesURL,
                async: true,
                dataType: 'json',
                success: function (data) {
                    if (data.status == "ERR") {
                        console.log("THEME JS - server responded with error while deleting user variable that stored feature settings");
                        HideNotify();
                        bootbox.alert($.t('Domoticz gave an error when trying to remove the theme feature settings data'));
                    }
                    if (data.status == "OK") {
                        console.log("THEME JS - deleting user variable that stored features was succesful");
                        localStorage.clear();
                        $.get('/json.htm?type=command&param=addlogmessage&message=' + theme.name + ' theme was reset to defaults');
                        
                        window.location.reload(true);
                        //setTimeout(window.location.href = baseURL, 2000);
                    }
                },
                error: function () {
                    console.log("THEME JS - The theme was unable to delete the user variable in Domoticz that holds the theme feature settings");
                    HideNotify();
                    bootbox.alert($.t('Error communicating with Domoticz, theme feature settings not reset.'));
                }
            });
            var deleteStylingURL = '/json.htm?type=command&param=deleteuservariable&idx=' + theme.userstylingvariable;
            console.log("delete styling url: " + deleteStylingURL);
            $.get( deleteStylingURL );
        }else{
            localStorage.clear();
        }
    }
}


// HELPER FUNCTIONS

function truncateBefore(html, pattern) {
  return html.slice(html.indexOf(pattern) + pattern.length);
};
function truncateAfter(html, pattern) {
  return html.slice(0, html.indexOf(pattern));
} 
        
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function isEmptyObject(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}

function machineName(string){
    string = string.replace(/\s/g, '').replace(/\\/g, '').replace(/\//g, '').replace(/,/g, '').replace(/\+/g, '');
    return string.toLowerCase().trim();
}


function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',.90)';
    }
    throw new Error('Bad Hex');
}


// Fullscreen library
/*!
* screenfull
* v3.3.2 - 2017-10-27
* (c) Sindre Sorhus; MIT License
*/

!function(){"use strict";var a="undefined"!=typeof window&&void 0!==window.document?window.document:{},b="undefined"!=typeof module&&module.exports,c="undefined"!=typeof Element&&"ALLOW_KEYBOARD_INPUT"in Element,d=function(){for(var b,c=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],d=0,e=c.length,f={};d<e;d++)if((b=c[d])&&b[1]in a){for(d=0;d<b.length;d++)f[c[0][d]]=b[d];return f}return!1}(),e={change:d.fullscreenchange,error:d.fullscreenerror},f={request:function(b){var e=d.requestFullscreen;b=b||a.documentElement,/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)?b[e]():b[e](c&&Element.ALLOW_KEYBOARD_INPUT)},exit:function(){a[d.exitFullscreen]()},toggle:function(a){this.isFullscreen?this.exit():this.request(a)},onchange:function(a){this.on("change",a)},onerror:function(a){this.on("error",a)},on:function(b,c){var d=e[b];d&&a.addEventListener(d,c,!1)},off:function(b,c){var d=e[b];d&&a.removeEventListener(d,c,!1)},raw:d};if(!d)return void(b?module.exports=!1:window.screenfull=!1);Object.defineProperties(f,{isFullscreen:{get:function(){return Boolean(a[d.fullscreenElement])}},element:{enumerable:!0,get:function(){return a[d.fullscreenElement]}},enabled:{enumerable:!0,get:function(){return Boolean(a[d.fullscreenEnabled])}}}),b?module.exports=f:window.screenfull=f}();


// watch.js library, for keeping track of object changes.
/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE8*, IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 * For IE8 (and other legacy browsers) WatchJS will use dirty checking  
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 *
 * LICENSE: MIT
 */
"use strict";!function(a){"object"==typeof exports?module.exports=a():"function"==typeof define&&define.amd?define(a):(window.WatchJS=a(),window.watch=window.WatchJS.watch,window.unwatch=window.WatchJS.unwatch,window.callWatchers=window.WatchJS.callWatchers)}(function(){function x(){w=null;for(var a=0;a<v.length;a++)v[a]();v.length=0}var a={noMore:!1,useDirtyCheck:!1},b=[],c=[],d=[],e=!1;try{e=Object.defineProperty&&Object.defineProperty({},"x",{})}catch(a){}var f=function(a){var b={};return a&&"[object Function]"==b.toString.call(a)},h=function(a){return"[object Array]"===Object.prototype.toString.call(a)},i=function(a){return"[object Object]"==={}.toString.apply(a)},j=function(a,b){var c=[],d=[];if("string"!=typeof a&&"string"!=typeof b){if(h(a)&&b)for(var e=0;e<a.length;e++)void 0===b[e]&&c.push(e);else for(var e in a)a.hasOwnProperty(e)&&b&&void 0===b[e]&&c.push(e);if(h(b)&&a)for(var f=0;f<b.length;f++)void 0===a[f]&&d.push(f);else for(var f in b)b.hasOwnProperty(f)&&a&&void 0===a[f]&&d.push(f)}return{added:c,removed:d}},k=function(a){if(null==a||"object"!=typeof a)return a;var b=a.constructor();for(var c in a)b[c]=a[c];return b},l=function(a,b,c,d){try{Object.observe(a,function(a){a.forEach(function(a){a.name===b&&d(a.object[a.name])})})}catch(e){try{Object.defineProperty(a,b,{get:c,set:function(a){d.call(this,a,!0)},enumerable:!0,configurable:!0})}catch(e){try{Object.prototype.__defineGetter__.call(a,b,c),Object.prototype.__defineSetter__.call(a,b,function(a){d.call(this,a,!0)})}catch(c){n(a,b,d)}}}},m=function(a,b,c){try{Object.defineProperty(a,b,{enumerable:!1,configurable:!0,writable:!1,value:c})}catch(d){a[b]=c}},n=function(a,b,d){c[c.length]={prop:b,object:a,orig:k(a[b]),callback:d}},o=function(){f(arguments[1])?p.apply(this,arguments):h(arguments[1])?q.apply(this,arguments):r.apply(this,arguments)},p=function(a,b,c,d){if("string"!=typeof a&&(a instanceof Object||h(a))){if(h(a)){if(D(a,"__watchall__",b,c),void 0===c||c>0)for(var f=0;f<a.length;f++)p(a[f],b,c,d)}else{var f,g=[];for(f in a)"$val"==f||!e&&"watchers"===f||Object.prototype.hasOwnProperty.call(a,f)&&g.push(f);q(a,g,b,c,d)}d&&R(a,"$$watchlengthsubjectroot",b,c)}},q=function(a,b,c,d,e){if("string"!=typeof a&&(a instanceof Object||h(a)))for(var f=0;f<b.length;f++){var g=b[f];r(a,g,c,d,e)}},r=function(a,b,c,d,e){"string"!=typeof a&&(a instanceof Object||h(a))&&(f(a[b])||(null!=a[b]&&(void 0===d||d>0)&&p(a[b],c,void 0!==d?d-1:d),D(a,b,c,d),e&&(void 0===d||d>0)&&R(a,b,c,d)))},s=function(){f(arguments[1])?t.apply(this,arguments):h(arguments[1])?u.apply(this,arguments):I.apply(this,arguments)},t=function(a,b){if(!(a instanceof String)&&(a instanceof Object||h(a)))if(h(a)){for(var c=["__watchall__"],d=0;d<a.length;d++)c.push(d);u(a,c,b)}else{var e=function(a){var c=[];for(var d in a)a.hasOwnProperty(d)&&(a[d]instanceof Object?e(a[d]):c.push(d));u(a,c,b)};e(a)}},u=function(a,b,c){for(var d in b)b.hasOwnProperty(d)&&I(a,b[d],c)},v=[],w=null,y=function(){return w||(w=setTimeout(x)),w},z=function(a){null==w&&y(),v[v.length]=a},A=function(){var a=f(arguments[2])?C:B;a.apply(this,arguments)},B=function(a,b,c,d){var i,e=null,f=-1,g=h(a),j=function(c,d,h,i){var j=y();if(f!==j&&(f=j,e={type:"update"},e.value=a,e.splices=null,z(function(){b.call(this,e),e=null})),g&&a===this&&null!==e){if("pop"===d||"shift"===d)h=[],i=[i];else if("push"===d||"unshift"===d)h=[h],i=[];else if("splice"!==d)return;e.splices||(e.splices=[]),e.splices[e.splices.length]={index:c,deleteCount:i?i.length:0,addedCount:h?h.length:0,added:h,deleted:i}}};i=1==c?void 0:0,p(a,j,i,d)},C=function(a,b,c,d,e){a&&b&&(r(a,b,function(a,b,f,g){var j={type:"update"};j.value=f,j.oldvalue=g,(d&&i(f)||h(f))&&B(f,c,d,e),c.call(this,j)},0),(d&&i(a[b])||h(a[b]))&&B(a[b],c,d,e))},D=function(b,c,d,e){var f=!1,g=h(b);b.watchers||(m(b,"watchers",{}),g&&H(b,function(a,d,f,g){if(N(b,a,d,f,g),0!==e&&f&&(i(f)||h(f))){var j,k,l,m,n=b.watchers[c];for((m=b.watchers.__watchall__)&&(n=n?n.concat(m):m),l=n?n.length:0,j=0;j<l;j++)if("splice"!==d)p(f,n[j],void 0===e?e:e-1);else for(k=0;k<f.length;k++)p(f[k],n[j],void 0===e?e:e-1)}})),b.watchers[c]||(b.watchers[c]=[],g||(f=!0));for(var j=0;j<b.watchers[c].length;j++)if(b.watchers[c][j]===d)return;if(b.watchers[c].push(d),f){var k=b[c],o=function(){return k},q=function(d,f){var g=k;if(k=d,0!==e&&b[c]&&(i(b[c])||h(b[c]))&&!b[c].watchers){var j,l=b.watchers[c].length;for(j=0;j<l;j++)p(b[c],b.watchers[c][j],void 0===e?e:e-1)}return K(b,c)?void L(b,c):void(a.noMore||g!==d&&(f?N(b,c,"set",d,g):E(b,c,"set",d,g),a.noMore=!1))};a.useDirtyCheck?n(b,c,q):l(b,c,o,q)}},E=function(a,b,c,d,e){if(void 0!==b){var f,g,h=a.watchers[b];(g=a.watchers.__watchall__)&&(h=h?h.concat(g):g),f=h?h.length:0;for(var i=0;i<f;i++)h[i].call(a,b,c,d,e)}else for(var b in a)a.hasOwnProperty(b)&&E(a,b,c,d,e)},F=["pop","push","reverse","shift","sort","slice","unshift","splice"],G=function(a,b,c,d){m(a,c,function(){var f,g,h,i,e=0;if("splice"===c){var j=arguments[0],k=j+arguments[1];for(h=a.slice(j,k),g=[],f=2;f<arguments.length;f++)g[f-2]=arguments[f];e=j}else g=arguments.length>0?arguments[0]:void 0;return i=b.apply(a,arguments),"slice"!==c&&("pop"===c?(h=i,e=a.length):"push"===c?e=a.length-1:"shift"===c?h=i:"unshift"!==c&&void 0===g&&(g=i),d.call(a,e,c,g,h)),i})},H=function(a,b){if(f(b)&&a&&!(a instanceof String)&&h(a))for(var d,c=F.length;c--;)d=F[c],G(a,a[d],d,b)},I=function(a,b,c){if(b){if(a.watchers[b])if(void 0===c)delete a.watchers[b];else for(var d=0;d<a.watchers[b].length;d++){var e=a.watchers[b][d];e==c&&a.watchers[b].splice(d,1)}}else delete a.watchers;S(a,b,c),T(a,b)},J=function(a,b){if(a.watchers){var c="__wjs_suspend__"+(void 0!==b?b:"");a.watchers[c]=!0}},K=function(a,b){return a.watchers&&(a.watchers.__wjs_suspend__||a.watchers["__wjs_suspend__"+b])},L=function(a,b){z(function(){delete a.watchers.__wjs_suspend__,delete a.watchers["__wjs_suspend__"+b]})},M=null,N=function(a,b,c,e,f){d[d.length]={obj:a,prop:b,mode:c,newval:e,oldval:f},null===M&&(M=setTimeout(O))},O=function(){var a=null;M=null;for(var b=0;b<d.length;b++)a=d[b],E(a.obj,a.prop,a.mode,a.newval,a.oldval);a&&(d=[],a=null)},P=function(){for(var a=0;a<b.length;a++){var d=b[a];if("$$watchlengthsubjectroot"===d.prop){var e=j(d.obj,d.actual);(e.added.length||e.removed.length)&&(e.added.length&&q(d.obj,e.added,d.watcher,d.level-1,!0),d.watcher.call(d.obj,"root","differentattr",e,d.actual)),d.actual=k(d.obj)}else{var e=j(d.obj[d.prop],d.actual);if(e.added.length||e.removed.length){if(e.added.length)for(var f=0;f<d.obj.watchers[d.prop].length;f++)q(d.obj[d.prop],e.added,d.obj.watchers[d.prop][f],d.level-1,!0);E(d.obj,d.prop,"differentattr",e,d.actual)}d.actual=k(d.obj[d.prop])}}var g,h;if(c.length>0)for(var a=0;a<c.length;a++)g=c[a],h=g.object[g.prop],Q(g.orig,h)||(g.orig=k(h),g.callback(h))},Q=function(a,b){var c,d=!0;if(a!==b)if(i(a)){for(c in a)if((e||"watchers"!==c)&&a[c]!==b[c]){d=!1;break}}else d=!1;return d},R=function(a,c,d,e){var f;f=k("$$watchlengthsubjectroot"===c?a:a[c]),b.push({obj:a,prop:c,actual:f,watcher:d,level:e})},S=function(a,c,d){for(var e=0;e<b.length;e++){var f=b[e];f.obj==a&&(c&&f.prop!=c||d&&f.watcher!=d||b.splice(e--,1))}},T=function(a,b){for(var d,e=0;e<c.length;e++){var f=c[e],g=f.object.watchers;d=f.object==a&&(!b||f.prop==b)&&g&&(!b||!g[b]||0==g[b].length),d&&c.splice(e--,1)}};return setInterval(P,50),a.watch=o,a.unwatch=s,a.callWatchers=E,a.suspend=J,a.onChange=A,a});

function getScope(ctrlName) {
    var sel = 'html[ng-controller="' + ctrlName + '"]';
    return angular.element(sel).scope();
}

console.log( "THEME JS - loaded" );
