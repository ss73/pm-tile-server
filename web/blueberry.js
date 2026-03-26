/**
 * Blueberry map themes for protomaps basemaps.
 *
 * Provides two flavors compatible with basemaps.layers():
 *   - "blueberry"      (dark navy theme)
 *   - "blueberry-milk"  (light blue theme)
 *
 * Usage:
 *   <script src="basemaps.js"></script>
 *   <script src="blueberry.js"></script>
 *   <script>
 *     var theme = "blueberry";
 *     var bb = blueberryTheme(theme);
 *     var layers = basemaps.layers("protomaps", bb.flavor, bb.layerOpts({ lang: "en" }));
 *     bb.postProcess(layers);
 *     var style = { version: 8, glyphs: bb.glyphs, sprite: bb.sprite, sources: { ... }, layers: layers };
 *   </script>
 *
 * For non-blueberry themes, blueberryTheme() returns null.
 *
 * Requires Inter font glyphs served at /fonts/{fontstack}/{range}.pbf
 */

var blueberryFlavor = {
    background: "#203751",
    earth: "#203751",
    park_a: "#1b3249",
    park_b: "#1b3249",
    hospital: "#1d344b",
    industrial: "#1d344b",
    school: "#1d344b",
    wood_a: "#1a3148",
    wood_b: "#1a3148",
    pedestrian: "#1e354c",
    scrub_a: "#1c3349",
    scrub_b: "#1c3349",
    glacier: "#1c3048",
    sand: "#1e354d",
    beach: "#1e354d",
    aerodrome: "#1d344b",
    runway: "#233c59",
    water: "#011523",
    zoo: "#1b3249",
    military: "#1d344b",
    tunnel_other_casing: "#0a1a2a",
    tunnel_minor_casing: "#0a1a2a",
    tunnel_link_casing: "#0a1a2a",
    tunnel_major_casing: "#0a1a2a",
    tunnel_highway_casing: "#0a1a2a",
    tunnel_other: "#1a3050",
    tunnel_minor: "#1a3050",
    tunnel_link: "#1a3050",
    tunnel_major: "#1a3050",
    tunnel_highway: "#1a3050",
    pier: "#233C59",
    buildings: "#031F30",
    minor_service_casing: "#0a1a2a",
    minor_casing: "#0a1a2a",
    link_casing: "#0a1a2a",
    major_casing_late: "#0a1a2a",
    highway_casing_late: "#0a1a2a",
    other: "#233C59",
    minor_service: "#1a3050",
    minor_a: "#233C59",
    minor_b: "#1a3050",
    link: "#233C59",
    major_casing_early: "#0a1a2a",
    major: "#233C59",
    highway_casing_early: "#0a1a2a",
    highway: "#2d4a6a",
    railway: "#1a3050",
    boundaries: "#42638C",
    bridges_other_casing: "#0a1a2a",
    bridges_minor_casing: "#0a1a2a",
    bridges_link_casing: "#0a1a2a",
    bridges_major_casing: "#0a1a2a",
    bridges_highway_casing: "#0a1a2a",
    bridges_other: "#233C59",
    bridges_minor: "#233C59",
    bridges_link: "#233C59",
    bridges_major: "#233C59",
    bridges_highway: "#2d4a6a",
    roads_label_minor: "#5A7A96",
    roads_label_minor_halo: "#0a1a2a",
    roads_label_major: "#7599BF",
    roads_label_major_halo: "#0a1a2a",
    ocean_label: "#7599BF",
    subplace_label: "#4A6A82",
    subplace_label_halo: "#0a1a2a",
    city_label: "#A0B8D0",
    city_label_halo: "#203751",
    state_label: "#4A6A82",
    state_label_halo: "#0a1a2a",
    country_label: "#F7F7F7",
    address_label: "#5A7A96",
    address_label_halo: "#0a1a2a",
    pois: {
        blue: "#4A6A82",
        green: "#4A6A82",
        lapis: "#4A6A82",
        pink: "#4A6A82",
        red: "#4A6A82",
        slategray: "#4A6A82",
        tangerine: "#4A6A82",
        turquoise: "#4A6A82"
    },
    landcover: {
        grassland: "rgba(28, 50, 74, 1)",
        barren: "rgba(34, 56, 80, 1)",
        urban_area: "rgba(30, 52, 76, 1)",
        farmland: "rgba(28, 50, 74, 1)",
        glacier: "rgba(26, 48, 72, 1)",
        scrub: "rgba(30, 52, 76, 1)",
        forest: "rgba(24, 46, 70, 1)"
    }
};

