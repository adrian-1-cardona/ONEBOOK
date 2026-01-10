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
    // Load routes from JSON file
    try {
      const response = await fetch('data/routes.json');
      state.routes = await response.json();
    } catch (e) {
      console.error('Failed to load routes:', e);
      // Fallback to empty routes
      state.routes = [];
    }
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
