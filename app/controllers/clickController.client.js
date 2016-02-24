'use strict';

(function () {
   var addStockButton = document.querySelector('.button-add-stock');
   var chartData = document.querySelector('.chart-data');
   var loginHref = document.querySelector('#login-href');
   var apiUrlClicks = appUrl + '/api/:id/clicks';
   if (addStockButton){
      addStockButton.addEventListener('click', function(){
         var stockCode = document.getElementsByTagName('input')[0].value;
         var conn = new WebSocket("wss://market-watch-rfprod.c9users.io/addstock");
			conn.onopen = function(){
				console.log("Connection opened");
				conn.send(stockCode);
			}
			conn.onmessage = function(evt){
				console.info("Received "+JSON.stringify(evt.data));
				chartData.innerHTML = evt.data;
				updateChart();
				conn.close();
			}
			conn.onerror = function(error){
				console.error("Error:"+JSON.stringify(error));
				conn.close();
			}
			conn.onclose = function(){
				console.log("Connection closed");
			}
      });
   }
})();