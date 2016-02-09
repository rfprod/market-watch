'use strict';

(function () {
   var exploreButton = document.querySelector('.button-explore');
   var venuesList = document.querySelector('.venues');
   var apiUrlClicks = appUrl + '/api/:id/clicks';
   var apiUrlGetRemote = appUrl + '/api/clicks/venues';
   function updateVenues (data) {
      //var clicksObject = JSON.parse(data);
      //var str = clicksObject.explore;
      venuesList.innerHTML = data;
   }
   //ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount));
   exploreButton.addEventListener('click', function(){
      var urlParam = document.getElementsByTagName('input')[0].value;
      ajaxFunctions.ajaxRequest('GET', apiUrlGetRemote+'?explore='+urlParam, updateVenues);
   })
})();