var blueberryMilkFlavor = {
    background: "#E4EDF5",
    earth: "#E4EDF5",
    park_a: "#D4E2EE",
    park_b: "#D4E2EE",
    hospital: "#DAE6F0",
    industrial: "#DAE6F0",
    school: "#DAE6F0",
    wood_a: "#CEDDE9",
    wood_b: "#CEDDE9",
    pedestrian: "#DCE8F2",
    scrub_a: "#D6E4EF",
    scrub_b: "#D6E4EF",
    glacier: "#E8F0F8",
    sand: "#E0EAF3",
    beach: "#E0EAF3",
    aerodrome: "#DAE6F0",
    runway: "#B8CCE0",
    water: "#8AABC5",
    zoo: "#D4E2EE",
    military: "#DAE6F0",
    tunnel_other_casing: "#C8D8E8",
    tunnel_minor_casing: "#C8D8E8",
    tunnel_link_casing: "#C8D8E8",
    tunnel_major_casing: "#C8D8E8",
    tunnel_highway_casing: "#C8D8E8",
    tunnel_other: "#CAD9E8",
    tunnel_minor: "#CAD9E8",
    tunnel_link: "#CAD9E8",
    tunnel_major: "#CAD9E8",
    tunnel_highway: "#CAD9E8",
    pier: "#B8CCE0",
    buildings: "#C8D8E8",
    minor_service_casing: "#C8D8E8",
    minor_casing: "#C8D8E8",
    link_casing: "#C8D8E8",
    major_casing_late: "#C8D8E8",
    highway_casing_late: "#C8D8E8",
    other: "#B8CCE0",
    minor_service: "#CAD9E8",
    minor_a: "#B8CCE0",
    minor_b: "#CAD9E8",
    link: "#B8CCE0",
    major_casing_early: "#C8D8E8",
    major: "#B8CCE0",
    highway_casing_early: "#C8D8E8",
    highway: "#A8BED6",
    railway: "#B0C4D8",
    boundaries: "#7599BF",
    bridges_other_casing: "#C8D8E8",
    bridges_minor_casing: "#C8D8E8",
    bridges_link_casing: "#C8D8E8",
    bridges_major_casing: "#C8D8E8",
    bridges_highway_casing: "#C8D8E8",
    bridges_other: "#B8CCE0",
    bridges_minor: "#B8CCE0",
    bridges_link: "#B8CCE0",
    bridges_major: "#B8CCE0",
    bridges_highway: "#A8BED6",
    roads_label_minor: "#6A8AA4",
    roads_label_minor_halo: "#E4EDF5",
    roads_label_major: "#4A6A82",
    roads_label_major_halo: "#E4EDF5",
    ocean_label: "#2A4A64",
    subplace_label: "#7A96AE",
    subplace_label_halo: "#E4EDF5",
    city_label: "#2A4A64",
    city_label_halo: "#E4EDF5",
    state_label: "#7A96AE",
    state_label_halo: "#E4EDF5",
    country_label: "#172F48",
    address_label: "#6A8AA4",
    address_label_halo: "#E4EDF5",
    pois: {
        blue: "#7A96AE",
        green: "#7A96AE",
        lapis: "#7A96AE",
        pink: "#7A96AE",
        red: "#7A96AE",
        slategray: "#7A96AE",
        tangerine: "#7A96AE",
        turquoise: "#7A96AE"
    },
    landcover: {
        grassland: "rgba(216, 228, 240, 0)",
        barren: "rgba(220, 232, 242, 0)",
        urban_area: "rgba(218, 230, 241, 0)",
        farmland: "rgba(216, 228, 240, 0)",
        glacier: "rgba(224, 234, 244, 0)",
        scrub: "rgba(218, 230, 241, 0)",
        forest: "rgba(212, 225, 237, 0)"
    }
};

var _blueberryThemes = {
    "blueberry": {
        flavor: blueberryFlavor,
        sprite: "dark",
        cityColors: ["#8AABC5", "#6A8AA4", "#4A6A82"]
    },
    "blueberry-milk": {
        flavor: blueberryMilkFlavor,
        sprite: "light",
        cityColors: ["#172F48", "#2A4A64", "#5A7A96"]
    }
};

/**
 * Returns a theme helper for the given blueberry theme name, or null
 * if the name is not a blueberry theme.
 *
 * The returned object has:
 *   - flavor:       color object to pass to basemaps.layers()
 *   - glyphs:       glyph URL template for the style
 *   - sprite:       sprite URL for the style
 *   - layerOpts(o): merges font config into your layer options
 *   - postProcess(layers): applies label tweaks to generated layers
 */
function blueberryTheme(name) {
    var t = _blueberryThemes[name];
    if (!t) return null;

    var fonts = { bold: "Inter-Bold", regular: "Inter-Regular", italic: "Inter-Italic" };
    var glyphs = (typeof window !== "undefined" ? window.location.origin : "") + "/fonts/{fontstack}/{range}.pbf";
    var sprite = "https://protomaps.github.io/basemaps-assets/sprites/v4/" + t.sprite;
    var colors = t.cityColors;

    return {
        flavor: t.flavor,
        glyphs: glyphs,
        sprite: sprite,
        layerOpts: function (opts) {
            var merged = {};
            for (var k in opts) merged[k] = opts[k];
            merged.bold = fonts.bold;
            merged.regular = fonts.regular;
            merged.italic = fonts.italic;
            return merged;
        },
        postProcess: function (layers) {
            var nameSkipIds = { "roads_shields": 1, "shield_text": 1 };
            layers.forEach(function (l) {
                if (l.layout) {
                    if (l.layout["text-transform"] === "uppercase") {
                        delete l.layout["text-transform"];
                    }
                    // Show English name only, skip for shields (they use "ref")
                    if (l.layout["text-field"] && !nameSkipIds[l.id]) {
                        l.layout["text-field"] = ["coalesce", ["get", "name:en"], ["get", "name"]];
                    }
                    // Force Inter fonts, skip Noto Sans script fallbacks
                    if (l.layout["text-font"]) {
                        var tf = l.layout["text-font"];
                        var target = fonts.regular;
                        if (Array.isArray(tf)) {
                            var last = tf[tf.length - 1];
                            var ref = Array.isArray(last) ? last[0] : last;
                            if (ref === fonts.bold || ref === "Noto Sans Medium") target = fonts.bold;
                            else if (ref === fonts.italic || ref === "Noto Sans Italic") target = fonts.italic;
                        }
                        l.layout["text-font"] = ["literal", [target]];
                    }
                }
                if (l.id === "places_locality" && l.paint) {
                    l.paint["text-color"] = [
                        "case",
                        ["<=", ["get", "min_zoom"], 5], colors[0],
                        ["<=", ["get", "min_zoom"], 8], colors[1],
                        colors[2]
                    ];
                }
            });
            return layers;
        }
    };
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { blueberryFlavor, blueberryMilkFlavor, blueberryTheme };
}
