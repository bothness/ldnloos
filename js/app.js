// SCRIPTS FOR LONDON LOO CODES MAP
// Coded by Ahmad Barclay. No rights reserved.
// For more info: github.com/bothness/ldnloos

// SET GLOBAL VARIABLES

// URL of CSV files containing unofficial and official LBP rates & metadata on most recent updates
var csvurl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTbHWPMZ4HIYQZMNIKgi2IILuE7UQeC2nj7yDaQah72dOx4BP0DtV_lVLAAZgwDDDp-EU5IUXe4nqCA/pub?gid=0&single=true&output=csv";
var icourl = "img/marker.png"

function geojson(features) {
  var geojson = {"type": "FeatureCollection", "features": []};
  for (feature in features) {
    if ($.isNumeric(features[feature].longitude) && $.isNumeric(features[feature].latitude)) {
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

function makeMap(geopoints) {
  var tiles = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png ', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  var markers = L.markerClusterGroup();
  var geoJsonLayer = L.geoJson(geopoints, {onEachFeature: onEachFeature});
  markers.addLayer(geoJsonLayer);

  window.map = L.map('map', {zoomControl: false}).addLayer(tiles);
  window.map.addLayer(markers);

  L.control.zoom({position: "bottomright"}).addTo(map);

  L.control.locate(
    {
      position: "bottomright",
      icon: "fa fa-compass",
      locateOptions: {
        maxZoom: 18,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    }).addTo(map);

  window.map.fitBounds(markers.getBounds());
}

// Read metadata CSV file, convert to json
fetch(csvurl).then((response) => {
    return response.text();
})
.then((csvdata) => {
    var jsondata = $.csv.toObjects(csvdata);
    window.geojson = geojson(jsondata);
    makeMap(geojson);
});
