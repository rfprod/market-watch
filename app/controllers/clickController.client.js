'use strict';

(function () {
   var addStockButton = document.querySelector('.button-add-stock');
   var chartData = document.querySelector('.chart-data');
   var loginHref = document.querySelector('#login-href');
   var apiUrlClicks = appUrl + '/api/:id/clicks';
   if (addStockButton){
      addStockButton.addEventListener('click', function(){
         var stockCode = document.getElementsByTagName('input')[0].value;
         var connAdd = new WebSocket("wss://market-watch-rfprod.c9users.io/addstock");
			connAdd.onopen = function(){
				console.log("Adding stock. Connection opened");
				connAdd.send(stockCode);
			};
			connAdd.onmessage = function(evt){
				if (evt.data != 'no data'){
					console.info("Received "+JSON.stringify(evt.data));
					chartData.innerHTML = evt.data;
					//updateChart();
				}else{
					alert(evt.data);
				}
				connAdd.close();
			};
			connAdd.onerror = function(error){
				console.error("Error:"+JSON.stringify(error));
				connAdd.close();
			};
			connAdd.onclose = function(){
				console.log("Stock added. Connection closed");
			};
      });
   }
})();