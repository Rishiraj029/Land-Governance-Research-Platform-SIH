import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import { 
  Layers, 
  Search, 
  X, 
  Filter, 
  Map as MapIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  Info,
  ChevronDown,
  AlertCircle,
  SlidersHorizontal,
  Landmark,
  Building2,
  TreeDeciduous,
  AlertTriangle,
  Shield,
  Database,
  Globe,
  Loader2,
  RefreshCw
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature, FeatureCollection } from "geojson";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { loadGisFeatures } from "../lib/supabaseGis";
import type { GISFeature, GISLayer, GISFilters, GISDatasetInfo } from "../types/gis";

/**
 * Layer colours. Categories come from the database, so colours are assigned in the
 * order the categories appear instead of being hardcoded per category name.
 */
const CATEGORY_PALETTE = [
  "#138808",
  "#FF9933",
  "#D64545",
  "#0B3D91",
  "#E8A33D",
  "#8B5CF6",
  "#0E7490",
  "#B45309",
  "#0F766E",
  "#7C3AED",
];

/** Stable id for a category, used as the layer id. */
function categorySlug(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Every marker is drawn as an inline SVG pin built by Leaflet's `L.divIcon`, so the map has no
 * dependency on any external marker image URL (the previous setup pulled pin images from a
 * third-party CDN, which meant markers silently vanished offline).
 *
 * The fill colour is always the feature's own category colour, taken from the same
 * CATEGORY_PALETTE that colours the Layers list and the Legend, so the legend and the map
 * can no longer disagree.
 */
function buildMarkerIcon(color: string): L.DivIcon {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">' +
    '<path d="M14 1.5c-6.2 0-11.2 5-11.2 11.2 0 8.4 11.2 21.8 11.2 21.8s11.2-13.4 11.2-21.8C25.2 6.5 20.2 1.5 14 1.5z"' +
    ` fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>` +
    '<circle cx="14" cy="12.6" r="4" fill="#ffffff" fill-opacity="0.95"/>' +
    "</svg>";

  return L.divIcon({
    className: "gis-feature-pin",
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -33],
  });
}

/** Reference view for "no state selected" — matches the original India overview behaviour. */
const INDIA_VIEW: [number, number] = [20.5937, 78.9629];
const INDIA_ZOOM = 5;

/**
 * Administrative boundary source (kept next to the code that renders it):
 *
 *   geoBoundaries — India ADM1 (State / Union Territory)
 *   https://www.geoboundaries.org  |  https://github.com/wmgeolab/geoBoundaries
 *   Original data: DataMeet India community / Election Commission of India
 *                  (https://github.com/datameet/maps)
 *   License: Creative Commons Attribution 2.5 India (CC BY 2.5 IN)
 *            https://creativecommons.org/licenses/by/2.5/in/
 *   Release: geoBoundaries-IND-ADM1_simplified, build 2023-12-12, year represented 2011
 *
 * Adaptation applied to the downloaded file: Ramer-Douglas-Peucker vertex decimation at a
 * 0.005 degree tolerance and coordinate precision reduced to 5 decimal places, purely to keep
 * the asset small enough to ship to the browser. No coordinate was authored by hand and no
 * boundary was redrawn. The same attribution is carried inside the GeoJSON as `_attribution`.
 */
const STATE_BOUNDARY_URL = "/geo/india-states.geojson";

/**
 * Boundary names come from the dataset in its own spelling ("Rājasthān", "Tamil Nādu"), while
 * `public.gis_features.state` uses plain ASCII ("Rajasthan", "Tamil Nadu"). Fold both to a
 * common ASCII form so polygons can be matched to filter values by name alone.
 */
function normaliseStateName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Does this boundary polygon correspond to the state the filter has selected? */
function isBoundarySelected(boundaryName: string, selectedState: string): boolean {
  if (!selectedState) return false;
  return normaliseStateName(boundaryName) === normaliseStateName(selectedState);
}

/**
 * Evaluate one row against every active *filter*.
 *
 * `exclude` lets a caller skip exactly one field. The option lists use that to answer
 * "which values of X still exist once everything other than X is applied?", which is what
 * stops the Category/Theme/Dataset menus from offering combinations with no rows behind them.
 * Excluding one field is what makes the cascade acyclic: each list is computed from the
 * filters, never from the list itself.
 *
 * Deliberately ignores `hiddenCategories`: layer visibility is a separate control, and folding
 * it in here would mean hiding every layer also emptied the Layers panel itself, so the user
 * could never turn a layer back on.
 */
