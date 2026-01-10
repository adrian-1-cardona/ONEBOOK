/* Unified Checkout - Static Vanilla JS App */
(() => {
  const appEl = document.getElementById('app');

  const STORE_KEYS = {
    cart: 'uc-cart',
    customer: 'uc-customer'
  };

  const state = {
    routes: [],
    results: [],
    cart: loadCart(),
    customer: loadCustomer()
  };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.cart)) || []; } catch { return []; }
  }
  function saveCart() {
    localStorage.setItem(STORE_KEYS.cart, JSON.stringify(state.cart));
  }
  function loadCustomer() {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.customer)) || {}; } catch { return {}; }
  }
  function saveCustomer() {
    localStorage.setItem(STORE_KEYS.customer, JSON.stringify(state.customer));
  }

  function formatCurrency(n) { return `$${(n || 0).toFixed(2)}`; }
  function formatDuration(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }
  function totalPrice() { return state.cart.reduce((sum, c) => sum + c.qty * c.route.price, 0); }
  function cartCount() { return state.cart.reduce((a,c) => a + c.qty, 0); }

  async function loadData() {
    // Load routes from JSON file or use embedded data
    try {
      const response = await fetch('data/routes.json');
      if (response.ok) {
        state.routes = await response.json();
      } else {
        loadEmbeddedRoutes();
      }
    } catch (e) {
      console.warn('Failed to load routes from JSON, using embedded data:', e);
      loadEmbeddedRoutes();
    }
  }

  function loadEmbeddedRoutes() {
    state.routes = [
      { "id": "R1", "origin": "New York", "destination": "Boston", "country": "USA", "date": "2026-01-15", "time": "06:00 EST", "operator": "Amtrak Northeast Regional", "duration": 240, "price": 49.99, "legs": [{ "from": "Penn Station, NYC", "to": "South Station, Boston", "transport": "Train", "duration": 240, "stops": 8 }] },
      { "id": "R2", "origin": "New York", "destination": "Washington DC", "country": "USA", "date": "2026-01-15", "time": "08:00 EST", "operator": "Amtrak Northeast Regional", "duration": 210, "price": 59.99, "legs": [{ "from": "Penn Station, NYC", "to": "Union Station, DC", "transport": "Train", "duration": 210, "stops": 12 }] },
      { "id": "R3", "origin": "Philadelphia", "destination": "New York", "country": "USA", "date": "2026-01-15", "time": "05:30 EST", "operator": "SEPTA Regional Rail", "duration": 90, "price": 29.5, "legs": [{ "from": "30th Street Station, Philadelphia", "to": "Penn Station, NYC", "transport": "Train", "duration": 90, "stops": 6 }] },
      { "id": "R4", "origin": "Chicago", "destination": "Detroit", "country": "USA", "date": "2026-01-16", "time": "08:15 CST", "operator": "Amtrak Wolverine", "duration": 300, "price": 45.0, "legs": [{ "from": "Union Station, Chicago", "to": "Detroit Central Station", "transport": "Train", "duration": 300, "stops": 10 }] },
      { "id": "R5", "origin": "San Francisco", "destination": "Los Angeles", "country": "USA", "date": "2026-01-18", "time": "07:45 PST", "operator": "Amtrak Coast Starlight", "duration": 360, "price": 69.0, "legs": [{ "from": "Emeryville Station, SF", "to": "Union Station, LA", "transport": "Train", "duration": 360, "stops": 18 }] },
      { "id": "R6", "origin": "Los Angeles", "destination": "San Diego", "country": "USA", "date": "2026-01-18", "time": "13:20 PST", "operator": "Amtrak Pacific Surfliner", "duration": 150, "price": 32.0, "legs": [{ "from": "Union Station, LA", "to": "Santa Fe Depot, San Diego", "transport": "Train", "duration": 150, "stops": 12 }] },
      { "id": "R7", "origin": "Seattle", "destination": "Portland", "country": "USA", "date": "2026-01-19", "time": "12:00 PST", "operator": "Amtrak Cascades", "duration": 210, "price": 39.99, "legs": [{ "from": "King Street Station, Seattle", "to": "Union Station, Portland", "transport": "Train", "duration": 210, "stops": 8 }] },
      { "id": "R8", "origin": "Denver", "destination": "Salt Lake City", "country": "USA", "date": "2026-01-20", "time": "08:10 MST", "operator": "Amtrak California Zephyr", "duration": 420, "price": 79.0, "legs": [{ "from": "Denver Central Station", "to": "Salt Lake City Central", "transport": "Train", "duration": 420, "stops": 15 }] },
      { "id": "R9", "origin": "Austin", "destination": "Dallas", "country": "USA", "date": "2026-01-21", "time": "12:35 CST", "operator": "Texas Central Express", "duration": 200, "price": 34.75, "legs": [{ "from": "Austin Central Station", "to": "Dallas Union Station", "transport": "Train", "duration": 200, "stops": 6 }] },
      { "id": "R10", "origin": "Miami", "destination": "New York", "country": "USA", "date": "2026-01-22", "time": "13:00 EST", "operator": "American Airlines + Amtrak", "duration": 300, "price": 129.99, "legs": [{ "from": "Miami International Airport", "to": "LaGuardia Airport", "transport": "Flight", "duration": 180, "stops": 0 }] },
      { "id": "R11", "origin": "London", "destination": "Paris", "country": "United Kingdom", "date": "2026-01-20", "time": "07:01 GMT", "operator": "Eurostar", "duration": 135, "price": 79.99, "legs": [{ "from": "London St. Pancras International", "to": "Paris Gare du Nord", "transport": "High-Speed Train", "duration": 135, "stops": 0 }] },
      { "id": "R12", "origin": "London", "destination": "Amsterdam", "country": "United Kingdom", "date": "2026-01-21", "time": "08:00 GMT", "operator": "Eurostar + Dutch Railways", "duration": 300, "price": 99.99, "legs": [{ "from": "London St. Pancras", "to": "Amsterdam Centraal", "transport": "High-Speed Train", "duration": 300, "stops": 1 }] },
      { "id": "R13", "origin": "Paris", "destination": "Berlin", "country": "France", "date": "2026-01-22", "time": "09:15 CET", "operator": "DB Bahn + SNCF", "duration": 900, "price": 89.99, "legs": [{ "from": "Paris Gare de l'Est", "to": "Berlin Hauptbahnhof", "transport": "High-Speed Train", "duration": 900, "stops": 3 }] },
      { "id": "R14", "origin": "Paris", "destination": "Rome", "country": "France", "date": "2026-01-23", "time": "07:45 CET", "operator": "Thello + Trenitalia", "duration": 1440, "price": 129.99, "legs": [{ "from": "Paris Gare de Lyon", "to": "Rome Termini", "transport": "Night Train", "duration": 1440, "stops": 5 }] },
      { "id": "R15", "origin": "Berlin", "destination": "Prague", "country": "Germany", "date": "2026-01-20", "time": "10:00 CET", "operator": "Czech Railways", "duration": 240, "price": 59.99, "legs": [{ "from": "Berlin Hauptbahnhof", "to": "Prague Hlavní Nádraží", "transport": "Regional Train", "duration": 240, "stops": 8 }] },
      { "id": "R16", "origin": "Madrid", "destination": "Barcelona", "country": "Spain", "date": "2026-01-20", "time": "08:30 CET", "operator": "Renfe AVE", "duration": 480, "price": 74.99, "legs": [{ "from": "Madrid Puerta de Atocha", "to": "Barcelona Sants", "transport": "High-Speed Train (AVE)", "duration": 480, "stops": 0 }] },
      { "id": "R17", "origin": "Rome", "destination": "Milan", "country": "Italy", "date": "2026-01-21", "time": "09:00 CET", "operator": "Trenitalia Frecciarossa", "duration": 300, "price": 69.99, "legs": [{ "from": "Rome Termini", "to": "Milan Centrale", "transport": "High-Speed Train", "duration": 300, "stops": 2 }] },
      { "id": "R18", "origin": "Tokyo", "destination": "Osaka", "country": "Japan", "date": "2026-01-19", "time": "06:00 JST", "operator": "JR Central Shinkansen", "duration": 150, "price": 134.99, "legs": [{ "from": "Tokyo Station", "to": "Shin-Osaka Station", "transport": "Shinkansen Bullet Train", "duration": 150, "stops": 0 }] },
      { "id": "R19", "origin": "Tokyo", "destination": "Kyoto", "country": "Japan", "date": "2026-01-20", "time": "08:00 JST", "operator": "JR Central Shinkansen", "duration": 135, "price": 119.99, "legs": [{ "from": "Tokyo Station", "to": "Kyoto Station", "transport": "Shinkansen Bullet Train", "duration": 135, "stops": 0 }] },
      { "id": "R20", "origin": "Shanghai", "destination": "Beijing", "country": "China", "date": "2026-01-21", "time": "09:00 CST", "operator": "China Railways", "duration": 540, "price": 99.99, "legs": [{ "from": "Shanghai Hongqiao Station", "to": "Beijing South Station", "transport": "High-Speed Rail", "duration": 540, "stops": 0 }] },
      { "id": "R21", "origin": "Shanghai", "destination": "Hangzhou", "country": "China", "date": "2026-01-20", "time": "07:30 CST", "operator": "China Railways", "duration": 90, "price": 49.99, "legs": [{ "from": "Shanghai Hongqiao", "to": "Hangzhou East", "transport": "High-Speed Train", "duration": 90, "stops": 0 }] },
      { "id": "R22", "origin": "Sydney", "destination": "Melbourne", "country": "Australia", "date": "2026-01-18", "time": "08:00 AEDT", "operator": "XPT + V/Line", "duration": 1440, "price": 139.99, "legs": [{ "from": "Central Station, Sydney", "to": "Southern Cross Station, Melbourne", "transport": "Overnight Train", "duration": 1440, "stops": 12 }] },
      { "id": "R23", "origin": "Sydney", "destination": "Brisbane", "country": "Australia", "date": "2026-01-20", "time": "07:50 AEDT", "operator": "Queensland Rail", "duration": 900, "price": 119.99, "legs": [{ "from": "Central Station, Sydney", "to": "Roma Street Station, Brisbane", "transport": "Tilt Train", "duration": 900, "stops": 8 }] },
      { "id": "R24", "origin": "Toronto", "destination": "Montreal", "country": "Canada", "date": "2026-01-22", "time": "07:10 EST", "operator": "VIA Rail Canada", "duration": 480, "price": 79.99, "legs": [{ "from": "Union Station, Toronto", "to": "Central Station, Montreal", "transport": "Regional Train", "duration": 480, "stops": 8 }] },
      { "id": "R25", "origin": "Vancouver", "destination": "Seattle", "country": "Canada", "date": "2026-01-19", "time": "08:15 PST", "operator": "Amtrak Cascades", "duration": 240, "price": 59.99, "legs": [{ "from": "Pacific Central Station, Vancouver", "to": "King Street Station, Seattle", "transport": "Amtrak Cascades", "duration": 240, "stops": 4 }] },
      { "id": "R26", "origin": "Dubai", "destination": "Abu Dhabi", "country": "United Arab Emirates", "date": "2026-01-20", "time": "06:30 GST", "operator": "Etihad Rail", "duration": 120, "price": 44.99, "legs": [{ "from": "Dubai Station", "to": "Abu Dhabi Central Station", "transport": "Regional Train", "duration": 120, "stops": 3 }] },
      { "id": "R27", "origin": "Bangkok", "destination": "Chiang Mai", "country": "Thailand", "date": "2026-01-21", "time": "08:15 ICT", "operator": "Thai Railways", "duration": 900, "price": 69.99, "legs": [{ "from": "Bangkok Hualamphong Station", "to": "Chiang Mai Station", "transport": "Express Train", "duration": 900, "stops": 6 }] },
      { "id": "R28", "origin": "Singapore", "destination": "Kuala Lumpur", "country": "Singapore", "date": "2026-01-20", "time": "07:00 SGT", "operator": "KTM Railways", "duration": 360, "price": 79.99, "legs": [{ "from": "Singapore Central Station", "to": "Kuala Lumpur Central Station", "transport": "Express Train", "duration": 360, "stops": 4 }] },
      { "id": "R29", "origin": "Moscow", "destination": "St. Petersburg", "country": "Russia", "date": "2026-01-22", "time": "10:00 MSK", "operator": "Russian Railways", "duration": 480, "price": 89.99, "legs": [{ "from": "Leningrad Station, Moscow", "to": "Finlandskiy Station, St. Petersburg", "transport": "High-Speed Train", "duration": 480, "stops": 0 }] },
      { "id": "R30", "origin": "Istanbul", "destination": "Ankara", "country": "Turkey", "date": "2026-01-21", "time": "08:00 EET", "operator": "Turkish State Railways", "duration": 300, "price": 64.99, "legs": [{ "from": "Istanbul Pendik Station", "to": "Ankara Central Station", "transport": "High-Speed Train", "duration": 300, "stops": 2 }] },
      { "id": "R31", "origin": "Cairo", "destination": "Alexandria", "country": "Egypt", "date": "2026-01-20", "time": "06:30 EET", "operator": "Egyptian Railways", "duration": 180, "price": 34.99, "legs": [{ "from": "Cairo Ramses Railway Station", "to": "Alexandria Central Station", "transport": "Express Train", "duration": 180, "stops": 8 }] },
      { "id": "R32", "origin": "Cape Town", "destination": "Johannesburg", "country": "South Africa", "date": "2026-01-23", "time": "20:00 SAST", "operator": "Shosholoza Meyl", "duration": 1440, "price": 129.99, "legs": [{ "from": "Cape Town Station", "to": "Johannesburg Park Station", "transport": "Overnight Luxury Train", "duration": 1440, "stops": 4 }] },
      { "id": "R33", "origin": "Rio de Janeiro", "destination": "São Paulo", "country": "Brazil", "date": "2026-01-20", "time": "06:00 BRT", "operator": "SuperVia + CPTM", "duration": 360, "price": 99.99, "legs": [{ "from": "Central Station, Rio de Janeiro", "to": "Luz Station, São Paulo", "transport": "Regional + Commuter Train", "duration": 360, "stops": 12 }] },
      { "id": "R34", "origin": "Mexico City", "destination": "Guadalajara", "country": "Mexico", "date": "2026-01-22", "time": "07:00 CST", "operator": "Ferromex", "duration": 300, "price": 79.99, "legs": [{ "from": "Mexico City Buenavista Station", "to": "Guadalajara Central", "transport": "Regional Train", "duration": 300, "stops": 5 }] },
      { "id": "R35", "origin": "Buenos Aires", "destination": "Mendoza", "country": "Argentina", "date": "2026-01-21", "time": "19:30 ART", "operator": "Trenes Argentinos", "duration": 1080, "price": 119.99, "legs": [{ "from": "Buenos Aires Retiro Station", "to": "Mendoza Central", "transport": "Long-Distance Train", "duration": 1080, "stops": 8 }] },
      { "id": "R36", "origin": "Seoul", "destination": "Busan", "country": "South Korea", "date": "2026-01-19", "time": "07:00 KST", "operator": "Korea Train Express (KTX)", "duration": 180, "price": 99.99, "legs": [{ "from": "Seoul Station", "to": "Busan Station", "transport": "High-Speed Train", "duration": 180, "stops": 0 }] },
      { "id": "R37", "origin": "Hong Kong", "destination": "Guangzhou", "country": "Hong Kong", "date": "2026-01-20", "time": "08:15 HKT", "operator": "MTR Intercity", "duration": 90, "price": 74.99, "legs": [{ "from": "Hong Kong West Kowloon", "to": "Guangzhou South", "transport": "High-Speed Train", "duration": 90, "stops": 0 }] },
      { "id": "R38", "origin": "Mumbai", "destination": "Delhi", "country": "India", "date": "2026-01-22", "time": "15:50 IST", "operator": "Indian Railways", "duration": 1440, "price": 89.99, "legs": [{ "from": "Mumbai Central", "to": "New Delhi Station", "transport": "Express Train", "duration": 1440, "stops": 6 }] },
      { "id": "R39", "origin": "Bangkok", "destination": "Ho Chi Minh City", "country": "Thailand", "date": "2026-01-23", "time": "08:00 ICT", "operator": "State Railway of Thailand", "duration": 600, "price": 79.99, "legs": [{ "from": "Bangkok Hualamphong", "to": "Ho Chi Minh Saigon Station", "transport": "Express Train", "duration": 600, "stops": 8 }] },
      { "id": "R40", "origin": "Athens", "destination": "Thessaloniki", "country": "Greece", "date": "2026-01-21", "time": "07:45 EET", "operator": "Hellenic Train", "duration": 360, "price": 69.99, "legs": [{ "from": "Athens Central Station", "to": "Thessaloniki Central", "transport": "Intercity Train", "duration": 360, "stops": 4 }] },
      { "id": "R41", "origin": "Stockholm", "destination": "Copenhagen", "country": "Sweden", "date": "2026-01-20", "time": "08:00 CET", "operator": "SJ + Oresundtag", "duration": 300, "price": 99.99, "legs": [{ "from": "Stockholm Central", "to": "Copenhagen Central", "transport": "High-Speed Train", "duration": 300, "stops": 2 }] },
      { "id": "R42", "origin": "Vienna", "destination": "Budapest", "country": "Austria", "date": "2026-01-22", "time": "09:00 CET", "operator": "ÖBB + MÁV", "duration": 180, "price": 59.99, "legs": [{ "from": "Vienna Hauptbahnhof", "to": "Budapest Keleti", "transport": "Regional Train", "duration": 180, "stops": 3 }] },
      { "id": "R43", "origin": "Geneva", "destination": "Zurich", "country": "Switzerland", "date": "2026-01-21", "time": "07:15 CET", "operator": "Swiss Federal Railways", "duration": 180, "price": 89.99, "legs": [{ "from": "Geneva Central", "to": "Zurich Main Station", "transport": "Regional Train", "duration": 180, "stops": 5 }] },
      { "id": "R44", "origin": "Lisbon", "destination": "Porto", "country": "Portugal", "date": "2026-01-20", "time": "08:00 WET", "operator": "CP Railways", "duration": 300, "price": 54.99, "legs": [{ "from": "Lisbon Santa Apolónia", "to": "Porto São Bento", "transport": "Regional Train", "duration": 300, "stops": 8 }] },
      { "id": "R45", "origin": "Johannesburg", "destination": "Pretoria", "country": "South Africa", "date": "2026-01-21", "time": "06:30 SAST", "operator": "Metrorail", "duration": 120, "price": 24.99, "legs": [{ "from": "Johannesburg Park Station", "to": "Pretoria Central", "transport": "Suburban Train", "duration": 120, "stops": 12 }] }
    ];
  }

  function navigate(hash) {
    if (location.hash !== hash) location.hash = hash;
    render();
  }

  function render() {
    const route = location.hash || '#/search';
    if (route.startsWith('#/search')) return renderSearch();
    if (route.startsWith('#/results')) return renderResults();
    if (route.startsWith('#/cart')) return renderCart();
    if (route.startsWith('#/checkout')) return renderCheckout();
    if (route.startsWith('#/confirmation')) return renderConfirmation();
    return renderSearch();
  }

  function originsList() {
    return [...new Set(state.routes.map(r => r.origin))].sort();
  }
  function destinationsList() {
    return [...new Set(state.routes.map(r => r.destination))].sort();
  }

  function renderSearch() {
    const origins = originsList();
    const cust = state.customer || {};
    
    appEl.innerHTML = `
      <section class="card">
        <h2 class="section-title">Search Routes</h2>
        <div class="grid cols-2">
          <div>
            <label for="origin">From</label>
            <select id="origin">
              <option value="">Select origin...</option>
              ${origins.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="destination">To</label>
            <select id="destination" disabled>
              <option value="">Select destination...</option>
            </select>
          </div>
        </div>
        <div class="grid cols-3" style="margin-top:12px">
          <div>
            <label for="date">Date</label>
            <select id="date" disabled>
              <option value="">Select date...</option>
            </select>
          </div>
          <div>
            <label for="passengers">Passengers</label>
            <input id="passengers" type="number" min="1" value="1" />
          </div>
          <div class="actions" style="align-self:end;">
            <button class="btn primary" id="btnSearch" disabled>Search</button>
            <button class="btn secondary" id="btnViewCart">Cart (${cartCount()})</button>
          </div>
        </div>
      </section>
    `;

    const originSelect = document.getElementById('origin');
    const destSelect = document.getElementById('destination');
    const dateSelect = document.getElementById('date');
    const searchBtn = document.getElementById('btnSearch');

    // When origin changes, populate destinations
    originSelect.addEventListener('change', () => {
      const selectedOrigin = originSelect.value;
      destSelect.value = '';
      dateSelect.value = '';
      dateSelect.disabled = true;
      searchBtn.disabled = true;

      if (!selectedOrigin) {
        destSelect.disabled = true;
        destSelect.innerHTML = '<option value="">Select destination...</option>';
        return;
      }

      const destinations = [...new Set(
        state.routes
          .filter(r => r.origin === selectedOrigin)
          .map(r => r.destination)
      )].sort();

      destSelect.disabled = false;
      destSelect.innerHTML = `
        <option value="">Select destination...</option>
        ${destinations.map(d => `<option value="${d}">${d}</option>`).join('')}
      `;
    });

    // When destination changes, populate dates
    destSelect.addEventListener('change', () => {
      const selectedOrigin = originSelect.value;
      const selectedDest = destSelect.value;
      dateSelect.value = '';
      searchBtn.disabled = true;

      if (!selectedOrigin || !selectedDest) {
        dateSelect.disabled = true;
        dateSelect.innerHTML = '<option value="">Select date...</option>';
        return;
      }

      const dates = [...new Set(
        state.routes
          .filter(r => r.origin === selectedOrigin && r.destination === selectedDest)
          .map(r => r.date)
      )].sort();

      dateSelect.disabled = false;
      dateSelect.innerHTML = `
        <option value="">Select date...</option>
        ${dates.map(d => `<option value="${d}">${d}</option>`).join('')}
      `;
    });

    // Enable search when date is selected
    dateSelect.addEventListener('change', () => {
      searchBtn.disabled = !dateSelect.value;
    });

    document.getElementById('btnSearch').addEventListener('click', () => {
      const origin = originSelect.value;
      const destination = destSelect.value;
      const date = dateSelect.value;
      const pax = parseInt(document.getElementById('passengers').value || '1', 10);

      state.results = state.routes.filter(r =>
        r.origin === origin &&
        r.destination === destination &&
        r.date === date
      ).map(r => ({ ...r, passengers: pax }));

      navigate('#/results');
    });

    document.getElementById('btnViewCart').addEventListener('click', () => navigate('#/cart'));
  }

  function renderResults() {
    const results = state.results;
    if (!results || results.length === 0) {
      appEl.innerHTML = `
        <section class="card">
          <h2 class="section-title">Results</h2>
          <p class="muted">No routes found for your search.</p>
          <div class="actions"><button class="btn" id="backSearch">← Back to Search</button></div>
        </section>
      `;
      document.getElementById('backSearch').addEventListener('click', () => navigate('#/search'));
      return;
    }

    appEl.innerHTML = `
      <section class="card">
        <h2 class="section-title">Available Routes (${results.length})</h2>
        <div class="list">
          ${results.map(r => `
            <div class="item">
              <div style="flex:1">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px">
                  <div><strong style="font-size:1.1rem">${r.origin}</strong> <span style="color:#94a3b8">→</span> <strong style="font-size:1.1rem">${r.destination}</strong></div>
                  <span class="price" style="font-size:1.25rem">${formatCurrency(r.price)}</span>
                </div>
                <div class="muted" style="margin-bottom:12px">
                  <div>${r.date} at ${r.time} | ${formatDuration(r.duration)}</div>
                </div>
                
                <div style="background:#f8fafc; border-left:3px solid #3b82f6; padding:12px 14px; border-radius:6px; margin-bottom:12px">
                  <div style="font-weight:700; color:#1e293b; margin-bottom:8px">${r.operator}</div>
                  ${r.legs ? `
                    <div style="font-size:0.9rem">
                      ${r.legs.map((leg, i) => `
                        <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:${i < r.legs.length - 1 ? '10px' : '0'}">
                          <div style="color:#3b82f6; font-weight:700"></div>
                          <div>
                            <div>${leg.from} → ${leg.to}</div>
                            <div class="muted">${leg.transport} • ${formatDuration(leg.duration)}${leg.stops ? ` • ${leg.stops} stops` : ''}</div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
              <div class="actions" style="gap:8px; flex-direction:column">
                <button class="btn primary" data-id="${r.id}" data-pax="${r.passengers}">Add to Cart</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="divider"></div>
        <div class="actions" style="justify-content:space-between">
          <button class="btn" id="backSearch">← Back to Search</button>
          <button class="btn" id="gotoCart">View Cart (${cartCount()})</button>
        </div>
      </section>
    `;

    document.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const pax = parseInt(btn.getAttribute('data-pax') || '1', 10);
        const base = state.routes.find(r => r.id === id);
        if (!base) return;
        const route = { ...base };
        const existing = state.cart.find(c => c.route.id === route.id);
        if (existing) existing.qty += pax; else state.cart.push({ route, qty: pax });
        saveCart();
        btn.textContent = 'Added!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 1500);
      });
    });
    document.getElementById('backSearch').addEventListener('click', () => navigate('#/search'));
    document.getElementById('gotoCart').addEventListener('click', () => navigate('#/cart'));
  }

  function renderCart() {
    appEl.innerHTML = `
      <section class="card">
        <h2 class="section-title">Shopping Cart</h2>
        ${state.cart.length === 0 ? `
          <p class="muted">Your cart is empty.</p>
          <button class="btn" id="continueShopping">← Continue Shopping</button>
        ` : `
          <div class="list">
            ${state.cart.map(c => `
              <div class="item">
                <div style="flex:1">
                  <div><strong>${c.route.origin}</strong> → <strong>${c.route.destination}</strong></div>
                  <div class="muted">${c.route.date} • ${c.route.operator}</div>
                </div>
                <div class="actions" style="gap:12px">
                  <div>
                    <div style="font-weight:600">${c.qty} ticket(s)</div>
                    <div class="price">${formatCurrency(c.qty * c.route.price)}</div>
                  </div>
                  <button class="btn danger" data-remove="${c.route.id}">Remove</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="divider"></div>
          <div class="actions" style="justify-content:space-between">
            <span class="total">Total: ${formatCurrency(totalPrice())}</span>
            <div class="actions">
              <button class="btn" id="backResults">← Back</button>
              <button class="btn primary" id="checkout">Checkout</button>
            </div>
          </div>
        `}
      </section>
    `;

    document.getElementById('continueShopping')?.addEventListener('click', () => navigate('#/search'));
    document.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove');
        state.cart = state.cart.filter(c => c.route.id !== id);
        saveCart();
        renderCart();
      });
    });
    document.getElementById('backResults')?.addEventListener('click', () => navigate('#/search'));
    document.getElementById('checkout')?.addEventListener('click', () => navigate('#/checkout'));
  }

  function renderCheckout() {
    const cust = state.customer || {};
    appEl.innerHTML = `
      <section class="card">
        <h2 class="section-title">Checkout</h2>
        <div class="divider"></div>
        <h3 style="margin-top:0; font-size:1rem">Order Summary</h3>
        <div class="list" style="margin-bottom:20px">
          ${state.cart.map(c => `
            <div class="item">
              <div>
                <div><strong>${c.route.origin}</strong> → <strong>${c.route.destination}</strong></div>
                <div class="muted">${c.qty} ticket(s)</div>
              </div>
              <div class="price">${formatCurrency(c.qty * c.route.price)}</div>
            </div>
          `).join('')}
        </div>
        <div style="background:#0f1320; padding:12px; border-radius:8px; margin-bottom:20px">
          <div class="total">Subtotal: ${formatCurrency(totalPrice())}</div>
        </div>
        <div class="divider"></div>
        <h3 style="margin-top:0; font-size:1rem">Passenger Information</h3>
        <div class="grid cols-2">
          <div>
            <label for="name">Full Name</label>
            <input id="name" type="text" placeholder="Jane Doe" value="${cust.name || ''}" />
          </div>
          <div>
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="jane@example.com" value="${cust.email || ''}" />
          </div>
        </div>
        <div class="grid cols-2" style="margin-top:12px">
          <div>
            <label for="payment">Payment Method</label>
            <select id="payment">
              <option value="card" ${cust.payment==='card'?'selected':''}>Credit Card</option>
              <option value="applepay" ${cust.payment==='applepay'?'selected':''}>Apple Pay</option>
              <option value="paypal" ${cust.payment==='paypal'?'selected':''}>PayPal</option>
            </select>
          </div>
          <div style="align-self:flex-end">
            <button class="btn" id="backCart">← Back to Cart</button>
          </div>
        </div>
        <div class="actions" style="justify-content:flex-end; margin-top:20px">
          <button class="btn primary" id="confirm" ${state.cart.length===0?'disabled':''}>Complete Purchase</button>
        </div>
      </section>
    `;

    document.getElementById('backCart').addEventListener('click', () => navigate('#/cart'));
    document.getElementById('confirm').addEventListener('click', () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const payment = document.getElementById('payment').value;
      if (!name || !email) {
        alert('Please enter your name and email.');
        return;
      }
      state.customer = { name, email, payment };
      saveCustomer();
      const orderId = 'UC-' + Date.now().toString().slice(-8);
      navigate('#/confirmation?order=' + orderId);
    });
  }

  function renderConfirmation() {
    const params = new URLSearchParams((location.hash.split('?')[1]) || '');
    const orderId = params.get('order') || 'UC-XXXXXX';
    const cust = state.customer || {};
    const cartSnapshot = [...state.cart];
    const total = cartSnapshot.reduce((sum, c) => sum + c.qty * c.route.price, 0);

    state.cart = [];
    saveCart();

    appEl.innerHTML = `
      <section class="card">
        <h2 class="section-title">Order Confirmed</h2>
        <p>Thank you, <strong>${cust.name}</strong>!</p>
        <p class="muted">A confirmation email has been sent to <strong>${cust.email}</strong></p>
        <div style="background:#0f2a1a; padding:16px; border-radius:8px; margin:16px 0; border-left:4px solid #22c55e">
          <div style="font-weight:700; margin-bottom:8px">Order #${orderId}</div>
          <div class="muted">Paid via ${cust.payment === 'card' ? 'Credit Card' : cust.payment === 'applepay' ? 'Apple Pay' : 'PayPal'}</div>
        </div>
        <div class="divider"></div>
        <h3 style="margin-top:0; font-size:1rem">Tickets (${cartSnapshot.length})</h3>
        <div class="list" style="margin-bottom:20px">
          ${cartSnapshot.map(c => `
            <div class="item">
              <div style="flex:1">
                <div><strong>${c.route.origin}</strong> → <strong>${c.route.destination}</strong></div>
                <div class="muted">${c.route.date} at ${c.route.time}</div>
                <div class="muted">${c.route.operator}</div>
              </div>
              <div>
                <div style="font-weight:600; text-align:right">${c.qty} ticket(s)</div>
                <div class="price">${formatCurrency(c.qty * c.route.price)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="background:#0f1320; padding:12px; border-radius:8px; margin-bottom:20px">
          <div class="total">Total Paid: ${formatCurrency(total)}</div>
        </div>
        <div class="actions" style="justify-content:flex-end">
          <button class="btn primary" id="newSearch">Search New Routes</button>
        </div>
      </section>
    `;

    document.getElementById('newSearch').addEventListener('click', () => navigate('#/search'));
  }

  window.addEventListener('hashchange', render);

  (async function init() {
    await loadData();
    navigate(location.hash || '#/search');
  })();
})();
