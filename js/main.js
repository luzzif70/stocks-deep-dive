// stocl api from https://www.alphavantage.co/
// This script let you pull and visualize Moving Average trends for different stocks
// Author: Fabio Luzzi
// Date January 15 2018
// Note: for the D3 viz I used an existing chart and adapted it to my script
// Original D3 chart from: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
// my api key: 4015WQ58T9LOG18M

var ALPHA_API_Q = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";

var ALPHA_API_MA = "https://www.alphavantage.co/query?function=SMA&symbol=";

// declare object that will contain stock info
var stockInfo = {symbol:"",dateDMA:[],DMA:[],dateWMA:[],WMA:[],dateMMA:[],MMA:[]}; 
// check flag; it will increase by one for each successful api request
var checkFlag = 0;
// seriesTSV will contain the final value series in tsv (tab separated values) format used in D3 viz
var seriesDMATsv = ''; 
var seriesWMATsv = ''; 
var seriesMMATsv = ''; 

var seriesTsv = 'metric\tdate\tclose\n'; 

var watchList = [];

var watchListCount = 0;

// function used to clear TSV data sets
function emptyDataSets(){
  seriesDMATsv = ''; 
  seriesWMATsv = ''; 
  seriesMMATsv = ''; 
  seriesTsv = 'metric\tdate\tclose\n';
};

// this function will 'refresh' the event listeners in order to pick-up new stocks from the watch-list
function wlListener(){

    $('.wlItem').on('click',function(e) 
    {
      e.preventDefault();
      e.stopPropagation();  
      var idtofetch = $(this).attr("id");
      emptyDataSets();
      runAPIs(idtofetch);
      console.log(idtofetch);
    });

};


function runAPIs(ticker){
      emptyDataSets(); // remove previous data from data arrays
      $('h2').text("Retrieving data for " + ticker + " please wait ...");
      $('#searchBtn').prop("disabled",true);
      getALPHAma(ticker,"daily"); // pull daily averages
      getALPHAma(ticker,"weekly"); // pull weekly averages
      getALPHAma(ticker,"monthly"); // pull montly averages
      console.log(ticker);
    }

//getALPHAma: get stock ticker's moving average
function getALPHAma(title,maType){

console.log("inside api");

$.when($.get(ALPHA_API_MA + title + "&interval=" + maType + "&time_period=10&series_type=close&apikey=4015WQ58T9LOG18M",function(searchResult){
         
          $('h3').css('color', '#505C69');
          $('h3').text("Processing " + maType + " MA...");

          var series = searchResult["Technical Analysis: SMA"];

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
              }
              else if(maType == "daily"){
                  console.log("Pulling daily moving average...");
                  //save dates to object
                  stockInfo.dateDMA = Object.keys(series)
                  for(i=0;i<Object.keys(series).length;i++){stockInfo.DMA[i]=Object.values(series)[i]["SMA"];};
              };

              checkFlag +=1;
              console.log('fag = ' + checkFlag);
          };
   })
).done(function(){
  if(checkFlag==3){
    $('h2').empty();
    $('h3').css('color', '#ffffff');
    $('#searchField').val("");
    $('#searchField').attr("placeholder", "Search for stock ticker (e.g. AMZN)");
    //convert object to Tab Separated Value file (TSV) to be used in D3 viz
    for(i=0;i<stockInfo.dateDMA.length;i++){seriesDMATsv = seriesDMATsv + 'daily' + "\t" + stockInfo.dateDMA[i].substring(0, 10) + "\t" + stockInfo.DMA[i] + "\n";}
    for(i=0;i<stockInfo.dateWMA.length;i++){seriesWMATsv = seriesWMATsv + 'weekly' + "\t" + stockInfo.dateWMA[i].substring(0, 10) + "\t" + stockInfo.WMA[i] + "\n";}
    for(i=0;i<stockInfo.dateMMA.length;i++){seriesMMATsv = seriesMMATsv + 'monthly' + "\t" + stockInfo.dateMMA[i].substring(0, 10) + "\t" + stockInfo.MMA[i] + "\n";}
    
    seriesTsv = seriesTsv + seriesDMATsv + seriesWMATsv + seriesMMATsv;

    //Remove existing visual (if any) & call visualization function
    console.log('removing chart...');
    d3.select("svg").remove();
    filterData(seriesTsv,"daily");
    // Set default to daily MA
    $('#daily').addClass('active');
    //display chart title
    $('h2').text("Moving average trend for " + title);
    // reset checkFlag
    checkFlag =0;
    emptyDataSets();
  }
  else if(checkFlag==0){$('h2').text("Ticker not found, please try again.");}
  $('#searchBtn').prop("disabled",false);
}).fail(function() {
        $('h2').text("API request failed, please try again.");
        // reset checkFlag
        checkFlag =0;
        emptyDataSets();
    });
}; // end of function getALPHAma;

//EVENT LISTENERS BELOW
// load a new ticker from search box and display default chart
$('#searchBtn').on('click',function(event) {

  event.preventDefault();

  $('.horizontalButtons').removeClass('active');

  var ticker = $('#searchField').val();
  // pull moving averages from api
  if(ticker!=""){
      runAPIs(ticker);
  }
  else {
      $('#searchField').attr("placeholder", "Please type Ticker!");
  };

});

// Events from button group below
// display daily MA chart
$('#daily').on('click',function(event) {
    $('.horizontalButtons').removeClass('active');
    $('#daily').addClass('active');
    d3.select("svg").remove();
    filterData(seriesTsv,"daily");
});

// display weekly MA chart
$('#weekly').on('click',function(event) {
    $('.horizontalButtons').removeClass('active');
    $('#weekly').addClass('active');
    d3.select("svg").remove();
    filterData(seriesTsv,"weekly");
});

// display monthly MA chart
$('#monthly').on('click',function(event) {
    $('.horizontalButtons').removeClass('active');
    $('#monthly').addClass('active');
    d3.select("svg").remove();
    filterData(seriesTsv,"monthly");
});

// add current stock to watch-list
$('#wl').on('click',function(event) {

    if(stockInfo.symbol != "" && jQuery.inArray(stockInfo.symbol, watchList) == -1 && watchListCount <=10){
          var wlStockToAdd = '<li id="' +  stockInfo.symbol +'" class="wlItem"><a href="#">' + stockInfo.symbol + '</a></li>';
          $("#watch-list ul").append(wlStockToAdd);
          watchList.push(stockInfo.symbol);
          wlListener();
      }

    watchListCount += 1;

});







