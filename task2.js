
var http = require('http');
var asynclib = require('async');
var req = require("request");
var cheerio = require('cheerio');
const PORT=8080;

function isURLValid(request){
  var reqUrl = request.url;
  if(reqUrl.startsWith("/I/want/title")){
    return true;
  }
  else{
    return false;
  }
}
function getWebpagesUrls(request){
  var url = require('url');
  var queryData = url.parse(request.url, true).query;

  console.log(queryData);
  var address = queryData.address;
  if(address){
    if(address.constructor == Array){
      // console.log("Address is array");
      return address;

    }
    else{
        return [address];
    }
  }
  else{
    return null;
  }
}

function handleRequest(request, response){

  if(isURLValid(request)){
    var urls = getWebpagesUrls(request);
    var numOfAddresses = 0;
    if(urls != null){
      numOfAddresses =  urls.length;
      response.write("<html><head></head><body><h1>Following are the titles of the given websites: </h1><ul>")
        asynclib.each(urls, fetchTitle, function (err, result) {
            if(err){
              console.log("Error : "+err);
            }
            console.log("On End Called : "+result);
            response.end("</ul></body></html>")
        });

      console.log("Number of addresses : "+numOfAddresses);
    }
    else{
      console.log("Urls is null");
      response.end("No Address Found")
    }

  }
  else {
    response.statusCode = 404;
    response.end("Error: 404 Not Found");
  }




  function fetchTitle(urlStr, callback){

      console.log("Url Called By each Series : "+urlStr);
      req(constructUrlFromString(urlStr), function (err, res, body) {
        console.log("Respnse Recieved")
        if (err) {
            response.write("<li>"+urlStr+" - NO RESPONSE</li>");
        } else if (res.statusCode !== 200) {
            err = new Error("Unexpected status code: " + res.statusCode);
            err.res = res;
        }
        else{
          var html = cheerio.load(body);
          var title = html("title").text();
          if (title) {
            displayURLWithTitle(urlStr, title, response);
          }
          else{
            displayURLWithTitle(urlStr, "No Title", response);
          }
        }
        callback();
    })
    }
}


function displayURLWithTitle(url, title,resp){
      resp.write("<li>"+url+" - \""+title+"\"</li>");
}

function constructUrlFromString(urlStr){
  if(urlStr.startsWith("http://")){
    return urlStr;
  }
  else {
    return "http://"+urlStr;
  }
}

var server = http.createServer(function(request, response){
  handleRequest(request, response)
});

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
