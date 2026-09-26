import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// Fix for default Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map control components
function MapController({ selectedFeature, onReset, onReady }: { selectedFeature: GISFeature | null; onReset: () => void; onReady: (map: L.Map) => void }) {
  const map = useMap();

  // Hand the map instance to the page so the details panel can zoom to a feature.
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    map.setView([20.5937, 78.9629], 5);
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

  // Load the live GIS rows from Supabase
  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setLoadError(null);

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

  // Filter options are derived from the live rows so they can never drift from the data.
  const stateOptions = useMemo(
    () => [...new Set(features.map(f => f.state))].sort((a, b) => a.localeCompare(b)),
    [features]
  );

  // Districts are scoped to the selected state when one is chosen.
  const districtOptions = useMemo(() => {
    const scoped = filters.state ? features.filter(f => f.state === filters.state) : features;
    return [...new Set(scoped.map(f => f.district).filter((d): d is string => Boolean(d)))]
      .sort((a, b) => a.localeCompare(b));
  }, [features, filters.state]);

  const categoryOptions = useMemo(
    () => [...new Set(features.map(f => f.category))].sort((a, b) => a.localeCompare(b)),
    [features]
  );

  const themeOptions = useMemo(
    () => [...new Set(features.map(f => f.theme))].sort((a, b) => a.localeCompare(b)),
    [features]
  );

  const datasetOptions = useMemo(
    () => [...new Set(features.map(f => f.datasetName).filter((d): d is string => Boolean(d)))]
      .sort((a, b) => a.localeCompare(b)),
    [features]
  );

  // Layers mirror the categories present in the data
  const layers = useMemo<GISLayer[]>(() => (
    categoryOptions.map((category, index) => ({
      id: categorySlug(category),
      name: category,
      category,
      color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
      enabled: !hiddenCategories.includes(category),
    }))
  ), [categoryOptions, hiddenCategories]);

  // Toggle a layer on/off (by category, since layers are derived from the data)
  const toggleLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    setHiddenCategories(prev =>
      prev.includes(layer.category)
        ? prev.filter(c => c !== layer.category)
        : [...prev, layer.category]
    );
  };

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

  // Filter the live features by layer, search text and the selected filters
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      // Layer filter
      if (hiddenCategories.includes(feature.category)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          feature.name.toLowerCase().includes(query) ||
          feature.state.toLowerCase().includes(query) ||
          (feature.district || "").toLowerCase().includes(query) ||
          feature.category.toLowerCase().includes(query) ||
          feature.theme.toLowerCase().includes(query) ||
          (feature.datasetName || "").toLowerCase().includes(query) ||
          feature.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // State filter
      if (filters.state && feature.state !== filters.state) return false;

      // District filter
      if (filters.district && feature.district !== filters.district) return false;

      // Category filter
      if (filters.category && feature.category !== filters.category) return false;

      // Theme filter
      if (filters.theme && feature.theme !== filters.theme) return false;

      // Dataset filter
      if (filters.dataset && feature.datasetName !== filters.dataset) return false;

      return true;
    });
  }, [features, searchQuery, filters, hiddenCategories]);

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
    const layer = layers.find(l => l.category === category);
    return layer?.color || "#0B3D91";
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      onChange={(e) => setFilters({ ...filters, state: e.target.value, district: "" })}
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
                      onChange={(e) => setFilters({ ...filters, district: e.target.value })}
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
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
                      onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
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
                      onChange={(e) => setFilters({ ...filters, dataset: e.target.value })}
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
                          onChange={(e) => setFilters({ ...filters, state: e.target.value, district: "" })}
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
                          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
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
                          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
                          onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
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
                          onChange={(e) => setFilters({ ...filters, dataset: e.target.value })}
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
            {isLoading ? (
              /* Loading State */
              <div className="absolute inset-0 flex items-center justify-center bg-[#F5F7FA]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91] mx-auto mb-4" />
                  <p className="text-[#5A6472]">Loading GIS features...</p>
                </div>
              </div>
            ) : loadError ? (
              /* Error State */
              <div className="absolute inset-0 flex items-center justify-center bg-[#F5F7FA] p-4">
                <div className="text-center bg-white rounded-lg border border-[#E1E5EA] p-8 max-w-md">
                  <AlertCircle className="h-12 w-12 text-[#D64545] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1F2933] mb-2">Could not load GIS features</h3>
                  <p className="text-[#5A6472] mb-6">{loadError}</p>
                  <button
                    onClick={() => setReloadKey(key => key + 1)}
                    className="inline-flex items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#062A63]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </button>
                </div>
              </div>
            ) : filteredFeatures.length === 0 ? (
              /* Empty State */
              <div className="absolute inset-0 flex items-center justify-center bg-[#F5F7FA]">
                <div className="text-center bg-white rounded-lg border border-[#E1E5EA] p-8 max-w-md">
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
                      onClick={() => setReloadKey(key => key + 1)}
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
            ) : (
              /* Map */
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {filteredFeatures.map(feature => (
                  <Marker
                    key={feature.id}
                    position={[feature.latitude, feature.longitude]}
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
                  onReset={resetSelection}
                  onReady={handleMapReady}
                />
              </MapContainer>
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
