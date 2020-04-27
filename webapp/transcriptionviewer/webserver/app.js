var express = require('express');
var app = express();


var port = process.env.PORT || 8080;

var router = express.Router();
var fs = require('fs'),
    path = require('path'),
    filePath = path.join(__dirname, '/dist/transcriptionviewer/assets/config/config.prod.json');
console.log('——————————- Run on port '+ port);

/****************************** Router ***************************/
router.get('*', function(req, res){
    res.sendFile('index.html', { root: __dirname + '/dist/transcriptionviewer' });
});

/****************************** /Router ***************************/


app.get('/assets/config/config.prod.json',function(req,res){
  console.log('got here')
  fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        console.log('received data: ' + data);
        var result = data.replace(/#{appInsightsKey}/g, process.env.APPSETTING_APPINSIGHTS_INSTRUMENTATIONKEY);
       result = result.replace(/#{configUrl}/g, process.env.APPSETTING_configServiceUrl);
        res.writeHead(200, {'Content-Type': 'text/json'});
        res.write(result);
        res.end();
    } else {
        console.log(err);
    }
});
});
app.use(express.static(__dirname + '/dist/transcriptionviewer')); // Static (public) folder
app.use('/', router); // app.use('/parent', router); call all from localhost:port/parent/*

app.listen(port);
