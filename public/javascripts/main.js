$(document).ready(function() {
  $("#tabs").show();
  $( "#tabs" ).tabs({
    active: 0
  }); 


  $.ajax({
    url: "https://mobilizedata.herokuapp.com",
    method: "GET",
    success: function(response) {
      var events = [];

      for (var i = 0; i < response.length; i++) {
        var event = response[i];
        events.push({
          "name" : event.name,
          "id" : event.id,
          "description": event.description,
          "lat": event.lat,
          "lon": event.lon,
          "state": event.state
        });
      }

      events.sort(function(a, b) {
          return parseInt(a.id) - parseInt(b.id);
      });

      var source = $("#all-events").html();
      var template = Handlebars.compile(source);
      var context = { "events": events };
      var html = template(context);
      $("#fragment-1").append(html);

      $("#spinner").toggle();

      $(".entry").on("click", "a", function(e) {
        $(this).parent().next(".body").slideToggle(function() {
          // var map = $(this).children(".map").id;
          // console.log(map);
          var eventElement = $(this).children(".map");
          eventElement.trigger("entryshow");
          // google.maps.event.trigger(map, "resize");

        });
      });
    }
  });
});