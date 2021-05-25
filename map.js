const API_KEY = '';

let map_view = new ol.View({
    projection: "EPSG:4326",
    center: [85.324, 27.7172],
    zoom: 10,
    maxZoom: 20,
    minZoom: 7,
    extent: [85.11413309346055, 27.537324643728056, 85.5132723447969, 27.856418727600406],
});
let map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            title: "OpenStreet Map",
            baseLayer: true,
            source: new ol.source.OSM(),
            visible: true
        }),
        new ol.layer.Tile({
            title: "Watercolor Map",
            baseLayer: true,
            source: new ol.source.Stamen({
                layer: 'watercolor'
            }),
            visible: false
        }),
        new ol.layer.Tile({
            title: "Toner Map",
            baseLayer: true,
            source: new ol.source.Stamen({
                layer: 'toner'
            }),
            visible: false,
        }),

    ],
    view: map_view
});

var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'left' });

map.addControl(sidebar);

// Add a layer switcher outside the map
var switcher = new ol.control.LayerSwitcher({
    target: $("#layer_switcher > div").get(0)
});
map.addControl(switcher);

//After copy/paste code

//Hamro main vector source
var vectorSource = new ol.source.Vector({
    wrapX: false,
});

//Hamro main vector layer
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    name: 'Vector Layer',
    style: new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.03,
            src: 'icon.png',
        }),
        stroke: new ol.style.Stroke({
            color: '#708090',
            width: 6,

        }),

    }),
});


var modify = new ol.interaction.Modify({ source: vectorSource });
map.addInteraction(modify);

var draw, snap; // global so we can remove them later

function draw_snap_marker() {
    vectorSource.clear();
    map.removeLayer(vectorLayer);

    map.addLayer(vectorLayer);
    draw = new ol.interaction.Draw({
        source: vectorSource,
        type: 'Point',
    });
    map.addInteraction(draw);

    snap = new ol.interaction.Snap({ source: vectorSource });
    map.addInteraction(snap);
}

// Get direction logic
const get_direction = document.getElementById("get_direction");
const close_sidebar = document.getElementById("close_sidebar");

get_direction.addEventListener("click", function(e) {
    e.preventDefault();
    overlay.setPosition(undefined);
    get_direction.disabled = true;
    close_sidebar.click();
    draw_snap_marker();
    let flag = true,
        starting_long = null,
        starting_lat = null,
        ending_long = null,
        ending_lat = null;
    clicks = 0;
    map.on("click", direction_function = function(e) {
        e.preventDefault();
        clicks++;
        remove_click(clicks);
        if (flag) {
            starting_long = e.coordinate[0];
            starting_lat = e.coordinate[1];
            ending_long = null;
            ending_lat = null;
            flag = false;
        } else {
            ending_long = e.coordinate[0];
            ending_lat = e.coordinate[1];
            flag = true;
            let direction_api_url = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + API_KEY + '&start=';
            let starting_long_lat = String(starting_long).concat(",").concat(String(starting_lat));
            let ending_long_lat = String(ending_long).concat(",").concat(String(ending_lat));
            let final_url = direction_api_url.concat(starting_long_lat).concat("&end=").concat(ending_long_lat);

            fetch(
                    final_url
                )
                .then(function(response) {
                    return response.text();
                })
                .then(function(text) {
                    let geojson = text;
                    return geojson;
                })
                .then(function(geojson) {
                    let coordinates_count = JSON.parse(geojson).features[0].geometry.coordinates.length;
                    let middle_array = coordinates_count / 2;
                    let middle_array_roundoff = Math.floor(middle_array);
                    let center_coordinate = JSON.parse(geojson).features[0].geometry.coordinates[middle_array_roundoff];


                    let distance = JSON.parse(geojson).features[0].properties.summary.distance;
                    let duration = JSON.parse(geojson).features[0].properties.summary.duration;

                    let direction_features = new ol.format.GeoJSON().readFeatures(geojson);
                    vectorSource.addFeatures(direction_features);

                    add_distance_duration_overlay(center_coordinate, distance, duration);

                });
        }

    });

    function remove_click(clicks) {

        if (clicks > 1) {
            map.un("click", direction_function);
            map.removeInteraction(draw);
            get_direction.disabled = false;

        }
    }
});
const get_isochrones = document.getElementById("get_isochrones");
get_isochrones.addEventListener("click", function(e) {
    map.removeLayer(vectorLayer);


    get_isochrones.disabled = true;
    close_sidebar.click();
    draw_snap_marker();
    let isochrones_api_url = "https://api.openrouteservice.org/v2/isochrones/driving-car",
        click = 0;
    map.on("click", isochrone_function = function(e) {

        click++;
        let request = new XMLHttpRequest();

        request.open('POST', isochrones_api_url);

        request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', API_KEY);

        request.onreadystatechange = function() {
            if (this.readyState === 4) {
                let isochrone_features = new ol.format.GeoJSON().readFeatures(this.responseText);
                vectorSource.addFeatures(isochrone_features);
                console.log();

            }
        };
        console.log(this.responseText);

        let long = e.coordinate[0];
        let lat = e.coordinate[1];
        const body = '{"locations":[[' + long + ',' + lat + ']],"range":[100,150,200]}';

        request.send(body);



        if (click > 0) {
            map.un("click", isochrone_function);
            map.removeInteraction(draw);
            get_isochrones.disabled = false;

        }
    })

})


var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

map.addOverlay(overlay);


function add_distance_duration_overlay(coordinate, distance, duration) {
    content.innerHTML = '<b>Duration :</b>' + convertHMS(duration) + '<br><b>Distance :</b>' + (distance / 1000).toFixed(2) + ' Km';
    overlay.setPosition(coordinate);
}

function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ' Hours ' + minutes + ' Minutes ' + seconds + ' Seconds '; // Return is HH : MM : SS
}