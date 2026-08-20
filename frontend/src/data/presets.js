export const PRESET_AOIS = [
  {
    id: "korba",
    name: "Korba District (Trained Model Region)",
    region: "Chhattisgarh, India",
    description: "Central Indian district containing the exact area the predictive risk model was trained on.",
    center: [22.51, 82.62],
    zoom: 10,
    defaultDates: {
      historicalStart: "2023-01-01",
      historicalEnd: "2023-12-31",
      currentStart: "2024-01-01",
      currentEnd: "2024-12-31",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [82.13, 22.03],
        [83.11, 22.03],
        [83.11, 22.99],
        [82.13, 22.99],
        [82.13, 22.03]
      ]]
    }
  },
  {
    id: "sundarbans",
    name: "Sundarbans Biosphere Reserve (Zone A)",
    region: "West Bengal, India",
    description: "World Heritage mangrove ecosystem facing coastal cyclone damage and tidal canopy changes.",
    center: [21.95, 88.90],
    zoom: 11,
    defaultDates: {
      historicalStart: "2023-01-01",
      historicalEnd: "2023-03-31",
      currentStart: "2024-01-01",
      currentEnd: "2024-03-31",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [88.75, 21.85],
        [89.05, 21.85],
        [89.05, 22.05],
        [88.75, 22.05],
        [88.75, 21.85]
      ]]
    }
  },
  {
    id: "similipal",
    name: "Similipal National Park (Core Range)",
    region: "Mayurbhanj, Odisha, India",
    description: "Dense semi-evergreen and moist deciduous sal forests with high tiger & elephant population.",
    center: [21.80, 86.35],
    zoom: 11,
    defaultDates: {
      historicalStart: "2023-01-01",
      historicalEnd: "2023-04-30",
      currentStart: "2024-01-01",
      currentEnd: "2024-04-30",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [86.20, 21.68],
        [86.50, 21.68],
        [86.50, 21.92],
        [86.20, 21.92],
        [86.20, 21.68]
      ]]
    }
  },
  {
    id: "wayanad",
    name: "Wayanad Wildlife Sanctuary (Western Ghats)",
    region: "Kerala, India",
    description: "Biodiversity hotspot corridor connecting Nagarhole, Bandipur, and Mudumalai reserves.",
    center: [11.68, 76.25],
    zoom: 12,
    defaultDates: {
      historicalStart: "2023-01-01",
      historicalEnd: "2023-03-31",
      currentStart: "2024-01-01",
      currentEnd: "2024-03-31",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [76.15, 11.60],
        [76.35, 11.60],
        [76.35, 11.76],
        [76.15, 11.76],
        [76.15, 11.60]
      ]]
    }
  },
  {
    id: "kaziranga",
    name: "Kaziranga National Park (Eastern Range)",
    region: "Golaghat & Nagaon, Assam, India",
    description: "Brahmaputra alluvial floodplains, dense tall elephant grass, and tropical wet evergreen forests.",
    center: [26.62, 93.35],
    zoom: 11,
    defaultDates: {
      historicalStart: "2023-01-01",
      historicalEnd: "2023-03-31",
      currentStart: "2024-01-01",
      currentEnd: "2024-03-31",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [93.18, 26.54],
        [93.52, 26.54],
        [93.52, 26.70],
        [93.18, 26.70],
        [93.18, 26.54]
      ]]
    }
  },
  {
    id: "satpura",
    name: "Satpura Tiger Reserve (Pachmarhi Zone)",
    region: "Hoshangabad, Madhya Pradesh, India",
    description: "Central Indian highland teak and bamboo forest landscape with rugged terrain and gorges.",
    center: [22.50, 78.40],
    zoom: 11,
    defaultDates: {
      historicalStart: "2023-01-01",
      historicalEnd: "2023-04-30",
      currentStart: "2024-01-01",
      currentEnd: "2024-04-30",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [78.25, 22.38],
        [78.55, 22.38],
        [78.55, 22.62],
        [78.25, 22.62],
        [78.25, 22.38]
      ]]
    }
  }
];