function rowPassesFilters(
  row: GISFeature,
  searchQuery: string,
  filters: GISFilters,
  exclude: "state" | "district" | "category" | "theme" | "dataset" | null
): boolean {
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      row.name.toLowerCase().includes(query) ||
      row.state.toLowerCase().includes(query) ||
      (row.district || "").toLowerCase().includes(query) ||
      row.category.toLowerCase().includes(query) ||
      row.theme.toLowerCase().includes(query) ||
      (row.datasetName || "").toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query);
    if (!matchesSearch) return false;
  }

  if (filters.state && row.state !== filters.state) return false;
  if (exclude !== "district" && filters.district && row.district !== filters.district) return false;
  if (exclude !== "category" && filters.category && row.category !== filters.category) return false;
  if (exclude !== "theme" && filters.theme && row.theme !== filters.theme) return false;
  if (exclude !== "dataset" && filters.dataset && row.datasetName !== filters.dataset) return false;

  return true;
}

/** Distinct, sorted values of `field` across the rows that survive every *other* filter. */
function cascadedOptions(
  features: GISFeature[],
  searchQuery: string,
  filters: GISFilters,
  field: "district" | "category" | "theme" | "dataset",
  accessor: (row: GISFeature) => string | null
): string[] {
  const values = new Set<string>();
  for (const row of features) {
    if (!rowPassesFilters(row, searchQuery, filters, field)) continue;
    const value = accessor(row);
    if (value) values.add(value);
  }
  return [...values].sort((a, b) => a.localeCompare(b));
}

/** Geographic extent of one GeoJSON feature, or null when it has no usable coordinates. */
function boundsOfFeature(feature: Feature): L.LatLngBounds | null {
  const geometry = feature.geometry;
  // GeometryCollection has no top-level `coordinates`; none of the state dataset uses it,
  // but treat it as "no bounds" rather than assuming.
  if (geometry.type === "GeometryCollection") return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const walk = (value: unknown): void => {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      const x = value[0] as number;
      const y = value[1] as number;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      return;
    }
    for (const child of value) walk(child);
  };

  walk(geometry.coordinates);
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }
  return L.latLngBounds([minY, minX], [maxY, maxX]);
}

/**
 * Drop any selected value that the *other* active filters make impossible.
 *
 * Called from the filter write paths rather than from an effect, so it runs exactly when a
 * filter changes. One pass is sufficient: adding a filter can only shrink the remaining option
 * lists, so any value that survives the pass is still valid once the write lands (pruning can
 * only ever widen the others). Returns `next` unchanged when nothing needs clearing, which lets
 * callers rely on identity to avoid pointless re-renders.
 */
function pruneFilters(
  next: GISFilters,
  searchQuery: string,
  features: GISFeature[]
): GISFilters {
  const clears = (value: string, field: "district" | "category" | "theme" | "dataset", accessor: (row: GISFeature) => string | null) =>
    value !== "" && !cascadedOptions(features, searchQuery, next, field, accessor).includes(value)
      ? ""
      : value;

  const district = clears(next.district, "district", row => row.district);
  const category = clears(next.category, "category", row => row.category);
  const theme = clears(next.theme, "theme", row => row.theme);
  const dataset = clears(next.dataset, "dataset", row => row.datasetName);

  if (
    district === next.district &&
    category === next.category &&
    theme === next.theme &&
    dataset === next.dataset
  ) {
    return next;
  }
  return { ...next, district, category, theme, dataset };
}

/** Bounds of the boundary polygon matching `selectedState`, or null when unavailable. */
function boundsForState(
  boundaries: FeatureCollection | null,
  selectedState: string
): L.LatLngBounds | null {
  if (!boundaries || !selectedState) return null;
  const target = normaliseStateName(selectedState);
  const feature = boundaries.features.find(
    (candidate) =>
      normaliseStateName(candidate.properties?.shapeName ?? "") === target
  );
  return feature ? boundsOfFeature(feature) : null;
}

