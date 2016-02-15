'use strict';

(function () {
   var addStockButton = document.querySelector('.button-add-stock');
   var venuesList = document.querySelector('.venues');
   var undoRSVP = document.getElementsByClassName('button-rsvp-undo');
   var loginHref = document.querySelector('#login-href');
   var apiUrlClicks = appUrl + '/api/:id/clicks';
   var apiUrlGetRemote = appUrl + '/api/clicks/venues';
   var apiUrlUndoRSVP = appUrl + '/rsvpdelete';
   function updateVenues (data) {
      venuesList.innerHTML = data;
   }
   if (addStockButton){
      addStockButton.addEventListener('click', function(){
         var stockCode = document.getElementsByTagName('input')[0].value;
         //ajaxFunctions.ajaxRequest('GET', apiUrlGetRemote+'?explore='+urlParam, updateVenues);
         var conn = new WebSocket("wss://market-watch-rfprod.c9users.io/addstock");
			conn.onopen = function () {
				console.log("Connection opened");
				conn.send(stockCode);
			}
			conn.onclose = function () {
				console.log("Connection closed");
			}
			conn.onmessage = function (evt) {
				console.info("Received "+JSON.stringify(evt.data));
				conn.close();
			}
			conn.onerror = function (error) {
				console.error("Error:"+JSON.stringify(error));
			}
      });
   }
   if (undoRSVP){
      for (var i=0;i<undoRSVP.length;i++){
         undoRSVP[i].addEventListener('click', function(){
            var venueId = $(this).attr('id');
            console.log(venueId);
            ajaxFunctions.ajaxRequest('GET', apiUrlUndoRSVP+'?venueId='+venueId, function(res){
               window.location = '/profile';
            });
         });
      }
   }
})();