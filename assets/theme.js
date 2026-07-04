(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var mobileNav = document.querySelector('[data-mobile-nav]');
  document.querySelectorAll('[data-mobile-nav-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (mobileNav) mobileNav.classList.add('is-open');
    });
  });
  document.querySelectorAll('[data-mobile-nav-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (mobileNav) mobileNav.classList.remove('is-open');
    });
  });

  /* ---------- Cart drawer ---------- */
  var drawer = document.querySelector('[data-cart-drawer]');
  var overlay = document.querySelector('[data-cart-drawer-overlay]');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-drawer-toggle]')) {
      e.preventDefault();
      openDrawer();
      refreshCartDrawer();
    }
    if (e.target.closest('[data-cart-drawer-close]') || e.target.closest('[data-cart-drawer-overlay]')) {
      closeDrawer();
    }
  });

  function renderMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function refreshCartDrawer() {
    var itemsEl = document.querySelector('[data-cart-drawer-items]');
    var footerEl = document.querySelector('[data-cart-drawer-footer]');
    var countEls = document.querySelectorAll('[data-cart-count]');
    if (!itemsEl) return;

    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        countEls.forEach(function (el) { el.textContent = cart.item_count; });

        if (cart.item_count === 0) {
          itemsEl.innerHTML = '<p class="cart-empty-state">' + (window.themeStrings ? window.themeStrings.cartEmpty : 'Your cart is empty') + '</p>';
          if (footerEl) footerEl.style.display = 'none';
          return;
        }

        if (footerEl) footerEl.style.display = '';

        itemsEl.innerHTML = cart.items.map(function (item) {
          return '' +
            '<div class="cart-item" data-cart-item data-key="' + item.key + '">' +
              '<img src="' + item.image + '" alt="" loading="lazy" width="80">' +
              '<div>' +
                '<p class="cart-item__title">' + item.product_title + '</p>' +
                (item.variant_title ? '<p class="cart-item__variant">' + item.variant_title + '</p>' : '') +
                '<div class="quantity-input" data-quantity-input>' +
                  '<button type="button" data-quantity-decrease>-</button>' +
                  '<input type="number" min="0" value="' + item.quantity + '" data-quantity-value>' +
                  '<button type="button" data-quantity-increase>+</button>' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<p class="price">' + renderMoney(item.final_line_price) + '</p>' +
                '<button type="button" class="cart-item__remove" data-cart-remove>Remove</button>' +
              '</div>' +
            '</div>';
        }).join('');

        var subtotalEl = document.querySelector('[data-cart-subtotal]');
        if (subtotalEl) subtotalEl.textContent = renderMoney(cart.total_price);
      });
  }

  function changeCartItem(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(function () { refreshCartDrawer(); });
  }

  document.addEventListener('click', function (e) {
    var removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      var wrapper = removeBtn.closest('[data-cart-item]');
      changeCartItem(wrapper.getAttribute('data-key'), 0);
    }
    var inc = e.target.closest('[data-quantity-increase]');
    var dec = e.target.closest('[data-quantity-decrease]');
    if (inc || dec) {
      var input = (inc || dec).parentElement.querySelector('[data-quantity-value]');
      var value = parseInt(input.value, 10) || 0;
      value = inc ? value + 1 : Math.max(0, value - 1);
      input.value = value;
      var itemWrapper = (inc || dec).closest('[data-cart-item]');
      if (itemWrapper) changeCartItem(itemWrapper.getAttribute('data-key'), value);
    }
  });

  /* ---------- Add to cart (progressive enhancement) ---------- */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-product-form]');
    if (!form) return;
    e.preventDefault();

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.setAttribute('disabled', 'disabled');

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (submitBtn) submitBtn.removeAttribute('disabled');
        if (data.status) {
          var errorEl = form.querySelector('[data-form-error]');
          if (errorEl) {
            errorEl.textContent = data.description || data.message;
            errorEl.hidden = false;
          }
          return;
        }
        if (document.querySelector('[data-cart-drawer]')) {
          openDrawer();
          refreshCartDrawer();
        } else {
          window.location.href = '/cart';
        }
      })
      .catch(function () {
        if (submitBtn) submitBtn.removeAttribute('disabled');
        form.submit();
      });
  });

  /* ---------- Product variant picker ---------- */
  document.querySelectorAll('[data-product-info]').forEach(function (root) {
    var dataEl = root.querySelector('[data-product-json]');
    if (!dataEl) return;
    var product = JSON.parse(dataEl.textContent);
    var variantInput = root.querySelector('[data-variant-id]');
    var priceEl = root.querySelector('[data-product-price]');
    var comparePriceEl = root.querySelector('[data-product-compare-price]');
    var submitBtn = root.querySelector('[data-add-to-cart]');
    var submitText = root.querySelector('[data-add-to-cart-text]');

    function getSelectedOptions() {
      var selected = [];
      root.querySelectorAll('[data-option-index]').forEach(function (input) {
        if (input.type !== 'radio' || input.checked) {
          selected[parseInt(input.getAttribute('data-option-index'), 10)] = input.value;
        }
      });
      return selected;
    }

    function findVariant(options) {
      return product.variants.find(function (variant) {
        return variant.options.every(function (opt, i) { return opt === options[i]; });
      });
    }

    function updateAvailability() {
      var selected = getSelectedOptions();
      root.querySelectorAll('[data-option-index]').forEach(function (input) {
        var index = parseInt(input.getAttribute('data-option-index'), 10);
        var testOptions = selected.slice();
        testOptions[index] = input.value;
        var matched = findVariant(testOptions);
        input.disabled = !matched || !matched.available;
      });
    }

    function updateUI() {
      var selected = getSelectedOptions();
      var variant = findVariant(selected);
      updateAvailability();

      if (!variant) {
        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.textContent = window.themeStrings ? window.themeStrings.unavailable : 'Unavailable';
        return;
      }

      if (variantInput) variantInput.value = variant.id;
      if (priceEl) priceEl.textContent = renderMoney(variant.price);
      if (comparePriceEl) {
        if (variant.compare_at_price > variant.price) {
          comparePriceEl.textContent = renderMoney(variant.compare_at_price);
          comparePriceEl.hidden = false;
        } else {
          comparePriceEl.hidden = true;
        }
      }

      if (variant.featured_media) {
        var mainImage = root.querySelector('[data-product-main-image]');
        if (mainImage && variant.featured_media.preview_image) {
          mainImage.src = variant.featured_media.preview_image.src.replace(/(\.[a-z]+)(\?|$)/i, '_800x$1$2');
        }
      }

      if (submitBtn) {
        submitBtn.disabled = !variant.available;
      }
      if (submitText) {
        submitText.textContent = variant.available
          ? (window.themeStrings ? window.themeStrings.addToCart : 'Add to cart')
          : (window.themeStrings ? window.themeStrings.soldOut : 'Sold out');
      }
    }

    root.addEventListener('change', function (e) {
      if (e.target.hasAttribute('data-option-index')) updateUI();
    });

    updateUI();
  });

  /* ---------- Accordion (product details) ---------- */
  document.querySelectorAll('.product-accordion details').forEach(function (details) {
    details.addEventListener('toggle', function () {
      if (!details.open) return;
      details.parentElement.querySelectorAll('details').forEach(function (other) {
        if (other !== details) other.open = false;
      });
    });
  });

  /* ---------- Standalone quantity inputs (cart page) ---------- */
  document.querySelectorAll('[data-quantity-input]').forEach(function (wrapper) {
    if (wrapper.closest('[data-cart-item]')) return;
    var input = wrapper.querySelector('[data-quantity-value]');
    var inc = wrapper.querySelector('[data-quantity-increase]');
    var dec = wrapper.querySelector('[data-quantity-decrease]');
    if (inc) inc.addEventListener('click', function () { input.value = (parseInt(input.value, 10) || 0) + 1; });
    if (dec) dec.addEventListener('click', function () { input.value = Math.max(0, (parseInt(input.value, 10) || 0) - 1); });
  });
})();
