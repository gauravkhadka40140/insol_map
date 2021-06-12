const API_KEY = '5b3ce3597851110001cf6248c1e16bfc751147ee9cbd59ae68dd394f';

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
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.3)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255,0,0,0.5)',
            width: 2,

        }),

    }),
});

var iconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        scale: 0.03,
        src: 'icon.png',
    }),
});
var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point([85.3240, 27.7172]),
});

iconFeature.setStyle(iconStyle);
// vector layer for directuion
var vectorSource_direction = new ol.source.Vector({
    features: [iconFeature],
});
var vectorLayer_direction = new ol.layer.Vector({
    source: vectorSource_direction,
    name: 'Vector Layer',
    style: new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.06,
            src: 'icon.png',
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.3)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(60, 60, 60,0.5)',
            width: 6,

        }),

    }),
});

var vectorLayerforsearch = new ol.layer.Vector({
    zoom: 40,
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
// const get_direction = document.getElementById("get_direction");
// const close_sidebar = document.getElementById("close_sidebar");

// get_direction.addEventListener("click", function(e) {
//     e.preventDefault();
//     overlay.setPosition(undefined);
//     get_direction.disabled = true;
//     close_sidebar.click();
//     draw_snap_marker();
//     let flag = true,
//         starting_long = null,
//         starting_lat = null,
//         ending_long = null,
//         ending_lat = null;
//     clicks = 0;
//     map.on("click", direction_function = function(e) {
//         e.preventDefault();
//         clicks++;
//         remove_click(clicks);
//         if (flag) {
//             starting_long = e.coordinate[0];
//             starting_lat = e.coordinate[1];
//             ending_long = null;
//             ending_lat = null;
//             flag = false;
//         } else {
//             ending_long = e.coordinate[0];
//             ending_lat = e.coordinate[1];
//             flag = true;
//             let direction_api_url = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + API_KEY + '&start=';
//             let starting_long_lat = String(starting_long).concat(",").concat(String(starting_lat));
//             let ending_long_lat = String(ending_long).concat(",").concat(String(ending_lat));
//             let final_url = direction_api_url.concat(starting_long_lat).concat("&end=").concat(ending_long_lat);

//             fetch(
//                     final_url
//                 )
//                 .then(function(response) {
//                     return response.text();
//                 })
//                 .then(function(text) {
//                     let geojson = text;
//                     return geojson;
//                 })
//                 .then(function(geojson) {
//                     let coordinates_count = JSON.parse(geojson).features[0].geometry.coordinates.length;
//                     let middle_array = coordinates_count / 2;
//                     let middle_array_roundoff = Math.floor(middle_array);
//                     let center_coordinate = JSON.parse(geojson).features[0].geometry.coordinates[middle_array_roundoff];


//                     let distance = JSON.parse(geojson).features[0].properties.summary.distance;
//                     let duration = JSON.parse(geojson).features[0].properties.summary.duration;

//                     let direction_features = new ol.format.GeoJSON().readFeatures(geojson);
//                     vectorSource.addFeatures(direction_features);

//                     add_distance_duration_overlay(center_coordinate, distance, duration);

//                 });
//         }

//     });

//     function remove_click(clicks) {

//         if (clicks > 1) {
//             map.un("click", direction_function);
//             map.removeInteraction(draw);
//             get_direction.disabled = false;

//         }
//     }
// });

// isochrone ko logic
$('#get_isochrones').click(function() {

    // Range ko value lios
    let isochrone_range = $('#isochrone_range').val();

    // Khali cha ki chaina check garyo
    if (isochrone_range == '') {
        alert('Enter isochrone range');
    }
    // Khali chaina bhaneys
    else {
        // bhaeko layer sabai hatayo
        map.removeLayer(vectorLayer);
        get_isochrones.disabled = true;
        draw_snap_marker();
        let isochrones_api_url = "https://api.openrouteservice.org/v2/isochrones/driving-car",
            click = 0;

        //Map ma click bhayepachi agrney kaam
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
                }
            };

            let long = e.coordinate[0];
            let lat = e.coordinate[1];
            const body = '{"locations":[[' + long + ',' + lat + ']],"range":[' + isochrone_range + ']}';
            request.send(body);
            if (click > 0) {
                map.un("click", isochrone_function);
                map.removeInteraction(draw);
                get_isochrones.disabled = false;
            }
        });
    }
});




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
//search bar

