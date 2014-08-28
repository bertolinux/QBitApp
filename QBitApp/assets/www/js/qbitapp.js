function setTorrentsTimer() {
	setTimeout(function() {
	    refresh();
	    setTorrentsTimer();
	}, 10000);
}

function hideAll() {
	var isVisibleSomething = false;
	if (
			$('#div_dialogCommands').is(':visible') ||
			$('#div_upload').is(':visible')	
		)
		isVisibleSomething = true;
		
	$("#div_dialogCommands").hide("fast");
	$("#div_upload").hide("fast");
	return isVisibleSomething;
}

function backButton() {
	if (!hideAll())
		if (confirm("Exit?"))
			navigator.app.exitApp();
}

function upload() {
	hideAll();
	$("#div_upload").show("fast");
}

function reset() {
	if (confirm("Reset Connections?")) {
		$("#div_downloads").empty();
		app.deleteConnection();
		init();
	}
}

function manageButton(hash,button) {
	var relButtonCmd = { 
		"stop":				"pause", 
		"start":			"resume", 
		"delete":			"delete",
		"deletefromdisk":	"deletePerm"
	};
	sendCommand(hash,relButtonCmd[button]);
}

function sendCommand(hash,cmd) {
	$.ajax({
		url: "http://" + connectionSettings.hostname + ":" + connectionSettings.port + "/command/"+cmd,
		data: { hash: hash, hashes: hash },
        success: function(data) {
        	$("#div_dialogCommands").hide("fast");
        	setTimeout(function() {
			    refresh();
			}, 3000);
        },
        error: function() {
        	$("#div_dialogCommands").hide("fast");
        	alert("Error contacting: " + connectionSettings.hostname + ":" + connectionSettings.port);
        }
    });
}

function onClickTorrent(hash,name) {
	hideAll();
    $("#div_torrentNameOnCmdDialog").empty();
    $("#div_dialogCommands").find('.name').text(name);
    $("#hash").val(hash);
    $("#div_dialogCommands").show("fast");
}

var connectionSettings = {};
connectionSettings.hostname = null;
connectionSettings.port = null;
connectionSettings.username = null;
connectionSettings.password = null;

var ajaxInit = false;
var totalHeight = screen.height;
var totalWidth = screen.width-16;

function refresh() {
	if (!ajaxInit) {
		$.ajaxSetup({
			type: 'POST',
			username: connectionSettings.username, 
			password: connectionSettings.password
		});
		$('#div_container_downloads').width(totalWidth);
		$('#div_downloads').width(totalWidth)-10;
	}
	$.ajax({
		dataType: "json",
		url: "http://" + connectionSettings.hostname + ":" + connectionSettings.port + "/json/events",
		success: function(data) {
        	var items = [];
        	$("#div_downloads").empty();
    	for (var i = 0; i < 1; i++)
        	$.each(data,function(key,val) {
	        	var torrentStyle = "downloading";
                if (val.state == "pausedDL" || val.state == "pausedUP")
                	torrentStyle = "paused";
	        	else if (val.progress == 1)
                	torrentStyle = "finished";
                else if (val.progress < 0.01) {
                	torrentStyle = "justStarted";
                }
                var name=val.name.replace(/ /g,"_");
                var hash=val.hash;
                
                var $template = $('#initial').clone();
                $template.find('.size').text(val.size);
                $template.find('.speed').text(val.dlspeed);
                $template.find('.eta').text(val.eta);
            	$template.attr("id",key);
            	$template.find('.name').text(val.name);
            	$template.find('.perc').text(Math.round(val.progress*10000)/100 + "%");
            	$template.addClass(torrentStyle).removeClass("null");
            	$template.attr("onclick","onClickTorrent('" + hash + "','" + name + "')");

            	$template.show();
            	$('#div_downloads').append($template);

	        });
        },
        error: function() {
        	alert("Error contacting: " + connectionSettings.hostname + ":" + connectionSettings.port + "/json/events");
        }
    });
}