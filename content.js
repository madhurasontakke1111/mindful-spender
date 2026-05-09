// Mindful Spender — Content Script
// Detects checkout/cart pages and injects a mindful pause overlay

(function () {
  'use strict';

  const TIMER_DURATION = 60; // seconds

  const REFLECTIONS = [
    '"Do I really need this, or do I just want it right now?"',
    '"Will this matter to me in 6 months?"',
    '"Am I buying this out of stress or genuine need?"',
    '"Have I compared prices or looked for a better deal?"',
    '"Can I wait 24 hours and see if I still want it?"',
    '"Is this aligned with my financial goals?"',
    '"Am I within my budget for this month?"',
    '"Would my future self thank me for this purchase?"',
  ];

  let overlayInjected = false;
  let countdownInterval = null;
  let secondsLeft = TIMER_DURATION;
  let reflectionIndex = 0;

  function isCheckoutPage() {
    const url = window.location.href.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const title = document.title.toLowerCase();

    const checkoutPatterns = [
      'cart', 'checkout', 'basket', 'order', 'payment', 'buy-now',
      'purchase', 'proceed-to-pay', 'confirm-order'
    ];

    for (const pattern of checkoutPatterns) {
      if (url.includes(pattern) || pathname.includes(pattern)) {
        return true;
      }
    }

    // Also check for common checkout page indicators in the DOM
    const checkoutSelectors = [
      '[data-testid*="checkout"]',
      '[class*="checkout"]',
      '[id*="checkout"]',
      '[class*="cart-total"]',
      '[class*="order-summary"]',
      'form[action*="checkout"]',
      'form[action*="cart"]',
      '[class*="place-order"]',
      '[id*="place-order"]',
      'button[class*="buy"]',
      'input[value*="Place Order"]',
      'button[class*="pay-now"]',
    ];

    for (const sel of checkoutSelectors) {
      try {
        if (document.querySelector(sel)) return true;
      } catch (e) {}
    }

    return false;
  }

  function extractTotal() {
    // Common selectors for order totals across major e-commerce sites
    const totalSelectors = [
      // Generic
      '[class*="order-total"] [class*="price"]',
      '[class*="cart-total"] [class*="price"]',
      '[class*="total-price"]',
      '[class*="grand-total"]',
      '[id*="grand-total"]',
      '[id*="order-total"]',
      // Amazon
      '#subtotals-marketplace-table .a-text-bold',
      '#sc-subtotal-amount-activecart',
      '.sc-price-container .sc-price',
      // eBay
      '#PAYBOX_AMOUNT',
      // Walmart
      '[data-automation-id="totals-price"]',
      // Target
      '[data-test="cartSummary-totalPrice"]',
      // Generic patterns
      'tfoot td:last-child',
      '[class*="checkout-total"]',
      '[class*="summary-total"]',
      '[class*="total_amount"]',
      '[class*="totalAmount"]',
      '[class*="TotalAmount"]',
    ];

    for (const sel of totalSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent.trim();
          const match = text.match(/[\$\£\€]?\s*([\d,]+\.?\d*)/);
          if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            if (amount > 0) return amount;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  function formatHours(hours) {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min${minutes !== 1 ? 's' : ''} of work`;
    }
    const h = Math.floor(hours);
    const mins = Math.round((hours - h) * 60);
    if (mins === 0) return `${h} hr${h !== 1 ? 's' : ''} of work`;
    return `${h} hr${h !== 1 ? 's' : ''} ${mins} min of work`;
  }

  function getCircumference() {
    // radius = 65, circumference = 2πr ≈ 408
    return 2 * Math.PI * 65;
  }

  function updateArc(fraction) {
    const arc = document.getElementById('mindful-spender-timer-arc');
    if (!arc) return;
    const circ = getCircumference();
    const offset = circ * (1 - fraction);
    arc.style.strokeDasharray = circ;
    arc.style.strokeDashoffset = offset;

    // Color shift from green → yellow as time runs low
    if (fraction > 0.5) {
      arc.style.stroke = '#4ade80';
    } else if (fraction > 0.2) {
      arc.style.stroke = '#86efac';
    } else {
      arc.style.stroke = '#fbbf24';
      arc.style.filter = 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))';
    }
  }

  function cycleReflection() {
    const el = document.getElementById('mindful-spender-reflection');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
      reflectionIndex = (reflectionIndex + Math.floor(Math.random() * (REFLECTIONS.length - 1)) + 1) % REFLECTIONS.length;
      el.textContent = REFLECTIONS[reflectionIndex];
      el.style.opacity = '0.85';
    }, 400);
  }

  function showProceedButton() {
    const proceed = document.getElementById('mindful-spender-proceed');
    const waiting = document.getElementById('mindful-spender-waiting');
    if (proceed) proceed.classList.add('visible');
    if (waiting) waiting.classList.add('hidden');

    const timerText = document.getElementById('mindful-spender-timer-text');
    if (timerText) {
      timerText.textContent = '✓';
      timerText.style.fontSize = '32px';
    }

    const arc = document.getElementById('mindful-spender-timer-arc');
    if (arc) {
      arc.style.stroke = '#22c55e';
      arc.style.strokeDashoffset = 0;
      arc.style.filter = 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))';
    }

    const reflection = document.getElementById('mindful-spender-reflection');
    if (reflection) {
      reflection.textContent = '"Your mindful pause is complete. Take one last breath before deciding."';
      reflection.style.opacity = '0.85';
    }
  }

  function startCountdown() {
    secondsLeft = TIMER_DURATION;
    const timerText = document.getElementById('mindful-spender-timer-text');
    const circ = getCircumference();
    const arc = document.getElementById('mindful-spender-timer-arc');
    if (arc) {
      arc.style.strokeDasharray = circ;
      arc.style.strokeDashoffset = 0;
    }

    // Cycle reflections every 15 seconds
    let reflectionTimer = setInterval(() => {
      cycleReflection();
    }, 15000);

    countdownInterval = setInterval(() => {
      secondsLeft--;

      if (timerText) timerText.textContent = secondsLeft;
      updateArc(secondsLeft / TIMER_DURATION);

      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        clearInterval(reflectionTimer);
        showProceedButton();
      }
    }, 1000);
  }

  function showWageForm() {
    const form = document.getElementById('mindful-spender-wage-form');
    const setWageBtn = document.getElementById('mindful-spender-setwage');
    if (form) form.classList.add('visible');
    if (setWageBtn) setWageBtn.style.display = 'none';
    const input = document.getElementById('mindful-spender-wage-input');
    if (input) input.focus();
  }

  function saveWageAndUpdate(wage) {
    chrome.storage.sync.set({ hourlyWage: wage }, () => {
      updateWorkHoursDisplay(wage);
    });
    const form = document.getElementById('mindful-spender-wage-form');
    const setWageBtn = document.getElementById('mindful-spender-setwage');
    if (form) form.classList.remove('visible');
    if (setWageBtn) {
      setWageBtn.style.display = '';
      setWageBtn.textContent = 'Change hourly wage';
    }
  }

  function updateWorkHoursDisplay(wage) {
    const total = extractTotal();
    const block = document.getElementById('mindful-spender-workhours');
    const valueEl = document.getElementById('mindful-spender-workhours-value');
    const detailEl = document.getElementById('mindful-spender-workhours-detail');

    if (wage && wage > 0 && total && total > 0) {
      const hours = total / wage;
      if (valueEl) valueEl.textContent = formatHours(hours);
      if (detailEl) detailEl.textContent = `$${total.toFixed(2)} ÷ $${wage}/hr`;
      if (block) block.classList.add('visible');
    } else if (wage && wage > 0) {
      if (valueEl) valueEl.textContent = 'Set wage to calculate';
      if (detailEl) detailEl.textContent = 'Could not detect cart total automatically';
      if (block) block.classList.add('visible');
    }
  }

  function injectOverlay() {
    if (overlayInjected) return;
    overlayInjected = true;

    const circ = getCircumference();
    reflectionIndex = Math.floor(Math.random() * REFLECTIONS.length);

    const overlay = document.createElement('div');
    overlay.id = 'mindful-spender-overlay';
    overlay.innerHTML = `
      <div id="mindful-spender-card">
        <div id="mindful-spender-leaf">🌿</div>
        <div id="mindful-spender-title">Mindful Spender</div>
        <div id="mindful-spender-subtitle">Take a moment before you buy.<br>Your future self will thank you.</div>

        <div id="mindful-spender-workhours">
          <div id="mindful-spender-workhours-label">Cost in Work Hours</div>
          <div id="mindful-spender-workhours-value">Calculating…</div>
          <div id="mindful-spender-workhours-detail"></div>
        </div>

        <div id="mindful-spender-timer-wrap">
          <svg id="mindful-spender-timer-svg" viewBox="0 0 140 140">
            <circle id="mindful-spender-timer-bg" cx="70" cy="70" r="65"/>
            <circle id="mindful-spender-timer-arc" cx="70" cy="70" r="65"
              stroke-dasharray="${circ}" stroke-dashoffset="0"/>
          </svg>
          <div id="mindful-spender-timer-text">${TIMER_DURATION}
            <span id="mindful-spender-timer-seconds-label">sec</span>
          </div>
        </div>

        <div id="mindful-spender-reflection">${REFLECTIONS[reflectionIndex]}</div>

        <p id="mindful-spender-waiting">Please wait for the timer to finish…</p>

        <button id="mindful-spender-proceed">
          I've thought about it — Proceed to Purchase
        </button>

        <button id="mindful-spender-setwage">Set my hourly wage</button>

        <div id="mindful-spender-wage-form">
          <input
            id="mindful-spender-wage-input"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Hourly wage ($)"
          />
          <button id="mindful-spender-wage-save">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Wire up events
    document.getElementById('mindful-spender-proceed').addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s ease';
      setTimeout(() => overlay.remove(), 400);
      overlayInjected = false;
    });

    document.getElementById('mindful-spender-setwage').addEventListener('click', showWageForm);

    document.getElementById('mindful-spender-wage-save').addEventListener('click', () => {
      const input = document.getElementById('mindful-spender-wage-input');
      const wage = parseFloat(input.value);
      if (wage > 0) {
        saveWageAndUpdate(wage);
      }
    });

    document.getElementById('mindful-spender-wage-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const wage = parseFloat(e.target.value);
        if (wage > 0) saveWageAndUpdate(wage);
      }
    });

    // Load saved wage and display work hours
    chrome.storage.sync.get(['hourlyWage'], (result) => {
      const wage = result.hourlyWage;
      if (wage && wage > 0) {
        updateWorkHoursDisplay(wage);
        const setWageBtn = document.getElementById('mindful-spender-setwage');
        if (setWageBtn) setWageBtn.textContent = 'Change hourly wage';
      }
    });

    // Start the timer
    startCountdown();
  }

  function checkAndInject() {
    if (!overlayInjected && isCheckoutPage()) {
      // Small delay to let the page finish rendering
      setTimeout(injectOverlay, 800);
    }
  }

  // Run on initial page load
  checkAndInject();

  // Also watch for URL changes (single-page apps like React storefronts)
  let lastHref = window.location.href;
  const observer = new MutationObserver(() => {
    const currentHref = window.location.href;
    if (currentHref !== lastHref) {
      lastHref = currentHref;
      overlayInjected = false;
      clearInterval(countdownInterval);
      checkAndInject();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
