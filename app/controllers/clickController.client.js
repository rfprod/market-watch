'use strict';

(function () {
   var rsvpButton = document.querySelector('.button-rsvp');
   var rsvpUndoButton = document.querySelector('.button-rsvp-undo');
   var exploreButton = document.querySelector('.button-explore');
   var venuesList = document.querySelector('.venues');
   var apiUrlLocal = appUrl + '/api/:id/clicks';
   var apiUrlGetRemote = appUrl + '/api/clicks/venues';
   function updateVenues (data) {
      var clicksObject = JSON.parse(data);
      var str = clicksObject.explore;
      venuesList.innerHTML = str;
   }
   //ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount));
   rsvpButton.addEventListener('click', function(){
      ajaxFunctions.ajaxRequest('POST', apiUrlLocal, function(){
         ajaxFunctions.ajaxRequest('GET', apiUrlGetRemote, updateVenues);
      });
   }, false);
   rsvpUndoButton.addEventListener('click', function(){
      ajaxFunctions.ajaxRequest('DELETE', apiUrlLocal, function(){
         ajaxFunctions.ajaxRequest('GET', apiUrlGetRemote, updateVenues);
      });
   }, false);
   exploreButton.addEventListener('click', function(){
      var urlParam = document.getElementsByTagName('input')[0].value;
      ajaxFunctions.ajaxRequest('GET', apiUrlGetRemote+'?explore='+urlParam, updateVenues);
   })
})();
