'use strict';

var Geocoder = function (options) {
  console.log(this);

  this.address = '';
  this.accessToken = 'pk.eyJ1Ijoic3ZtYXR0aGV3cyIsImEiOiJVMUlUR0xrIn0.NweS_AttjswtN5wRuWCSNA';
  this.tileSet = 'svmatthews.hf8pfph5';
  this.addresses = [];

  // temporary search variable used in creating
  // new address objects
  this.search = '';

  // event listeners
  this.events();

  // init map
  L.mapbox.accessToken = this.accessToken;
  this.map = L.mapbox.map('map', this.tileSet).setView([0,0], 2);

}

Geocoder.prototype.events = function () {

  // geocode button
  document.getElementById('geocode').addEventListener('click', function(e) {
    var input = document.getElementById('address').value;
    console.log('[ CLICKED GEOCODE BUTTON ]');
    e.preventDefault();
    this.geocode(input);
  }.bind(this), false);
}

/*
This is the HTTP request to the Census geocoder, which
returns a data object with the address information.
*/
Geocoder.prototype.geocode = function (address) {
  this.search = address;
  $.ajax({
    url: 'http://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address='+address+'&benchmark=4&format=jsonp',
    dataType: 'jsonp',
    async: true,
    success: this.createNewAddress.bind(this),
    error: function (err) { console.error(err); }
  });
}

/*
Create a new address. This is only used after it has been geocoded. 
*/ 
Geocoder.prototype.createNewAddress = function (response) {
  console.log(this);

  var a = response.result.addressMatches[0];
  var newAddress = {
    census: response,
    search: this.search,
    address: a.matchedAddress,
    coordinates: {
      lat: a.coordinates.x,
      lng: a.coordinates.y
    }
  }

  // create nice address but save response from census
  G.addresses.push(newAddress);

  // create point on the map
  this.addPoint(newAddress);

}

Geocoder.prototype.addPoint = function (address) {
  L.mapbox.featureLayer({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [
          address.coordinates.lat,
          address.coordinates.lng 
        ]
    },
    properties: {
        title: address.address,
        'marker-size': 'large',
        'marker-color': '#BE9A6B',
        'marker-symbol': 'star'
    }
  }).addTo(this.map).openPopup();
  // this is a good point to reset the map view based on the current points
}
