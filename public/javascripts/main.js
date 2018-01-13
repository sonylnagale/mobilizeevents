$(document).ready(function() {
  $( "#tabs" ).tabs({
    active: 0
  });
  

  $.get("https://mobilize-mock-api.herokuapp.com/api/events", function(response) {
    console.log(response);
  });
});