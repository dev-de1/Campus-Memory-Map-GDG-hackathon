// 🔥 Firebase Config (you already have this)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Constants
const NIRMA_CENTER = [23.1328, 72.5438];
const DEFAULT_ZOOM = 16;
const STORAGE_KEY = 'campus-memories';

// Memory type configurations
const memoryTypes = {
  study: { icon: '📚', label: 'Study', color: '#4f46e5' },
  fun: { icon: '🎉', label: 'Fun', color: '#f59e0b' },
  friends: { icon: '👥', label: 'Friends', color: '#ec4899' },
  food: { icon: '🍕', label: 'Food', color: '#ef4444' },
  events: { icon: '🎭', label: 'Events', color: '#8b5cf6' },
  sports: { icon: '⚽', label: 'Sports', color: '#10b981' }
};

// State
let memories = [];
let activeFilter = 'all';
let map = null;
let markers = [];
let clickPosition = null;
let selectedType = null;
let uploadedPhotos = [];
let galleryPhotos = [];
let galleryIndex = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadMemories();
  initMap();
  initEventListeners();
  updateUI();
  
  // Hide hint after 5 seconds
  setTimeout(() => {
    document.getElementById('hint').classList.add('hidden');
  }, 5000);
});

// Load memories from localStorage
function loadMemories() {
  const stored = localStorage.getItem(STORAGE_KEY);
  memories = stored ? JSON.parse(stored) : [];
}

// Save memories to localStorage
function saveMemories() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

// Initialize Leaflet map
function initMap() {
  map = L.map('map').setView(NIRMA_CENTER, DEFAULT_ZOOM);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  map.on('click', (e) => {
    clickPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
    document.getElementById('hint').classList.add('hidden');
    openAddModal();
  });
  
  updateMarkers();
}

