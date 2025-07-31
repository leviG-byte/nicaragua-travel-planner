const places = [
  {
    name: "Granada",
    description: "Colonial city with cobblestone streets and colorful architecture.",
    coordinates: { lat: 11.9344, lng: -85.9545 },
    categories: ["city"],
    hours: 4
  },
  {
    name: "Masaya Volcano",
    description: "Active volcano with a viewing platform to observe the lava crater.",
    coordinates: { lat: 11.9844, lng: -86.1610 },
    categories: ["volcano", "nature"],
    hours: 3
  },
  {
    name: "Ometepe Island",
    description: "Island with twin volcanoes Concepción and Maderas surrounded by Lake Nicaragua.",
    coordinates: { lat: 11.538, lng: -85.613 },
    categories: ["island", "nature"],
    hours: 6
  },
  {
    name: "San Juan del Sur",
    description: "Coastal town known for its beaches and surfing.",
    coordinates: { lat: 11.252, lng: -85.87 },
    categories: ["beach"],
    hours: 4
  },
  {
    name: "Mombacho Volcano",
    description: "Volcano with cloud forest and hiking trails near Granada.",
    coordinates: { lat: 11.9, lng: -85.97 },
    categories: ["volcano", "hiking"],
    hours: 4
  },
  {
    name: "Somoto Canyon",
    description: "Canyon with river tours and hiking in northern Nicaragua.",
    coordinates: { lat: 13.48, lng: -86.8 },
    categories: ["nature"],
    hours: 5
  },
  {
    name: "Corn Islands",
    description: "Two Caribbean islands with white sand beaches and turquoise waters.",
    coordinates: { lat: 12.162, lng: -83.072 },
    categories: ["beach", "island"],
    hours: 8
  },
  {
    name: "Miraflor Nature Reserve",
    description: "Nature reserve with cloud forests, orchids and bird watching.",
    coordinates: { lat: 13.2, lng: -86.25 },
    categories: ["nature"],
    hours: 5
  },
  {
    name: "Selva Negra",
    description: "Eco lodge and coffee farm with hiking trails near Matagalpa.",
    coordinates: { lat: 12.995, lng: -85.861 },
    categories: ["nature"],
    hours: 3
  },
  {
    name: "Laguna de Apoyo",
    description: "Crater lake with clear water for swimming and kayaking.",
    coordinates: { lat: 11.936, lng: -86.055 },
    categories: ["nature", "lake"],
    hours: 4
  },
  {
    name: "Cerro Negro",
    description: "Young volcano popular for sandboarding and hiking near León.",
    coordinates: { lat: 12.51, lng: -86.702 },
    categories: ["volcano", "adventure"],
    hours: 3
  }
];

let state = {
  preferences: null,
  selected: [],
  itinerary: []
};

function loadState() {
  const data = localStorage.getItem('nicaragua_travel_state');
  if (data) {
    state = JSON.parse(data);
    if (state.preferences && state.itinerary.length) {
      renderItinerary();
      return;
    }
  }
  renderPreferencesForm();
}

function saveState() {
  localStorage.setItem('nicaragua_travel_state', JSON.stringify(state));
}

function renderPreferencesForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Plan your visit to Nicaragua</h1>
    <div>
      <label>Choose activities:</label><br/>
      <label><input type="checkbox" value="city" /> City</label>
      <label><input type="checkbox" value="nature" /> Nature</label>
      <label><input type="checkbox" value="volcano" /> Volcano</label>
      <label><input type="checkbox" value="beach" /> Beach</label>
      <label><input type="checkbox" value="adventure" /> Adventure</label>
    </div>
    <div>
      <label>Maximum hours to travel from your location:
      <input type="number" id="maxHours" min="1" max="10" value="3" /></label>
    </div>
    <div>
      <label>Number of days:
      <input type="number" id="numDays" min="1" max="10" value="2" /></label>
    </div>
    <button id="nextBtn" disabled>Next</button>
  `;
  const checkboxes = app.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      document.getElementById('nextBtn').disabled = !Array.from(checkboxes).some(c => c.checked);
    });
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    const activities = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
    const hours = parseInt(document.getElementById('maxHours').value);
    const days = parseInt(document.getElementById('numDays').value);
    state.preferences = { activities, hours, days };
    saveState();
    showSuggestions();
  });
}

function filterPlaces() {
  const { activities, hours } = state.preferences;
  return places.filter(p => activities.some(a => p.categories.includes(a)) && p.hours <= hours);
}

function showSuggestions() {
  const suggestions = filterPlaces();
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Select your favorite places</h2>';
  suggestions.forEach((p, i) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <label><input type="checkbox" data-index="${i}" /> <strong>${p.name}</strong> (${p.hours}h)</label>
      <p>${p.description}</p>
    `;
    app.appendChild(div);
  });
  const btn = document.createElement('button');
  btn.textContent = 'Plan Trip';
  btn.disabled = true;
  btn.addEventListener('click', () => {
    planItinerary();
  });
  app.appendChild(btn);
  app.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = Array.from(app.querySelectorAll('input[type=checkbox]:checked')).map(c => suggestions[c.dataset.index]);
      state.selected = selected;
      btn.disabled = selected.length === 0;
    });
  });
}

function planItinerary() {
  const { days } = state.preferences;
  const plan = [];
  let day = 0, time = 0;
  const dayHours = 8;
  state.selected.forEach(p => {
    if (!plan[day]) plan[day] = [];
    if (time + p.hours > dayHours) {
      day++;
      time = 0;
      plan[day] = [];
    }
    plan[day].push({ ...p, start: time, end: time + p.hours });
    time += p.hours;
  });
  state.itinerary = plan;
  saveState();
  renderItinerary();
}

function renderItinerary() {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Your Itinerary</h2>';
  state.itinerary.forEach((dayPlan, i) => {
    const dayDiv = document.createElement('div');
    dayDiv.innerHTML = `<h3>Day ${i + 1}</h3>`;
    dayPlan.forEach(item => {
      const act = document.createElement('div');
      act.innerHTML = `
        <strong>${item.name}</strong> (${item.start}:00–${item.end}:00) 
        <button data-name="${item.name}">Details</button>
      `;
      act.querySelector('button').addEventListener('click', () => {
        showPlaceDetails(item);
      });
      dayDiv.appendChild(act);
    });
    app.appendChild(dayDiv);
  });
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Start over';
  clearBtn.addEventListener('click', () => {
    state = { preferences: null, selected: [], itinerary: [] };
    saveState();
    renderPreferencesForm();
  });
  app.appendChild(clearBtn);
}

function showPlaceDetails(item) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.background = 'rgba(0,0,0,0.6)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:white;padding:20px;border-radius:8px;max-width:500px;">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p>Activity duration: ${item.hours} hours</p>
      <p><a href="https://www.google.com/maps/search/?api=1&query=${item.coordinates.lat},${item.coordinates.lng}" target="_blank">Open in Google Maps</a></p>
      <button id="closeModal">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeModal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

document.addEventListener('DOMContentLoaded', loadState);
