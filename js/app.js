// SCRIPTS FOR LONDON LOO CODES MAP
// Coded by Ahmad Barclay. No rights reserved.
// For more info: github.com/bothness/ldnloos

// SET GLOBAL VARIABLES

// URL of CSV file containing geocoded data from London Loo Codes
var csvurl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPCH12cLRRJCZpMvalSOImqcHuDXs9BW7aCtBiGXBRf6wFAMPKOI7_40nkCS-TFoouT44RCSApPDpE/pub?gid=0&single=true&output=csv";
var icourl = "img/marker.png"

// Initialize event listeners for filter checkboxes
var accessSelect = document.querySelector("input[name=access-select]");
var genderSelect = document.querySelector("input[name=gender-select]");

accessSelect.addEventListener("change", function(){
  mapFeatures(accessSelect.checked, genderSelect.checked);
});

genderSelect.addEventListener("change", function(){
  mapFeatures(accessSelect.checked, genderSelect.checked);
});

// Function to create geoJson object from flat Json data
function geojson(features) {
  var geojson = {"type": "FeatureCollection", "features": []};
  for (feature in features) {
    let lng = features[feature].longitude;
    let lat = features[feature].latitude;
    if ($.isNumeric(lng) && $.isNumeric(lat) && lng < 1 && lng > -1 && lat < 52 && lat > 51) {
      var loo = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [features[feature].longitude, features[feature].latitude]
        },
        "properties": {
          "name": features[feature].cafe_name,
          "code": features[feature].code,
          "accessible": features[feature].accessible,
          "gender": features[feature].gender_neutral,
          "station": features[feature].nearest_station,
          "received": features[feature].code_received
        }
      };
      geojson.features.push(loo);
    };
  };
  return geojson;
}

// Function to process features in geoJson for map layer
function onEachFeature(feature, layer) {
  var name = feature.properties.name;
  var code = feature.properties.code;
  var accessible = feature.properties.accessible;
  if (accessible == "Y") {
    accessible = "Yes";
  } else if (accessible == "N") {
    accessible = "No";
  }
  var gender = feature.properties.gender;
  if (gender == "Y") {
    gender = "Yes";
  } else if (gender == "N") {
    gender = "No";
  }
  var station = feature.properties.station;
  var received = feature.properties.received;
  var lat = feature.geometry.coordinates[1];
  var lon = feature.geometry.coordinates[0];
  var url = "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lon;
  var html = "<h3>" + name + "</h3><strong>Nearest Station:</strong> " + station + "<br><strong>Access Code:</strong> " + code + "<br><strong>Accessible:</strong> " + accessible + "<br><strong>Gender Neutral:</strong> " + gender + '<br><br><a href="' + url + '" target="_blank">Get Google Maps directions</a><br><br>(Code provided on ' + received + ')';
  layer.bindPopup(html);
  var myIcon = L.icon({
    iconUrl: 'img/marker.png',
    iconSize: [25, 30],
    iconAnchor: [12, 30],
    popupAnchor: [0, -25]
  });
  layer.setIcon(myIcon);
  layer.on({
    click: function (e) {
      window.map.flyTo([lat, lon], 18);
    }
  });
}

// Function to initialize map
function makeMap(geopoints) {
  var tiles = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png ', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  window.markers = L.markerClusterGroup();
  var geoJsonLayer = L.geoJson(geopoints, {onEachFeature: onEachFeature});
  window.markers.addLayer(geoJsonLayer);

  window.map = L.map('map', {zoomControl: false}).addLayer(tiles);
  window.map.addLayer(window.markers);

  L.control.zoom({position: "topleft"}).addTo(map);

  L.control.locate(
    {
      position: "topleft",
      icon: "fa fa-compass",
      locateOptions: {
        maxZoom: 18,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    }).addTo(map);

  window.map.fitBounds(window.markers.getBounds());

  L.Control.Filter = L.Control.extend({
    onAdd: function(map) {
      var div = L.DomUtil.create('div', 'leaflet-control-layers');
      div.id = "filter-control";
      return div;
    }
  });
  L.control.filter = function(opts) {
    return new L.Control.Filter(opts);
  }

  L.control.filter({ position: 'bottomleft' }).addTo(map);
  $('#filters').appendTo('#filter-control');
}

// Function to update the map features when filters are selected
function mapFeatures(accessSelect, genderSelect) {
  var geoJsonLayer = L.geoJson(geojson, {
    onEachFeature: onEachFeature,
    filter: function(feature, layer) {
      if (accessSelect == false && genderSelect == false) {
        return true;
      } else if (accessSelect == true && genderSelect == false) {
        return feature.properties.accessible.charAt(0).toLowerCase() == "y";
      } else if (accessSelect == false && genderSelect == true) {
        return feature.properties.gender.charAt(0).toLowerCase() == "y";
      } else {
        return feature.properties.accessible.charAt(0).toLowerCase() == "y" && feature.properties.gender.charAt(0).toLowerCase() == "y";
      }
    }
  });
  window.markers.clearLayers();
  window.markers.addLayer(geoJsonLayer);
  window.map.addLayer(window.markers);
  window.map.flyToBounds(window.markers.getBounds());
}

// INITIALIZE THE MAP ON LOAD
// Fetch CSV file, convert to json, convert json to geoJson, initialize map
fetch(csvurl).then((response) => {
    return response.text();
})
.then((csvdata) => {
    var jsondata = $.csv.toObjects(csvdata);
    window.geojson = geojson(jsondata);
    makeMap(geojson);
});
