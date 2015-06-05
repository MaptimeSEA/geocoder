'use strict';

var Geocoder = function () {

  // used to store all of the successfully geocoded
  // addresses as an array of objects
  this.addresses = [];

  // temporary search variable used in creating
  // new address objects
  this.search = '';

  // the list of addresses located within the #info section
  this.list = document.getElementById('address-list');

  // event listeners
  this.events();

  // mapbox
  this.accessToken = 'pk.eyJ1Ijoic3ZtYXR0aGV3cyIsImEiOiJVMUlUR0xrIn0.NweS_AttjswtN5wRuWCSNA';
  this.tileSet = 'svmatthews.hf8pfph5';

  // init map
  L.mapbox.accessToken = this.accessToken;
  this.map = L.mapbox.map('map', this.tileSet).setView([0,0], 2);
  this.map.zoomControl.removeFrom(this.map);

}

Geocoder.prototype.events = function () {

  // geocode button
  document.getElementById('geocode').addEventListener('click', function(e) {
    var input = document.getElementById('address').value;
    console.log('[ CLICKED GEOCODE BUTTON ]');
    this.geocode(input);
  }.bind(this), false);

  // address text input
  document.getElementById('address').addEventListener('focus', function(e) {
    this.placeholder = '';
  });
  document.getElementById('address').addEventListener('blur', function(e) {
    this.placeholder = 'Search an address...';
  });
  document.getElementById('address').addEventListener('keydown', function(e) {
    var input = document.getElementById('address').value;
    if (e.keyCode == 13) this.geocode(input);
  }.bind(this), false);
}

/*
This is the HTTP request to the Census geocoder, which
returns a data object with the address information.
*/
Geocoder.prototype.geocode = function (address) {
  // add searching class to search element
  document.getElementById('search').className = 'searching';

  // hold current search for usage in creating address
  // element in createNewAddress()
  this.search = address;

  // call census geocoder, on success run createNewAddress()
  $.ajax({
    url: 'http://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address='+address+'&benchmark=4&format=jsonp',
    dataType: 'jsonp',
    async: true,
    success: this.createNewAddress.bind(this),
    error: function (err) { 
      console.error(err);
    }
  });
}

/*
Create a new address. This is only used after it has been geocoded. 
*/ 
Geocoder.prototype.createNewAddress = function (response) {
  
  // handle no responses
  if (!response.result.addressMatches[0]) {
    this.ui.geocodeError();
  } else {
    this.ui.geocodeSuccess();

    // build address object to add to Geocoder global
    var a = response.result.addressMatches[0];
    var newAddress = {
      census: response.result,
      search: this.search,
      address: a.matchedAddress,
      coordinates: {
        lat: a.coordinates.y,
        lng: a.coordinates.x
      }
    }

    // create point on the map
    var point = this.addPoint(newAddress);

    // add an id to the newAddress json for future use
    newAddress.id = point._leaflet_id;

    // create nice address but save response from census
    this.addresses.push(newAddress);

    // add the address information to the list
    // also send along the leaflet id so we can do some matching later
    this.addAddressToList(newAddress);

    // update download-json with new objects
    this.downloadJson();
  }

}

Geocoder.prototype.downloadJson = function() {
  var json = document.getElementById('download-json');
  json.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.addresses));
}

Geocoder.prototype.addAddressToList = function(address) {
  var li = document.createElement('li');
  li.id = address.id;
  li.innerHTML = '<p class="address-name">'+address.address+'</p>';
  li.innerHTML += '<p class="address-coordinates">'+address.coordinates.lng+', '+address.coordinates.lat+'</p>';
  this.list.insertBefore(li, this.list.firstChild);
}

Geocoder.prototype.addPoint = function (address) {
  var newPoint = L.mapbox.featureLayer({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [
          address.coordinates.lng,
          address.coordinates.lat 
        ]
    },
    properties: {
        title: address.address,
        'marker-size': 'large',
        'marker-color': '#BE9A6B',
        'marker-symbol': 'star'
    }
  }).addTo(this.map).openPopup();

  return newPoint;
  // this is a good point to reset the map view based on the current points
}

/*
Handle all of the UI elements and actions within the application
*/
Geocoder.prototype.ui = {

  geocodeError: function() {
    document.getElementById('search').className = 'error';
    setTimeout(function (){
      document.getElementById('search').className = '';
    }, 1000);
  },

  geocodeSuccess: function() {
    document.getElementById('search').className = 'success';
    setTimeout(function (){
      document.getElementById('search').className = '';
    }, 1000);
  }

}