// public/js/map.js
(function () {
  try {
    const token = window.MAP_TOKEN;
    let coords = window.LISTING_COORDS;

    if (!token) {
      console.error(
        "MAP_TOKEN missing. Inject it in EJS before loading map.js"
      );
      return;
    }
    mapboxgl.accessToken = token;

    // Normalize coords: allow strings, [lat,lng] flips, null fallback
    function toValidLngLat(a) {
      if (!Array.isArray(a) || a.length !== 2) return null;
      // convert strings to numbers
      const x = parseFloat(a[0]);
      const y = parseFloat(a[1]);
      if (!isFinite(x) || !isFinite(y)) return null;
      // Heuristic: if looks like [lat, lng] (lat between -90..90, lng maybe >90) then flip
      if (
        Math.abs(x) <= 90 &&
        Math.abs(y) <= 180 &&
        Math.abs(x) <= 90 &&
        Math.abs(y) <= 180
      ) {
        // ambiguous — assume input is [lng, lat] normally. But detect common swap:
        if (Math.abs(x) <= 90 && Math.abs(y) > 90) {
          // swapped -> flip
          return [y, x];
        }
      }
      // If after parse values are within lng/lat bounds, assume [lng, lat]
      if (Math.abs(x) <= 180 && Math.abs(y) <= 90) return [x, y];
      // try flipping
      if (Math.abs(y) <= 180 && Math.abs(x) <= 90) return [y, x];
      return null;
    }

    let lnglat = toValidLngLat(coords);
    if (!lnglat) {
      console.warn(
        "LISTING_COORDS invalid or missing:",
        coords,
        "→ using fallback [77.2090,28.6139]"
      );
      lnglat = [77.209, 28.6139];
    }

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: lnglat,
      zoom: 9,
    });

map.addControl(new mapboxgl.NavigationControl());

    // expose for debugging
    window._map = map;
    window._lnglat = lnglat;

    map.on("load", () => {
      try {
        new mapboxgl.Marker({ color: "red" })
          .setLngLat(lnglat)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${listing.title}</h3><P>Exact Location will be Provided after Booking!</P>`))
          .addTo(map);
      } catch (err) {
        console.error("Marker error:", err, "lnglat=", lnglat);
      }
      map.resize();
      console.log("Map loaded successfully. center=", map.getCenter());
    });

    map.on("error", (e) => {
      console.error("Mapbox error event:", e);
    });
  } catch (e) {
    console.error("map.js top-level error:", e);
  }
})();
const nearby = [
  [lng + 0.01, lat + 0.01],
  [lng - 0.01, lat - 0.01]
];

nearby.forEach(coord => {
  new mapboxgl.Marker({ color: "blue" })
    .setLngLat(coord)
    .addTo(map);
});
