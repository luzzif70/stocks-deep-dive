// it is convention to use all caps for constants
// constants are variables whose value are not expected to change, immutable

// stocl api from https://www.alphavantage.co/
// my api key: 4015WQ58T9LOG18M

//var ALPHA_API_Q = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=";
var ALPHA_API_Q = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";

var ALPHA_API_MA = "https://www.alphavantage.co/query?function=SMA&symbol=";

// declare object that will contain stock info
var stockInfo = {symbol:"",dateWMA:[],WMA:[],dateMMA:[],MMA:[]}; 
// check flag; it will increase by one for each successful api request
var checkFlag = 0;

// seriesTSV will contain the final value series in tsv (tab separated values) format used in D3 viz
var seriesWMATsv = 'date\tclose\n'; 
var seriesMMATsv = 'date\tclose\n'; 

//getALPHAquote: get stock ticker's daily closing quote
function getALPHAquote(title){

    $.get(ALPHA_API_Q + title + "&apikey=4015WQ58T9LOG18M",function(searchResult){
          //add simbol and quote to inner result array variable
          innerRes.push(searchResult["Meta Data"]["2. Symbol"]);
          innerRes.push("quote");
          innerRes.push(searchResult["Time Series (Daily)"]["2017-12-22"]["4. close"]);
          console.log(innerRes);                                                            
   });
};

//getALPHAma: get stock ticker's moving average
function getALPHAma(title,maType){

console.log("inside api");

$.when($.get(ALPHA_API_MA + title + "&interval=" + maType + "&time_period=10&series_type=close&apikey=4015WQ58T9LOG18M",function(searchResult){

          //convert object to Tab Separated Value file (TSV) to be used in D3 viz
          //for(i=0;i<Object.keys(series).length;i++){seriesTsv = seriesTsv + Object.keys(series)[i].substring(0, 10) + "\t" + Object.values(series)[i]["SMA"] + "\n";}
         

          var series = searchResult["Technical Analysis: SMA"];

          console.log(series);

          if (typeof series != "undefined") {

              //save symbol name to object
              stockInfo.symbol = searchResult["Meta Data"]["1: Symbol"];

              if(maType == "weekly"){
                  console.log("Pulling weekly moving average...");
                  //save dates to object
                  stockInfo.dateWMA = Object.keys(series)
                  for(i=0;i<Object.keys(series).length;i++){stockInfo.WMA[i]=Object.values(series)[i]["SMA"];};
              }
              else if(maType == "monthly"){
                  console.log("Pulling monthly moving average...");
                  //save dates to object
                  stockInfo.dateMMA = Object.keys(series)
                  for(i=0;i<Object.keys(series).length;i++){stockInfo.MMA[i]=Object.values(series)[i]["SMA"];};
              };

              checkFlag +=1;
              console.log(checkFlag);
          };
          //draw trend line
          //var data = d3.tsv.parse(seriesTsv);
          //console.log(data);

          //d3.tsv("data.tsv", function(data) {
          //console.log(data[0].x);
          //});
   })
).done(function(){
  if(checkFlag==2){
    $('h2').empty();
    $('#searchField').val("");
    $('#searchField').attr("placeholder", "Search for stock ticker");
    //convert object to Tab Separated Value file (TSV) to be used in D3 viz
    for(i=0;i<stockInfo.dateWMA.length;i++){seriesWMATsv = seriesWMATsv + stockInfo.dateWMA[i].substring(0, 10) + "\t" + stockInfo.WMA[i] + "\n";}
    for(i=0;i<stockInfo.dateMMA.length;i++){seriesMMATsv = seriesMMATsv + stockInfo.dateMMA[i].substring(0, 10) + "\t" + stockInfo.MMA[i] + "\n";}
    
          var data = d3.tsv.parse(seriesWMATsv);
          console.log(data);

    // reset checkFlag
    checkFlag =0;
  }
  else if(checkFlag==0){$('h2').text("Ticker not found, please try again.");}
  $('#searchBtn').prop("disabled",false);
}).fail(function() {
        $('h2').text("API request failed, please try again.");
        // reset checkFlag
        checkFlag =0;
    });
}; // end of function getALPHAma;


$('#searchBtn').on('click',function(event) {

  event.preventDefault();

  var ticker = $('#searchField').val();
  // pull moving averages from api
  if(ticker!=""){
      $('h2').text("Retrieving data for " + ticker + " please wait ...");
      $('#searchBtn').prop("disabled",true);
      getALPHAma(ticker,"weekly"); // pull weekly averages
      getALPHAma(ticker,"monthly"); // pull montly averages
  }
  else {
      $('#searchField').attr("placeholder", "Please type Ticker!");
  };

});
