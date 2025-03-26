
  // =============================
// 1. Define the Basemap Tile Layer
// =============================
const basemap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors" // Attribution for OpenStreetMap
});

// ===========================
// 2. Initialize the Map Object
// ===========================
const map = L.map("map", {
  center: [37.09, -95.71], // Center the map on the US
  zoom: 5 // Initial zoom level
});

// ==========================
// 3. Add Basemap to the Map
// ==========================
basemap.addTo(map); // Add the basemap layer to the map

// =====================================
// 4. Create a Layer Group for Earthquakes
// =====================================
const earthquakes = new L.LayerGroup(); // Create a layer group for earthquake markers

// =============================================================
// 5. Define Functions for Marker Styling
// =============================================================

// Function to determine marker style
function styleInfo(feature) {
  return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
      color: "#000000", // Black border
      radius: getRadius(feature.properties.mag), // Radius based on magnitude
      stroke: true,
      weight: 0.5
  };
}

// Function to determine marker color based on depth
function getColor(depth) {
  if (depth > 90) return "red";        // Deep earthquakes
  if (depth > 70) return "orange";
  if (depth > 50) return "yellow";
  if (depth > 30) return "lightgreen";
  if (depth > 10) return "green";      // Shallow earthquakes
  return "#98ee00";                    // Superficial earthquakes (negative depth)
}

// Function to determine marker radius based on magnitude
function getRadius(magnitude) {
  return magnitude ? magnitude * 4 : 1; // Scale radius, default 1 if magnitude invalid
}

// =============================================================
// 6. Fetch Earthquake Data and Add to Map
// =============================================================
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng); // Render each point as a circle marker
      },
      style: styleInfo, // Apply styling
      onEachFeature: function(feature, layer) {
          // Add a popup with earthquake details
          layer.bindPopup(`<h3>${feature.properties.place}</h3>
                           <p>Magnitude: ${feature.properties.mag}<br>
                           Depth: ${feature.geometry.coordinates[2]} km</p>`);
      }
  }).addTo(earthquakes);

  // Add the earthquake layer to the map
  earthquakes.addTo(map);
});

// =============================================================
// 7. Add Legend to the Map
// =============================================================
let legend = L.control({ position: "bottomright" }); // Place legend in bottom-right corner

legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend"); // Create legend div
  const depthIntervals = [-10, 10, 30, 50, 70, 90]; // Depth ranges
  const colors = ["#98ee00", "green", "lightgreen", "yellow", "orange", "red"]; // Corresponding colors

  // Add legend items
  for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML += `<i style="background: ${colors[i]}"></i> 
                        ${depthIntervals[i]}${depthIntervals[i + 1] ? "&ndash;" + depthIntervals[i + 1] + " km<br>" : "+ km"}`;
  }

  return div; // Return the complete legend
};

// Add the legend to the map
legend.addTo(map);



