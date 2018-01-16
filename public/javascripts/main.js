window.events = [];

$(document).ready(function() {
  $("#tabs").show();
  $("#tabs").tabs({
    active: 0,
    activate: function(e, ui) {
      if (ui.newPanel[0].id == "fragment-2") {
        getGeo($('#distance').val());
      }
    }
  });

  $('#distance').on('change', function() {
    getGeo($('#distance').val());
  });

  $.ajax({
    url: "https://mobilizedata.herokuapp.com",
    method: "GET",
    success: function(response) {

      for (var i = 0; i < response.length; i++) {
        var event = response[i];
        events.push({
          "name" : event.name,
          "id" : event.id,
          "description": event.description,
          "lat": parseFloat(event.lat),
          "lon": parseFloat(event.lon),
          "address": event.address,
          "city": event.city,
          "state": event.state,
          "zip": event.zip,
          "organizationID": event.organization_id,
          "organizationName": toTitleCase(event.organization_name)
        });
      }

      // sample event to always have something in NYC
      events.push({
        "name" : "Geo event 1",
        "id" : "1",
        "description": "Geo Event 1",
        "lat": 40.7332784,
        "lon": -73.9949955,
        "address": "41 E 11th St",
        "city": "New York",
        "state": "NY",
        "zip": "10003",
        "organizationID": "0",
        "organizationName": toTitleCase("mobilize america")
      });

      events.sort(function(a, b) {
          return parseInt(a.id) - parseInt(b.id);
      });

      var source = $("#all-events").html();
      var template = Handlebars.compile(source);
      var context = { "events": events };
      var html = template(context);
      $("#fragment-1").append(html);

      $(".spinner.fragment-1").toggle();

      $(".entry").on("click", "a", function(e) {
        $(this).parent().next(".body").slideToggle(function() {
          var eventElement = $(this).children(".map");
          eventElement.trigger("entryshow");
        });
      });
    }
  });
});

function getGeo(distance) {
  if (distance != 5) {
    $('#geoMap').empty();
    $(".spinner.fragment-2").toggle();
  }

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      $(".spinner.fragment-2").toggle();

      var map = new google.maps.Map(document.getElementById("geoMap"), {
        zoom: 13,
        center: pos
      });

      var infoWindow = new google.maps.InfoWindow;
      infoWindow.setPosition(pos);
      infoWindow.setContent('Your location');
      infoWindow.open(map);
      map.setCenter(pos);

      calculateLocation(pos, map);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
      return false;
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
    return false;
  } 
}

// lifted directly from Google Maps APIs
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function calculateLocation(position, map) {
  var position = new google.maps.LatLng(position.lat, position.lng);
  var distance = $('#distance').val();
  var markers = [],
      infoWindowContent = [],
      infoWindow = new google.maps.InfoWindow;

  for (var i = 0; i < window.events.length; i++) {
    var event = window.events[i];
    var loc = new google.maps.LatLng(event.lat, event.lon);
    var distanceToEvent = google.maps.geometry.spherical.computeDistanceBetween(position, loc)/1609.344; // meters to miles
    if (distanceToEvent <= distance) {
      var contentString = '<h3>Event ID ' + event.id + ' : ' + event.name + '<p>' + event.description + ' (' + event.city + ', ' + event.state + ')</h3>';

      infoWindowContent.push(new google.maps.InfoWindow({
        content: contentString
      }));
      markers.push(new google.maps.Marker({
          position: loc,
          map: map,
          title: event.name
        })
      );
    }
  }

  for (i = 0; i < markers.length; i++) {

    var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
    var marker = new google.maps.Marker({
      position: position,
      map: map,
      title: markers[i][0]
    });
    
    // Allow each marker to have an info window    
    markers[i].addListener('click', function(marker, i) {
      return function() {
        var link = $(infoWindowContent[i].content)[0];        
        infoWindow.setContent(infoWindowContent[i].content);
        infoWindow.open(map, marker);
      } 
    }(markers[i], i));
  }

  var bounds = new google.maps.LatLngBounds();


  console.log(markers);
  for (var i = 0; i < markers.length; i++) {
      if(markers[i].getVisible()) {
          bounds.extend(markers[i].getPosition());
      }
  }

  map.fitBounds(bounds);
}

// Helpers
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}