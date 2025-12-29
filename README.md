# 📍 Campus Memory Map – Nirma University

An interactive, map-based web application that transforms campus locations into a shared digital memory space.  
Students can pin memories, stories, and photos directly onto a live campus map — turning places into experiences.

---

## 🧠 Problem Statement

Campus life creates countless meaningful moments, but they remain:
- Scattered across personal devices
- Disconnected from physical locations
- Hard to revisit or share collectively

There is no centralized, location-aware platform to capture and explore these memories.

---

## 💡 Our Solution

Campus Memory Map connects memories to real campus locations using an interactive map.

Users can:
- Click anywhere on campus
- Add categorized memories with text and photos
- Explore memories visually through map markers
- Filter and revisit experiences anytime

All without any backend dependency.

---

## ✨ Key Features

- 🗺️ Live campus map using Leaflet.js
- 📌 Location-based memory pinning
- 🏷️ Category filters (Study, Fun, Food, Events, Sports, Friends)
- 🎨 Custom SVG markers per category
- 🖼️ Multi-image upload with gallery viewer
- 🔄 Real-time filtering & memory counters
- 💾 Persistent storage using localStorage
- 📱 Fully responsive UI

---

## 🛠️ Tech Stack

| Category | Tech |
|--------|------|
| Frontend | HTML5, CSS3 |
| Logic | JavaScript (ES6) |
| Mapping | Leaflet.js + OpenStreetMap |
| Storage | Browser LocalStorage |
| UI Design | CSS Variables, Flexbox, Grid |

---

## ⚙️ How It Works (Technical Flow)

1. Map Initialization
   - Leaflet map centered on Nirma University
   - OpenStreetMap tiles for rendering

2. User Interaction
   - Map click captures latitude & longitude
   - Modal form opens for memory input

3. Memory Creation
   - Data stored as structured JavaScript objects
   - Custom SVG markers generated dynamically

4. Rendering & Filtering
   - Markers re-rendered based on active filters
   - Category-wise counters updated in real time

5. Persistence
   - All data saved in `localStorage`
   - Survives page reloads without a backend

---

## 🧬 Memory Data Model

```json
{
  "id": "unique_timestamp",
  "title": "Memory title",
  "description": "Optional description",
  "type": "study | fun | food | events | sports | friends",
  "lat": 23.1328,
  "lng": 72.5438,
  "photos": ["base64Image"],
  "createdAt": "ISO timestamp"
}
