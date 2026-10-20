(function () {
  var cart = [];
  var countBadge = document.getElementById('cart-count');
  var drawerCount = document.getElementById('drawer-count');
  var subtotal = document.getElementById('cart-subtotal');
  var cartItems = document.getElementById('cart-items');
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  var toast = document.getElementById('toast');
  var searchPanel = document.getElementById('search-panel');
  var searchInput = document.getElementById('product-search');
  var emptySearch = document.getElementById('empty-search');
  var toastTimer;

  function formatPrice(value) {
    return new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(value) + ' TND';
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function renderCart() {
    var itemCount = cart.reduce(function (total, item) { return total + item.quantity; }, 0);
    var cartTotal = cart.reduce(function (total, item) { return total + item.price * item.quantity; }, 0);

    countBadge.textContent = itemCount;
    drawerCount.textContent = '(' + itemCount + ')';
    subtotal.textContent = formatPrice(cartTotal);
    cartItems.textContent = '';

    if (!cart.length) {
      var empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = 'Votre panier est encore vide.';
      cartItems.appendChild(empty);
      return;
    }

    cart.forEach(function (item) {
      var row = document.createElement('div');
      var name = document.createElement('strong');
      var price = document.createElement('span');
      var quantity = document.createElement('span');
      var remove = document.createElement('button');

      row.className = 'cart-row';
      name.textContent = item.name;
      price.textContent = formatPrice(item.price * item.quantity);
      quantity.textContent = 'Quantité : ' + item.quantity;
      remove.type = 'button';
      remove.textContent = 'Retirer';
      remove.setAttribute('aria-label', 'Retirer ' + item.name + ' du panier');
      remove.addEventListener('click', function () {
        cart = cart.filter(function (cartItem) { return cartItem.name !== item.name; });
        renderCart();
      });

      row.appendChild(name);
      row.appendChild(price);
      row.appendChild(quantity);
      row.appendChild(remove);
      cartItems.appendChild(row);
    });
  }

  function setCartOpen(open) {
    drawer.hidden = !open;
    overlay.hidden = !open;
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('cart-is-open', open);
    if (open) {
      drawer.querySelector('.cart-close').focus();
    }
  }

  function applyFilters() {
    var selected = document.querySelector('.filter-button.is-active').getAttribute('data-filter');
    var query = searchInput.value.trim().toLocaleLowerCase('fr');
    var visibleCount = 0;

    document.querySelectorAll('.product-card').forEach(function (card) {
      var categoryMatches = selected === 'Tous' || card.getAttribute('data-category') === selected;
      var nameMatches = !query || card.getAttribute('data-name').toLocaleLowerCase('fr').indexOf(query) !== -1;
      card.hidden = !(categoryMatches && nameMatches);
      if (!card.hidden) visibleCount += 1;
    });

    emptySearch.hidden = visibleCount > 0;
  }

  document.querySelector('.cart-toggle').addEventListener('click', function () {
    setCartOpen(true);
  });
  document.querySelector('.cart-close').addEventListener('click', function () {
    setCartOpen(false);
  });
  overlay.addEventListener('click', function () {
    setCartOpen(false);
  });

  document.querySelectorAll('.add-to-cart').forEach(function (button) {
    button.addEventListener('click', function () {
      var existing = cart.find(function (item) { return item.name === button.dataset.product; });
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name: button.dataset.product, price: Number(button.dataset.price), quantity: 1 });
      }
      renderCart();
      showToast(button.dataset.product + ' ajouté à votre panier');
    });
  });

  document.querySelectorAll('.filter-button').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.filter-button').forEach(function (filter) {
        var active = filter === button;
        filter.classList.toggle('is-active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      applyFilters();
    });
  });

  document.querySelectorAll('[data-category-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      var category = link.getAttribute('data-category-link');
      var filter = document.querySelector('.filter-button[data-filter="' + category + '"]');
      if (filter) filter.click();
    });
  });

  document.querySelector('.search-toggle').addEventListener('click', function (event) {
    var open = searchPanel.hidden;
    searchPanel.hidden = !open;
    event.currentTarget.setAttribute('aria-expanded', String(open));
    if (open) searchInput.focus();
  });
  document.querySelector('.search-close').addEventListener('click', function () {
    searchPanel.hidden = true;
    document.querySelector('.search-toggle').setAttribute('aria-expanded', 'false');
    searchInput.value = '';
    applyFilters();
  });
  searchInput.addEventListener('input', applyFilters);

  document.querySelector('.menu-toggle').addEventListener('click', function (event) {
    var nav = document.querySelector('.primary-nav');
    var open = nav.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.primary-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.querySelector('.primary-nav').classList.remove('is-open');
      document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelector('.checkout-button').addEventListener('click', function () {
    showToast('Le paiement en ligne sera bientôt disponible.');
  });
  document.getElementById('newsletter-form').addEventListener('submit', function (event) {
    event.preventDefault();
    document.getElementById('newsletter-message').hidden = false;
    event.currentTarget.reset();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setCartOpen(false);
      searchPanel.hidden = true;
      document.querySelector('.search-toggle').setAttribute('aria-expanded', 'false');
    }
  });

  renderCart();
}());