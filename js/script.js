// This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.71,-73.93], 12);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);

// add in OSM Mapnik tiles
var OSMMapnikTiles = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',{
  attribution: 'Map Data and Tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
});
// do not add to the map just yet, but add varible to the layer switcher control 

// add in MapQuest Open Aerial layer
var MapQuestAerialTiles = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',{
  attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
});


// create global variables we can use for layer controls
var wifihotspotGeoJSon;
var NeighborhoodGeoJSON;


// start the chain reaction by running the addSubwayLines function
addwifihotspotData();

// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map
// because of the asynchronous nature of Javascript, we'll wrap each "getJSON" call in a function, and then call each one in turn. This ensures our layer will work  

function addwifihotspotData() {
    $.getJSON( "../../geojson/NYC_Wi-Fi_Hotspot_Locations.geojson", function( data ) {
        var wifihotspot = data;

        var wifihotspotPointToLayer = function (Feature, latlng){
            var wifihotspotMarker= L.circle(latlng, 300, {
                fillColor: 'tomato',
                fillOpacity: 1
            });
            
            return wifihotspotMarker;  
        }

        var wifihotspotMouseOver = function (Feature, layer) {

            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Name:</strong> " + Feature.properties.businessname+ "<br/><strong>Business Type: </strong>" + Feature.properties.businesstype +"<br/><strong>Address:</br></strong>" + Feature.properties.address + "<br/><strong>Design Services Needed: </strong>" + Feature.properties.design);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        wifihotspotGeoJSON = L.geoJson(wifihotspot, {
            pointToLayer: wifihotspotPointToLayer,
            onEachFeature: wifihotspotMouseOver
        });

        // don't add the pawn shop layer to the map yet

        // run our next function to bring in the Pawn Shop data
        addNeighborhoodData();

    });

}


$.getJSON( "../../geojson/MTA_subway_lines.geojson", function( data ) {
    // ensure jQuery has pulled all data out of the geojson file
    var subwayLines = data;


    // style for subway lines
    var subwayStyle = {
        "color": "grey",
        "weight": 1,
        "opacity": 0.80
    };

    // function that binds popup data to subway lines
    var subwayClick = function (feature, layer) {
        // let's bind some feature properties to a pop up
        layer.bindPopup(feature.properties.Line);
    }

    // using L.geojson add subway lines to map
    subwayLinesGeoJSON = L.geoJson(subwayLines, {
        style: subwayStyle,
        onEachFeature: subwayClick
    }).addTo(map);

});

function addNeighborhoodData() {

    // let's add neighborhood data
    $.getJSON( "../../geojson/NYC_neighborhood_data.geojson", function( data ) {
        // ensure jQuery has pulled all data out of the geojson file
        var neighborhoods = data;

        // neighborhood choropleth map
        // let's use % in poverty to color the neighborhood map
        var neighborhoodsStyle = function (feature){
            var value = feature.properties.NYC_NEIG;
            var style = {
                stroke: true,
                weight: 1,
                opacity:0.25,
                color: 'grey',
            };

            return style;
        }

        var neighmouseOver = function (feature, layer) {
            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Neighborhood:</strong> " + feature.properties.NYC_NEIG);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        neighborhoodsGeoJSON = L.geoJson(neighborhoods, {
            style: neighborhoodsStyle,
            onEachFeature: neighmouseOver
        });

        // now lets add the data to the map in the order that we want it to appear

        // neighborhoods on the bottom
        neighborhoodsGeoJSON.addTo(map);
        wifihotspotGeoJSON.addTo(map);
       
        // now create the layer controls!
        createLayerControls(); 

    });

}

function createLayerControls(){

    // add in layer controls
    var baseMaps = {
        "CartoDB": CartoDBTiles,
        "OSM Mapnik": OSMMapnikTiles,
        "Mapquest Aerial": MapQuestAerialTiles
    };

    var overlayMaps = {
        "Neighborhood": neighborhoodsGeoJSON,
        "Small businesses": wifihotspotGeoJSON,
        "subway": subwayLinesGeoJSON,
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);

}
