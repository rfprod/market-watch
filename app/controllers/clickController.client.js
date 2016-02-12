'use strict';

(function () {
   var exploreButton = document.querySelector('.button-explore');
   var venuesList = document.querySelector('.venues');
   var undoRSVP = document.getElementsByClassName('button-rsvp-undo');
   var loginHref = document.querySelector('#login-href');
   console.log(JSON.stringify(undoRSVP));
   var apiUrlClicks = appUrl + '/api/:id/clicks';
   var apiUrlGetRemote = appUrl + '/api/clicks/venues';
   var apiUrlUndoRSVP = appUrl + '/rsvpdelete';
   function updateVenues (data) {
      venuesList.innerHTML = data;
   }
   if (exploreButton){
      exploreButton.addEventListener('click', function(){
         var urlParam = document.getElementsByTagName('input')[0].value;
         if (loginHref) loginHref.setAttribute('href','/login?location='+urlParam);
         ajaxFunctions.ajaxRequest('GET', apiUrlGetRemote+'?explore='+urlParam, updateVenues);
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