// Create custom marker icon
function createCustomIcon(type) {
  const config = memoryTypes[type];
  const svgIcon = `
    <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C8.954 0 0 8.954 0 20c0 14.5 20 30 20 30s20-15.5 20-30C40 8.954 31.046 0 20 0z" fill="${config.color}"/>
      <circle cx="20" cy="18" r="10" fill="white" fill-opacity="0.3"/>
      <text x="20" y="23" text-anchor="middle" font-size="14">${config.icon}</text>
    </svg>
  `;
  
  return L.divIcon({
    html: `<div class="custom-marker">${svgIcon}</div>`,
    className: '',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
}

// Create popup content
function createPopupContent(memory) {
  const config = memoryTypes[memory.type];
  const date = new Date(memory.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  
  let photosHtml = '';
  if (memory.photos && memory.photos.length > 0) {
    photosHtml = `
      <div class="popup-photos" onclick="openGallery('${memory.id}')">
        <img src="${memory.photos[0]}" alt="${memory.title}">
        ${memory.photos.length > 1 ? `<span class="popup-photos-more">+${memory.photos.length - 1} more</span>` : ''}
      </div>
    `;
  }
  
  return `
    <div class="popup-content">
      ${photosHtml}
      <div class="popup-header">
        <h3 class="popup-title">${memory.title}</h3>
        <span class="popup-badge popup-badge-${memory.type}">
          ${config.icon} ${config.label}
        </span>
      </div>
      <p class="popup-description">${memory.description || 'No description'}</p>
      <div class="popup-footer">
        <span class="popup-date">${date}</span>
        <button class="popup-delete" onclick="deleteMemory('${memory.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// Update markers on map
function updateMarkers() {
  // Clear existing markers
  markers.forEach(marker => marker.remove());
  markers = [];
  
  // Filter memories
  const filtered = activeFilter === 'all' 
    ? memories 
    : memories.filter(m => m.type === activeFilter);
  
  // Add new markers
  filtered.forEach(memory => {
    const marker = L.marker([memory.lat, memory.lng], {
      icon: createCustomIcon(memory.type)
    })
      .addTo(map)
      .bindPopup(createPopupContent(memory), {
        className: 'custom-popup',
        maxWidth: 300
      });
    
    markers.push(marker);
  });
}

// Update UI counts
function updateUI() {
  document.getElementById('memoryCount').textContent = memories.length;
  document.getElementById('count-all').textContent = memories.length;
  
  Object.keys(memoryTypes).forEach(type => {
    const count = memories.filter(m => m.type === type).length;
    document.getElementById(`count-${type}`).textContent = count;
  });
}

// Initialize event listeners
function initEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      updateMarkers();
    });
  });
  
  // Modal controls
  document.getElementById('closeModal').addEventListener('click', closeAddModal);
  document.getElementById('cancelBtn').addEventListener('click', closeAddModal);
  document.getElementById('saveBtn').addEventListener('click', saveMemory);
  document.querySelector('#addMemoryModal .modal-backdrop').addEventListener('click', closeAddModal);
  
  // Type selection
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
    });
  });
  
  // Photo upload
  document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });
  
  document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
  
  // Gallery controls
  document.getElementById('closeGallery').addEventListener('click', closeGallery);
  document.querySelector('#galleryModal .modal-backdrop').addEventListener('click', closeGallery);
  document.getElementById('galleryPrev').addEventListener('click', () => navigateGallery(-1));
  document.getElementById('galleryNext').addEventListener('click', () => navigateGallery(1));
  
  // Keyboard navigation for gallery
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('galleryModal').classList.contains('open')) {
      if (e.key === 'ArrowLeft') navigateGallery(-1);
      if (e.key === 'ArrowRight') navigateGallery(1);
      if (e.key === 'Escape') closeGallery();
    }
  });
}

// Open add memory modal
function openAddModal() {
  document.getElementById('addMemoryModal').classList.add('open');
  document.getElementById('locationCoords').textContent = 
    `${clickPosition.lat.toFixed(6)}, ${clickPosition.lng.toFixed(6)}`;
  resetForm();
}

// Close add memory modal
function closeAddModal() {
  document.getElementById('addMemoryModal').classList.remove('open');
  resetForm();
}

// Reset form
function resetForm() {
  document.getElementById('memoryTitle').value = '';
  document.getElementById('memoryDescription').value = '';
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  selectedType = null;
  uploadedPhotos = [];
  document.getElementById('photoPreview').innerHTML = '';
}

// Handle photo upload
function handlePhotoUpload(e) {
  const files = Array.from(e.target.files);
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhotos.push(event.target.result);
      renderPhotoPreview();
    };
    reader.readAsDataURL(file);
  });
  
  e.target.value = '';
}

// Render photo preview
function renderPhotoPreview() {
  const container = document.getElementById('photoPreview');
  container.innerHTML = uploadedPhotos.map((photo, index) => `
    <div class="photo-thumb">
      <img src="${photo}" alt="Preview ${index + 1}">
      <button class="photo-remove" onclick="removePhoto(${index})">&times;</button>
    </div>
  `).join('');
}

// Remove photo
function removePhoto(index) {
  uploadedPhotos.splice(index, 1);
  renderPhotoPreview();
}

// Save memory
function saveMemory() {
  const title = document.getElementById('memoryTitle').value.trim();
  const description = document.getElementById('memoryDescription').value.trim();
  
  if (!title) {
    alert('Please enter a title');
    return;
  }
  
  if (!selectedType) {
    alert('Please select a memory type');
    return;
  }
  
  const memory = {
    id: Date.now().toString(),
    title,
    description,
    type: selectedType,
    lat: clickPosition.lat,
    lng: clickPosition.lng,
    photos: uploadedPhotos,
    createdAt: new Date().toISOString()
  };
  
  memories.push(memory);
  saveMemories();
  updateUI();
  updateMarkers();
  closeAddModal();
}

// Delete memory
function deleteMemory(id) {
  if (confirm('Are you sure you want to delete this memory?')) {
    memories = memories.filter(m => m.id !== id);
    saveMemories();
    updateUI();
    updateMarkers();
  }
}

// Open photo gallery
function openGallery(memoryId) {
  const memory = memories.find(m => m.id === memoryId);
  if (!memory || !memory.photos || memory.photos.length === 0) return;
  
  galleryPhotos = memory.photos;
  galleryIndex = 0;
  updateGallery();
  document.getElementById('galleryModal').classList.add('open');
}

// Close gallery
function closeGallery() {
  document.getElementById('galleryModal').classList.remove('open');
  galleryPhotos = [];
  galleryIndex = 0;
}

// Navigate gallery
function navigateGallery(direction) {
  galleryIndex = (galleryIndex + direction + galleryPhotos.length) % galleryPhotos.length;
  updateGallery();
}

// Update gallery display
function updateGallery() {
  document.getElementById('galleryImage').src = galleryPhotos[galleryIndex];
  document.getElementById('galleryCounter').textContent = `${galleryIndex + 1} / ${galleryPhotos.length}`;
  
  // Show/hide nav buttons
  document.getElementById('galleryPrev').style.display = galleryPhotos.length > 1 ? 'flex' : 'none';
  document.getElementById('galleryNext').style.display = galleryPhotos.length > 1 ? 'flex' : 'none';
}