// Map control components
function MapController({
  selectedFeature,
  selectedState,
  boundaries,
  onReset,
  onReady,
}: {
  selectedFeature: GISFeature | null;
  selectedState: string;
  boundaries: FeatureCollection | null;
  onReset: () => void;
  onReady: (map: L.Map) => void;
}) {
  const map = useMap();

  // Hand the map instance to the page so the details panel can zoom to a feature.
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  // Track the state the viewport has already been fitted for, so the camera is only ever
  // moved when the selection actually changes — never on an unrelated re-render, and never
  // on mount (the map already opens on the India overview).
  const fittedStateRef = useRef<string>("");

  useEffect(() => {
    if (selectedState === fittedStateRef.current) return;

    if (selectedState) {
      // Boundaries may still be loading; leave the viewport alone and retry once they arrive.
      const bounds = boundsForState(boundaries, selectedState);
      if (!bounds || !bounds.isValid()) return;
      // `animate: false` is deliberate. Leaflet's animated moves depend on a `transitionend`
      // event from the map pane; when that event does not arrive, `setView` returns early
      // having started an animation that never finishes, and the viewport silently stays put
      // (the same failure mode that stalls the +/- zoom controls). An instant camera move is
      // always correct, so we trade a two-hundred-millisecond flourish for reliability.
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 11, animate: false });
      fittedStateRef.current = selectedState;
      return;
    }

    // State cleared -> restore the original India overview behaviour.
    map.setView(INDIA_VIEW, INDIA_ZOOM, { animate: false });
    fittedStateRef.current = "";
  }, [selectedState, boundaries, map]);

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    map.setView(INDIA_VIEW, INDIA_ZOOM, { animate: false });
    onReset();
  };
  const handleFit = () => {
    if (selectedFeature) {
      map.setView([selectedFeature.latitude, selectedFeature.longitude], 10);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="p-2 bg-white rounded-lg shadow-md border border-[#E1E5EA] hover:bg-[#F5F7FA] text-[#1F2933]"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 bg-white rounded-lg shadow-md border border-[#E1E5EA] hover:bg-[#F5F7FA] text-[#1F2933]"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        onClick={handleFit}
        disabled={!selectedFeature}
        className="p-2 bg-white rounded-lg shadow-md border border-[#E1E5EA] hover:bg-[#F5F7FA] text-[#1F2933] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom to selected feature"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <button
        onClick={handleReset}
        className="p-2 bg-white rounded-lg shadow-md border border-[#E1E5EA] hover:bg-[#F5F7FA] text-[#1F2933]"
        title="Reset map view"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function GISExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<GISFeature | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileLegend, setShowMobileLegend] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  // Live data from public.gis_features
  const [features, setFeatures] = useState<GISFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [skippedNoCoordinates, setSkippedNoCoordinates] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // Administrative boundaries, fetched lazily from the static asset referenced by
  // STATE_BOUNDARY_URL (attribution and licence recorded there). They are an enhancement,
  // not a dependency: if the fetch fails the map still plots every feature marker.
  const [boundaries, setBoundaries] = useState<FeatureCollection | null>(null);

  // Categories switched off in the Layers panel (empty = every layer shown)
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  // Map instance, so "Zoom to feature" can move the map
  const mapRef = useRef<L.Map | null>(null);
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  // Filter state
  const [filters, setFilters] = useState<GISFilters>({
    state: "",
    district: "",
    category: "",
    theme: "",
    dataset: ""
  });

  // Load the live GIS rows from Supabase.
  // `isLoading` starts true and the retry buttons set it again alongside clearing the error,
  // so no state is written synchronously from inside this effect.
  useEffect(() => {
    let isCurrent = true;

    loadGisFeatures().then(result => {
      if (!isCurrent) return;

      if (result.error) {
        setLoadError(result.error);
        setFeatures([]);
      } else {
        setFeatures(result.features);
        setSkippedNoCoordinates(result.skippedNoCoordinates);
      }

      setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  // Load state boundaries once, in the background, without blocking the map.
  useEffect(() => {
    let isCurrent = true;

    fetch(STATE_BOUNDARY_URL)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<FeatureCollection>;
      })
      .then(collection => {
        if (isCurrent && collection?.type === "FeatureCollection") setBoundaries(collection);
      })
      .catch(error => {
        console.error("State boundaries could not be loaded:", error);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // Filter options are derived from the live rows so they can never drift from the data.
  // The currently selected state is always included even when it has no rows: clicking a
  // boundary of a state with no dataset is a legitimate zero-result state (the map stays up
  // and the polygon stays highlighted), and the select must still be able to display it.
  const stateOptions = useMemo(() => {
    const options = new Set(features.map(f => f.state));
    if (filters.state) options.add(filters.state);
    return [...options].sort((a, b) => a.localeCompare(b));
  }, [features, filters.state]);

  // Each remaining list is computed from every *other* active filter, never from itself —
  // that is what keeps the cascade acyclic. A value can therefore no longer be offered when
  // combining it with the current filters is guaranteed to return nothing (e.g. picking a
  // category that does not exist in the selected state).
  const districtOptions = useMemo(
    () => cascadedOptions(features, searchQuery, filters, "district", r => r.district),
    [features, searchQuery, filters]
  );

  const categoryOptions = useMemo(
    () => cascadedOptions(features, searchQuery, filters, "category", r => r.category),
    [features, searchQuery, filters]
  );

  const themeOptions = useMemo(
    () => cascadedOptions(features, searchQuery, filters, "theme", r => r.theme),
    [features, searchQuery, filters]
  );

  const datasetOptions = useMemo(
    () => cascadedOptions(features, searchQuery, filters, "dataset", r => r.datasetName),
    [features, searchQuery, filters]
  );

  // If another filter changed and left a selected value with nothing behind it, clear that
  // value and only that value. This happens in the write paths below (see pruneFilters)
  // rather than in an effect, so it is tied to the user action that caused it.
  /** Set one filter field and drop anything the change just invalidated. */
  const setFilterField = (key: keyof GISFilters, value: string) => {
    setFilters(pruneFilters({ ...filters, [key]: value }, searchQuery, features));
  };

  /** Apply a search term, then drop any filter value the term just invalidated. */
  const setSearchFilter = (value: string) => {
    setSearchQuery(value);
    setFilters(prev => pruneFilters({ ...prev }, value, features));
  };

  /**
   * Stable colour per category.
   *
   * Deliberately computed from the *complete* category list rather than the cascaded one, so
   * a category keeps the same colour as filters narrow the option lists — otherwise selecting
   * a state would reshuffle the palette and make the markers disagree with the legend.
   */
  const categoryColors = useMemo(() => {
    const all = [...new Set(features.map(f => f.category))].sort((a, b) => a.localeCompare(b));
    const map = new Map<string, string>();
    all.forEach((category, index) => {
      map.set(category, CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]);
    });
    return map;
  }, [features]);

  // Layers mirror the categories present in the data — deliberately the *complete* list,
  // matching the original behaviour. Layer checkboxes are a visibility control, so they must
  // not shrink with the filter cascade: otherwise hiding a layer could empty the very panel
  // that turns it back on.
  const layers = useMemo<GISLayer[]>(() => (
    [...categoryColors.keys()].map(category => ({
      id: categorySlug(category),
      name: category,
      category,
      color: categoryColors.get(category) ?? CATEGORY_PALETTE[0],
      enabled: !hiddenCategories.includes(category),
    }))
  ), [categoryColors, hiddenCategories]);

  // Toggle a layer on/off (by category, since layers are derived from the data)
  const toggleLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const nextHidden = hiddenCategories.includes(layer.category)
      ? hiddenCategories.filter(c => c !== layer.category)
      : [...hiddenCategories, layer.category];
    setHiddenCategories(nextHidden);
  };

  /**
   * The one place the state filter is written. The State select *and* clicking a boundary
   * polygon both call this, so there is no second state-selection system to keep in step.
   * Clearing the district mirrors what the select already does.
   */
  const selectState = useCallback(
    (state: string) => {
      setFilters(prev => pruneFilters({ ...prev, state, district: "" }, searchQuery, features));
    },
    [searchQuery, features]
  );

  /** Clicking a boundary applies that state through the existing filter. */
  const handleBoundaryClick = useCallback(
    (event: L.LeafletMouseEvent) => {
      // The event is propagated up from the clicked polygon by L.FeatureGroup, which attaches
      // the originating layer as `layer`; fall back to `sourceTarget` for direct fires.
      const origin = (event.layer ?? event.sourceTarget) as unknown as { feature?: Feature } | undefined;
      const raw = origin?.feature?.properties?.shapeName;
      if (typeof raw === "string" && raw.trim()) selectState(raw);
    },
    [selectState]
  );

  const boundaryEventHandlers = useMemo(() => ({ click: handleBoundaryClick }), [handleBoundaryClick]);

  /**
   * Boundary styling. The selected state is highlighted; every other state stays visible but
   * subdued so the selection reads clearly without hiding the rest of the country.
   *
   * `L.GeoJSON` only resolves a `style` *function* against each feature when it is
   * constructed (its update path calls `setStyle()`, which does not re-run that resolution),
   * so the layer is keyed on the selection to rebuild it whenever the selection changes.
   */
  const boundaryStyle = useMemo(() => {
    const selectedState = filters.state;
    return (feature?: Feature): L.PathOptions => {
      const raw = feature?.properties?.shapeName;
      const isSelected = isBoundarySelected(typeof raw === "string" ? raw : "", selectedState);
      if (isSelected) {
        return { color: "#B45309", weight: 3, fillColor: "#FF9933", fillOpacity: 0.22, opacity: 1 };
      }
      if (selectedState) {
        return { color: "#0B3D91", weight: 0.8, fillColor: "#0B3D91", fillOpacity: 0.02, opacity: 0.4 };
      }
      return { color: "#0B3D91", weight: 1, fillColor: "#0B3D91", fillOpacity: 0.05, opacity: 0.75 };
    };
  }, [filters.state]);

  // One icon per category colour, built once and reused across every marker of that category.
  // Built from the complete row set rather than the filtered set, so the cache always covers
  // every category a marker can ever be rendered for and never has to be mutated later.
  const markerIcons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    for (const row of features) {
      if (!cache.has(row.category)) {
        cache.set(row.category, buildMarkerIcon(categoryColors.get(row.category) ?? CATEGORY_PALETTE[0]));
      }
    }
    return cache;
  }, [features, categoryColors]);

  const fallbackMarkerIcon = useMemo(() => buildMarkerIcon(CATEGORY_PALETTE[0]), []);

  /** Marker icon for a feature, always coloured from CATEGORY_PALETTE via categoryColors. */
  const iconForCategory = (category: string): L.DivIcon =>
    markerIcons.get(category) ?? fallbackMarkerIcon;

  // Dataset summary for the bottom panel, derived from the loaded rows
  const datasetInfo = useMemo<GISDatasetInfo>(() => {
    const datasets = [...new Set(features.map(f => f.datasetName).filter((d): d is string => Boolean(d)))];
    const states = new Set(features.map(f => f.state));
    const districts = new Set(features.map(f => f.district).filter(Boolean));
    const newest = features
      .map(f => f.createdAt)
      .filter((d): d is string => Boolean(d))
      .sort()
      .pop();

    return {
      name: datasets.length === 1 ? datasets[0] : `${datasets.length} datasets`,
      description: "Spatial features read from the platform GIS table (public.gis_features).",
      coverage: `${states.size} state${states.size === 1 ? "" : "s"}, ${districts.size} district${districts.size === 1 ? "" : "s"}`,
      featureCount: features.length,
      lastUpdated: newest || "",
      source: datasets.length ? datasets.join(", ") : "Not specified in the dataset",
    };
  }, [features]);

  // Clear filters — also restores every layer, so all available features come back
  const clearFilters = () => {
    setFilters({
      state: "",
      district: "",
      category: "",
      theme: "",
      dataset: ""
    });
    setSearchQuery("");
    setHiddenCategories([]);
  };

  // Filter the live features by layer, search text and the selected filters.
  // This shares rowPassesFilters with the option cascades above, so the map and the filter
  // menus can never disagree about what a given combination matches.
  const filteredFeatures = useMemo(
    () =>
      features.filter(
        row => !hiddenCategories.includes(row.category) && rowPassesFilters(row, searchQuery, filters, null)
      ),
    [features, searchQuery, filters, hiddenCategories]
  );

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const states = new Set(filteredFeatures.map(f => f.state));
    const categories = new Set(filteredFeatures.map(f => f.category));
    const themes = new Set(filteredFeatures.map(f => f.theme));
    const enabledLayers = layers.filter(l => l.enabled).length;

    return {
      featureCount: filteredFeatures.length,
      stateCount: states.size,
      categoryCount: categories.size,
      themeCount: themes.size,
      layerCount: enabledLayers
    };
  }, [filteredFeatures, layers]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Land Use":
        return <TreeDeciduous className="h-4 w-4" />;
      case "Urban Expansion":
        return <Building2 className="h-4 w-4" />;
      case "Land Disputes":
        return <AlertTriangle className="h-4 w-4" />;
      case "Tenure":
        return <Shield className="h-4 w-4" />;
      case "Climate Risk":
        return <AlertCircle className="h-4 w-4" />;
      case "Digital Land Records":
        return <Database className="h-4 w-4" />;
      default:
        return <MapIcon className="h-4 w-4" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    return categoryColors.get(category) || "#0B3D91";
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedFeature(null);
  };

  // Move the map to a feature (used by the details panel button)
  const zoomToFeature = (feature: GISFeature) => {
    mapRef.current?.setView([feature.latitude, feature.longitude], 10);
  };

  // Handle feature click
  const handleFeatureClick = (feature: GISFeature) => {
    setSelectedFeature(feature);
    setShowMobilePanel(true);
  };

  // Hidden layers count as active state too, so "Clear" is always available and can
  // restore every feature in one click.
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    filters.state ||
    filters.district ||
    filters.category ||
    filters.theme ||
    filters.dataset ||
    hiddenCategories.length
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-[#5A6472]">
              <Link to="/" className="hover:text-[#0B3D91]">Home</Link>
              <span>/</span>
              <span className="text-[#1F2933] font-medium">GIS Explorer</span>
            </nav>
          </div>
        </div>

        {/* GIS Header */}
        <div className="border-b border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1F2933] mb-2">GIS Map Explorer</h1>
                <p className="text-[#5A6472]">
                  Explore land governance data, spatial patterns and policy-relevant geographic information.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8A33D]/10 text-[#E8A33D] rounded-full text-xs font-medium">
                <Info className="h-3 w-3" />
                Prototype GIS dataset
              </span>
            </div>

            {/* Search and Controls */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5A6472]" />
                <input
                  type="text"
                  placeholder="Search locations, datasets, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full rounded-full border border-[#E1E5EA] bg-[#F5F7FA] py-3 pl-12 pr-12 text-base text-[#1F2933] placeholder:text-[#5A6472] focus:border-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A6472] hover:text-[#1F2933]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-3 rounded-lg border border-[#E1E5EA] bg-white text-[#1F2933] hover:bg-[#F5F7FA]"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-lg border border-[#E1E5EA] bg-white text-[#1F2933] hover:bg-[#F5F7FA]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main GIS Workspace */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)] min-h-[600px]">
          {/* Left Panel - Layers and Filters */}
          <aside className="hidden lg:block w-72 bg-white border-r border-[#E1E5EA] overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Layers */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Layers
                </h3>
                <div className="space-y-2">
                  {layers.map(layer => (
                    <label key={layer.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#F5F7FA]">
                      <input
                        type="checkbox"
                        checked={layer.enabled}
                        onChange={() => toggleLayer(layer.id)}
                        className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="text-sm text-[#1F2933]">{layer.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#5A6472] mb-1">State</label>
                    <select
                      value={filters.state}
                      onChange={(e) => selectState(e.target.value)}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    >
                      <option value="">All States</option>
                      {stateOptions.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#5A6472] mb-1">District</label>
                    <select
                      value={filters.district}
                      onChange={(e) => setFilterField("district", e.target.value)}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    >
                      <option value="">All Districts</option>
                      {districtOptions.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#5A6472] mb-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilterField("category", e.target.value)}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      {categoryOptions.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#5A6472] mb-1">Theme</label>
                    <select
                      value={filters.theme}
                      onChange={(e) => setFilterField("theme", e.target.value)}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    >
                      <option value="">All Themes</option>
                      {themeOptions.map(theme => (
                        <option key={theme} value={theme}>{theme}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#5A6472] mb-1">Dataset</label>
                    <select
                      value={filters.dataset}
                      onChange={(e) => setFilterField("dataset", e.target.value)}
                      className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                    >
                      <option value="">All Datasets</option>
                      {datasetOptions.map(dataset => (
                        <option key={dataset} value={dataset}>{dataset}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Legend
                </h3>
                <div className="space-y-2">
                  {layers.filter(l => l.enabled).map(layer => (
                    <div key={layer.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm text-[#1F2933]">{layer.name}</span>
                    </div>
                  ))}
                  {layers.filter(l => l.enabled).length === 0 && (
                    <p className="text-sm text-[#5A6472] italic">No layers enabled</p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
              <div className="fixed left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-[#E1E5EA] flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1F2933]">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="h-6 w-6 text-[#5A6472]" />
                  </button>
                </div>
                <div className="p-4 space-y-6">
                  {/* Same filter structure as desktop */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#1F2933] mb-3">Layers</h3>
                    <div className="space-y-2">
                      {layers.map(layer => (
                        <label key={layer.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#F5F7FA]">
                          <input
                            type="checkbox"
                            checked={layer.enabled}
                            onChange={() => toggleLayer(layer.id)}
                            className="rounded border-[#E1E5EA] text-[#0B3D91] focus:ring-[#0B3D91]"
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: layer.color }}
                            />
                            <span className="text-sm text-[#1F2933]">{layer.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#1F2933] mb-3">Filters</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-[#5A6472] mb-1">State</label>
                        <select
                          value={filters.state}
                          onChange={(e) => selectState(e.target.value)}
                          className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                        >
                          <option value="">All States</option>
                          {stateOptions.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#5A6472] mb-1">District</label>
                        <select
                          value={filters.district}
                          onChange={(e) => setFilterField("district", e.target.value)}
                          className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                        >
                          <option value="">All Districts</option>
                          {districtOptions.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#5A6472] mb-1">Category</label>
                        <select
                          value={filters.category}
                          onChange={(e) => setFilterField("category", e.target.value)}
                          className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                        >
                          <option value="">All Categories</option>
                          {categoryOptions.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#5A6472] mb-1">Theme</label>
                        <select
                          value={filters.theme}
                          onChange={(e) => setFilterField("theme", e.target.value)}
                          className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                        >
                          <option value="">All Themes</option>
                          {themeOptions.map(theme => (
                            <option key={theme} value={theme}>{theme}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[#5A6472] mb-1">Dataset</label>
                        <select
                          value={filters.dataset}
                          onChange={(e) => setFilterField("dataset", e.target.value)}
                          className="w-full rounded-md border border-[#E1E5EA] bg-white px-3 py-2 text-sm text-[#1F2933] focus:border-[#0B3D91] focus:outline-none"
                        >
                          <option value="">All Datasets</option>
                          {datasetOptions.map(dataset => (
                            <option key={dataset} value={dataset}>{dataset}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Map Area */}
          <div className="flex-1 relative">
            {/*
              The map is mounted unconditionally. It used to sit in the final branch of a
              ternary, so a filter combination that matched nothing replaced the whole
              MapContainer with an empty-state card and destroyed the Leaflet instance —
              zoom, pan and tile cache were lost every time a filter changed. Loading, error
              and empty states are now overlays rendered *above* a live map instead.
            */}
            <MapContainer
              center={INDIA_VIEW}
              zoom={INDIA_ZOOM}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/*
                  Layer order (Task 8). Leaflet stacks its own panes independently of JSX
                  order: tilePane (200) < overlayPane (400, where GeoJSON paths draw) <
                  markerPane (600, where L.divIcon pins live) < tooltipPane (650) < popupPane
                  (700). Polygons therefore always sit beneath the markers, and popups above
                  both, regardless of zoom or pane width.
                */}
                {boundaries && (
                  <GeoJSON
                    key={`state-boundaries-${filters.state || "all"}`}
                    data={boundaries}
                    style={boundaryStyle}
                    eventHandlers={boundaryEventHandlers}
                  />
                )}

                {filteredFeatures.map(feature => (
                  <Marker
                    key={feature.id}
                    position={[feature.latitude, feature.longitude]}
                    icon={iconForCategory(feature.category)}
                    eventHandlers={{
                      click: () => handleFeatureClick(feature)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold text-[#1F2933] mb-2">{feature.name}</h3>
                        {feature.description && (
                          <p className="text-sm text-[#5A6472] mb-2">{feature.description}</p>
                        )}
                        <div className="text-xs text-[#5A6472] space-y-1">
                          <p><strong>Category:</strong> {feature.category}</p>
                          <p><strong>Theme:</strong> {feature.theme}</p>
                          <p><strong>Location:</strong> {[feature.district, feature.state].filter(Boolean).join(", ")}</p>
                          <p><strong>Dataset:</strong> {feature.datasetName || "Not specified"}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <MapController
                  selectedFeature={selectedFeature}
                  selectedState={filters.state}
                  boundaries={boundaries}
                  onReset={resetSelection}
                  onReady={handleMapReady}
                />
              </MapContainer>

              {isLoading && (
                /* Loading State */
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F5F7FA]">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mx-auto mb-4" />
                    <p className="text-[#5A6472]">Loading GIS features...</p>
                  </div>
                </div>
              )}

              {!isLoading && loadError && (
                /* Error State */
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F5F7FA] p-4">
                  <div className="text-center bg-white rounded-lg border border-[#E1E5EA] p-8 max-w-md">
                    <AlertCircle className="h-12 w-12 text-[#D64545] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1F2933] mb-2">Could not load GIS features</h3>
                    <p className="text-[#5A6472] mb-6">{loadError}</p>
                    <button
                      onClick={() => {
                        setLoadError(null);
                        setIsLoading(true);
                        setReloadKey(key => key + 1);
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {!isLoading && !loadError && filteredFeatures.length === 0 && (
                /*
                  Empty State — an overlay, not a replacement. The wrapper is transparent and
                  click-through so the map (and any highlighted state boundary) stays visible
                  and pannable behind it; only the card itself intercepts pointer events.
                */
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
                  <div className="pointer-events-auto text-center bg-white rounded-lg border border-[#E1E5EA] p-8 max-w-md shadow-sm">
                    <AlertCircle className="h-12 w-12 text-[#5A6472] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
                      {features.length === 0
                        ? "No GIS features are available"
                        : "No geographic features match your current filters"}
                    </h3>
                    <p className="text-[#5A6472] mb-6">
                      {features.length === 0
                        ? "The GIS dataset returned no records."
                        : "Try adjusting your search or filters to see map features"}
                    </p>
                    {features.length === 0 ? (
                      <button
                        onClick={() => {
                          setLoadError(null);
                          setIsLoading(true);
                          setReloadKey(key => key + 1);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                      </button>
                    ) : (
                      <button
                        onClick={clearFilters}
                        className="rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* Mobile Legend Toggle */}
            <button
              onClick={() => setShowMobileLegend(!showMobileLegend)}
              className="lg:hidden absolute bottom-4 left-4 z-[1000] p-3 bg-white rounded-lg shadow-md border border-[#E1E5EA]"
            >
              <Layers className="h-5 w-5 text-[#1F2933]" />
            </button>

            {/* Mobile Legend */}
            {showMobileLegend && (
              <div className="lg:hidden absolute bottom-16 left-4 z-[1000] bg-white rounded-lg shadow-md border border-[#E1E5EA] p-4 max-w-xs">
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3">Legend</h3>
                <div className="space-y-2">
                  {layers.filter(l => l.enabled).map(layer => (
                    <div key={layer.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm text-[#1F2933]">{layer.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Feature Details */}
          {selectedFeature && (
            <aside className="hidden lg:block w-80 bg-white border-l border-[#E1E5EA] overflow-y-auto">
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1F2933]">Feature Details</h3>
                  <button
                    onClick={resetSelection}
                    className="p-1 hover:bg-[#F5F7FA] rounded text-[#5A6472]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-[#1F2933] mb-2">{selectedFeature.name}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium`} style={{ backgroundColor: `${getCategoryColor(selectedFeature.category)}20`, color: getCategoryColor(selectedFeature.category) }}>
                      {getCategoryIcon(selectedFeature.category)}
                      {selectedFeature.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#5A6472]">Location</p>
                    <p className="text-sm text-[#1F2933]">{[selectedFeature.district, selectedFeature.state].filter(Boolean).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6472]">Theme</p>
                    <p className="text-sm text-[#1F2933]">{selectedFeature.theme}</p>
                  </div>
                  {selectedFeature.description && (
                    <div>
                      <p className="text-xs text-[#5A6472]">Description</p>
                      <p className="text-sm text-[#5A6472]">{selectedFeature.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#5A6472]">Dataset / source</p>
                    <p className="text-sm text-[#1F2933]">{selectedFeature.datasetName || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6472]">Coordinates</p>
                    <p className="text-sm text-[#1F2933]">{selectedFeature.latitude.toFixed(4)}, {selectedFeature.longitude.toFixed(4)}</p>
                  </div>
                  {selectedFeature.createdAt && (
                    <div>
                      <p className="text-xs text-[#5A6472]">Record added</p>
                      <p className="text-sm text-[#1F2933]">{new Date(selectedFeature.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E1E5EA]">
                  <button
                    onClick={() => zoomToFeature(selectedFeature)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#0B3D91] text-white text-sm font-medium hover:bg-[#062A63]"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Zoom to feature
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Mobile Feature Panel */}
          {selectedFeature && showMobilePanel && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-[#E1E5EA] rounded-t-2xl shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#1F2933]">Feature Details</h3>
                  <button
                    onClick={() => {
                      resetSelection();
                      setShowMobilePanel(false);
                    }}
                    className="p-1 hover:bg-[#F5F7FA] rounded text-[#5A6472]"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-[#1F2933]">{selectedFeature.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium`} style={{ backgroundColor: `${getCategoryColor(selectedFeature.category)}20`, color: getCategoryColor(selectedFeature.category) }}>
                      {getCategoryIcon(selectedFeature.category)}
                      {selectedFeature.category}
                    </span>
                  </div>
                  <p className="text-sm text-[#5A6472]">{selectedFeature.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[#5A6472]">Location</p>
                      <p className="text-[#1F2933]">{[selectedFeature.district, selectedFeature.state].filter(Boolean).join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A6472]">Theme</p>
                      <p className="text-[#1F2933]">{selectedFeature.theme}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Information Panel */}
        <div className="border-t border-[#E1E5EA] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Map Summary */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  Map Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A6472]">Features visible</span>
                    <span className="text-[#1F2933] font-medium">{summaryStats.featureCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A6472]">States represented</span>
                    <span className="text-[#1F2933] font-medium">{summaryStats.stateCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A6472]">Categories</span>
                    <span className="text-[#1F2933] font-medium">{summaryStats.categoryCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A6472]">Layers enabled</span>
                    <span className="text-[#1F2933] font-medium">{summaryStats.layerCount}</span>
                  </div>
                </div>
              </div>

              {/* Dataset Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Dataset Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-[#5A6472]">Dataset name</p>
                    <p className="text-sm text-[#1F2933]">{datasetInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6472]">Description</p>
                    <p className="text-sm text-[#5A6472]">{datasetInfo.description}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6472]">Coverage</p>
                    <p className="text-sm text-[#1F2933]">{datasetInfo.coverage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6472]">Features loaded</p>
                    <p className="text-sm text-[#1F2933]">{datasetInfo.featureCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6472]">Source (dataset_name)</p>
                    <p className="text-sm text-[#E8A33D]">{datasetInfo.source}</p>
                  </div>
                  {skippedNoCoordinates > 0 && (
                    <div>
                      <p className="text-xs text-[#5A6472]">Not mappable</p>
                      <p className="text-sm text-[#E8A33D]">
                        {skippedNoCoordinates} record{skippedNoCoordinates === 1 ? "" : "s"} skipped (no usable coordinates)
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-[#5A6472] pt-2 border-t border-[#E1E5EA]">
                    Records are labelled by the dataset name stored with them. Where a dataset is
                    marked illustrative or demo, treat it as a prototype input rather than official
                    government measurement.
                  </p>
                </div>
              </div>

              {/* Research/Policy Context */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933] mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Research & Policy Context
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Landmark className="h-4 w-4 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1F2933]">Spatial research</p>
                      <p className="text-xs text-[#5A6472]">Geographic analysis of land governance patterns and trends</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1F2933]">Policy planning</p>
                      <p className="text-xs text-[#5A6472]">Evidence-based spatial planning for land use decisions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TreeDeciduous className="h-4 w-4 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1F2933]">Regional comparison</p>
                      <p className="text-xs text-[#5A6472]">Cross-state comparison of land governance indicators</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-[#0B3D91] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1F2933]">Land-use analysis</p>
                      <p className="text-xs text-[#5A6472]">Temporal analysis of land use change and conversion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