const searchInput = document.getElementById("inputtext");
searchInput.addEventListener("input", function() {
    let search_api_url = 'https://api.openrouteservice.org/geocode/search?api_key=' + API_KEY + '&text=';

    let final_search_api_url = search_api_url + searchInput.value;
    fetch(
            final_search_api_url
        )
        .then(function(response) {
            let geojson = response.text();
            return geojson;
        })
        .then(function(geojson) {
            var search_list = document.getElementById("search_list");
            let option_tag = new Array();
            let parsed_json = JSON.parse(geojson);
            console.log(parsed_json.features);
            console.log(parsed_json.features.item);
            parsed_json.features.forEach((item, index) => {
                let countyValue = (typeof item.properties.county === 'undefined') ? '' : ', ' + item.properties.county;
                option_tag[index] = '<option data-id="' + index + '" value="' + item.properties.name + countyValue + ', ' + item.properties.country + '"></option>';
            });
            search_list.innerHTML = option_tag;

            searchInput.addEventListener("change", function(event) {
                let list_option = event.target.list.querySelector('[value="' + event.target.value + '"]');
                console.log(list_option);
                let vectorSource = new ol.source.Vector({
                    features: new ol.format.GeoJSON().readFeatures(parsed_json.features[list_option.dataset.id]),
                });
                let vectorLayer = new ol.layer.Vector({
                    source: vectorSource,
                });
                map.addLayer(vectorLayer);
            });
            // map_view.fit(parsed_json.features[list_option.dataset.id].bbox);
        });

});



//For From And To...


const from_input = document.getElementById("from_input");
from_input.addEventListener("input", function() {

    let search_api_url = 'https://api.openrouteservice.org/geocode/search?api_key=' + API_KEY + '&text=';

    let final_search_api_url = search_api_url + from_input.value;
    fetch(
            final_search_api_url
        )
        .then(function(response) {
            let api_response = response.text();
            return api_response;

        })
        .then(function(api_response) {
            var from_list = document.getElementById("from_list");
            let option_tag = new Array();
            let parsed_json = (JSON.parse(api_response));
            parsed_json.features.forEach((item, index) => {
                let countyValue = (typeof item.properties.county === 'undefined') ? '' : ', ' + item.properties.county;
                option_tag[index] = '<option data-id="' + index + '" value="' + item.properties.name + countyValue + ', ' + item.properties.country + '"></option>';
            });
            from_list.innerHTML = option_tag;
        });
})

const to_input = document.getElementById("to_input");
to_input.addEventListener("input", function() {

    let search_api_url = 'https://api.openrouteservice.org/geocode/search?api_key=' + API_KEY + '&text=';

    let final_search_api_url = search_api_url + to_input.value;

    fetch(
            final_search_api_url
        )
        .then(function(response) {
            let api_response = response.text();
            return api_response;

        })
        .then(function(api_response) {
            var to_list = document.getElementById("to_list");
            let option_tag = new Array();
            let parsed_json = (JSON.parse(api_response));
            parsed_json.features.forEach(function(item, index) {
                let countyValue = (typeof item.properties.county === 'undefined') ? '' : ', ' + item.properties.county;
                option_tag[index] = '<option data-id="' + index + '" value="' + item.properties.name + countyValue + ', ' + item.properties.country + '"></option>';
            });
            to_list.innerHTML = option_tag;
        });
})

//Get direction modified
const get_direction = document.getElementById("get_direction");
const close_sidebar = document.getElementById("close_sidebar");

get_direction.addEventListener("click", function(e) {
    let from_location = $('#from_input').val()
    let to_location = $('#to_input').val();
    let coordinate_from;
    let coordinate_to;

    let search_api_url = 'https://api.openrouteservice.org/geocode/search?api_key=' + API_KEY + '&text=';
    const getfromLocationData = async() => {
        const request = await fetch(search_api_url + from_location);
        const data = await request.json();
        return data;
    };
    getfromLocationData().then(locationData => {
        coordinate_from = locationData.features[0].geometry.coordinates;

        const getLocationData = async() => {
            const request = await fetch(search_api_url + to_location);
            const data = await request.json();
            return data;
        };
        getLocationData().then(locationtoData => {
            coordinate_to = locationtoData.features[0].geometry.coordinates;
            console.log(coordinate_from, coordinate_to);




            //from here



            starting_long = coordinate_from[0],
                starting_lat = coordinate_from[1],
                ending_long = coordinate_to[0],
                ending_lat = coordinate_to[1];




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

                    let instructions_data = JSON.parse(geojson).features[0].properties.segments[0].steps;
                    let div_design = "<h4>Instruction</h4></br>"
                    instructions_data.forEach(function(instruction_detail) {
                        let distance = instruction_detail.distance;
                        let instruction = instruction_detail.instruction;
                        let time = instruction_detail.duration;
                        div_design += "Distance : " + distance + "</br>Time :" + time + "</br>Instruction : " + instruction + "</br><hr>";

                    });
                    console.log(instructions_data);
                    document.getElementById("instruction_div").innerHTML = div_design;
                    let coordinates_count = JSON.parse(geojson).features[0].geometry.coordinates.length;
                    let middle_array = coordinates_count / 2;
                    let middle_array_roundoff = Math.floor(middle_array);

                    // let center_coordinate = JSON.parse(geojson).features[0].geometry.coordinates[middle_array_roundoff];
                    // let distance = JSON.parse(geojson).features[0].properties.summary.distance;
                    // let duration = JSON.parse(geojson).features[0].properties.summary.duration;
                    vectorSource_direction.clear();
                    let direction_features = new ol.format.GeoJSON().readFeatures(geojson);
                    vectorSource_direction.addFeatures(direction_features);
                    map.addLayer(vectorLayer_direction);

                    // add_distance_duration_overlay(center_coordinate, distance, duration);

                });

        });


    });
});