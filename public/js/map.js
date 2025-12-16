// public/js/map.js
(function () {
  try {
    const token = window.MAP_TOKEN;
    const coords = window.LISTING_COORDS;

    if (!token) {
      console.error("❌ MAP_TOKEN missing");
      return;
    }

    mapboxgl.accessToken = token;

    // ---------- helper: normalize coordinates ----------
    function toValidLngLat(a) {
      if (!Array.isArray(a) || a.length !== 2) return null;
      const x = parseFloat(a[0]);
      const y = parseFloat(a[1]);
      if (!isFinite(x) || !isFinite(y)) return null;

      // lng, lat
      if (Math.abs(x) <= 180 && Math.abs(y) <= 90) return [x, y];
      // lat, lng → swap
      if (Math.abs(y) <= 180 && Math.abs(x) <= 90) return [y, x];
      return null;
    }

    // ---------- destination ----------
    const destination = toValidLngLat(coords) || [77.2090, 28.6139];

    // ---------- map init ----------
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: destination,
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl());

    // ---------- destination marker ----------
    map.on("load", () => {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat(destination)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<h6>Destination</h6><p>Exact location after booking</p>`
          )
        )
        .addTo(map);
    });

    // ---------- geocode user input ----------
    async function geocodePlace(place) {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          place
        )}.json?access_token=${token}`
      );
      const data = await res.json();
      return data.features?.[0]?.center || null;
    }

    const btn = document.getElementById("getDirections");
    const inputEl = document.getElementById("userLocationInput");
    const infoEl = document.getElementById("routeInfo");

    if (!btn || !inputEl || !infoEl) return;

    let userMarker = null;

    // ---------- button click ----------
    btn.addEventListener("click", async () => {
      const input = inputEl.value.trim();
      if (!input) {
        alert("Please enter your location");
        return;
      }

      const userCoords = await geocodePlace(input);
      if (!userCoords) {
        alert("Location not found");
        return;
      }

      // remove old user marker
      if (userMarker) userMarker.remove();

      userMarker = new mapboxgl.Marker({ color: "blue" })
        .setLngLat(userCoords)
        .setPopup(new mapboxgl.Popup().setText("Your Location"))
        .addTo(map);

      // ---------- Directions API ----------
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&access_token=${token}`;

      const res = await fetch(url);
      const data = await res.json();
      const route = data.routes?.[0];

      if (!route) {
        alert("Route not found");
        return;
      }

      // remove old route
      if (map.getSource("route")) {
        map.removeLayer("route-line");
        map.removeSource("route");
      }

      // add route source
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: route.geometry,
        },
      });

      // add route layer
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0d6efd",
          "line-width": 5,
        },
      });

      // ---------- fit map to route ----------
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((c) => bounds.extend(c));
      map.fitBounds(bounds, { padding: 60 });

      // ---------- distance & time ----------
      const km = (route.distance / 1000).toFixed(2);
      const min = Math.round(route.duration / 60);

      infoEl.innerHTML = `🚗 Distance: <b>${km} km</b> &nbsp;&nbsp; ⏱️ Time: <b>${min} min</b>`;
      infoEl.classList.add("active");
    });
  } catch (err) {
    console.error("❌ map.js error:", err);
  }
})();
