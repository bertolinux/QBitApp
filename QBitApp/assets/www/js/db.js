//Based on http://www.html5rocks.com/en/tutorials/webdatabase/todo/

document.addEventListener("deviceready", init, false);
document.addEventListener("touchstart", function() {}, false);

var app = {};
app.db = null;
app.hostname = null;
app.port = null;
app.username = null;
app.password = null;
      
app.openDb = function() {
    app.db = window.openDatabase("QBitHtml5", "1.0", "Cordova Demo", 200000);
}
      
app.createTable = function() {
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS connections(hostname TEXT, port TEXT, username TEXT, password TEXT)", []);
	});
}

app.saveConnection = function(form) {
	app.createConnection(form.hostname.value,form.port.value,form.username.value,form.password.value);
	$("#connectionDialog").hide();
	app.getConnection();
}

app.createConnection = function(hostname,port,username,password) {
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("INSERT INTO connections(hostname,port,username,password) VALUES (?,?,?,?)",
					  [hostname,port,username,password],
					  app.onSuccess,
					  app.onError);
	});
}
      
app.onError = function(tx, e) {
	console.log("Error: " + e.message);
} 
      
app.onSuccess = function(tx, r) {
	
}
      
app.deleteConnection = function() {
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("DELETE FROM connections", [],
					  app.onSuccess,
					  app.onError);
	});
}

app.getConnection = function() {
	var render = function (tx, rs) {
		connectionSettings.hostname = rs.rows.item(0).hostname;
		connectionSettings.port = rs.rows.item(0).port;
		connectionSettings.username = rs.rows.item(0).username;
		connectionSettings.password = rs.rows.item(0).password;
		refresh();
		setTorrentsTimer();
	}
    
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM connections", [], 
					  render, 
					  app.onError);
	});
}

app.manageConnection = function() {
	var existsConn = function (tx, rs) {
		if (rs.rows.length == 0)
			app.dialogCreateConnection();
		else
			app.getConnection();
	}
	
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM connections", [], 
					  existsConn, 
					  app.onError);
	});
}    

app.dialogCreateConnection = function() {
	$("#connectionDialog").show();
	$("#connectionDialog").find("form").find("input[type=text]").first().focus();
}

function init() {
	document.addEventListener("backbutton", backButton, false);
	app.openDb();
	app.createTable();
	app.manageConnection();
}
