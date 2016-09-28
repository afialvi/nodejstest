var http = require('http');
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

        // console.log("Url : "+ urls[i]);
        var titlesFetchedCounter = 0;
        for(var i = 0; i < numOfAddresses; i++){
        fetchTitle(urls[i], numOfAddresses);
      }
      console.log("Number of addresses : "+numOfAddresses);
    }
    else{
      console.log("Urls is null");
      response.end("No Address Found")
    }

  }
  else {
    response.statusCode = 404;
    response.end("Error: 404 Not Found")
  }


    function fetchTitle(urlStr, totalNumOfAddress){

      req(constructUrlFromString(urlStr), function (err, res, body) {
        console.log("Respnse Recieved")
        if (err) {
            response.end("<li>"+urlStr+" - "+"NO RESPONSE"+"</li></ul></body></html>");
        } else if (res.statusCode !== 200) {
            err = new Error("Unexpected status code: " + res.statusCode);
            err.res = res;
        }
        else{
              var html = cheerio.load(body);
              var title = html("title").text();
              if (title) {
                displayURLWithTitle(urlStr, title, totalNumOfAddress, response, titlesFetchedCounter);
              }
              else{
                displayURLWithTitle(urlStr, "No Title", totalNumOfAddress, response, titlesFetchedCounter);
              }
        }
        titlesFetchedCounter++;
    })



    }
}
function constructUrlFromString(urlStr){
  if(urlStr.startsWith("http://")){
    return urlStr;
  }
  else {
    return "http://"+urlStr;
  }
}
function displayURLWithTitle(url, title, totalNumOfAddress,response, currTitleNumber){
  if(currTitleNumber == totalNumOfAddress-1){
    response.end("<li>"+url+" - \""+title+"\"</li></ul></body></html>");
  }
  else{
    response.write("<li>"+url+" - \""+title+"\"</li>");
  }
}

var server = http.createServer(function(request, response){
  handleRequest(request, response)
});

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
