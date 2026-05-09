// Mindful Spender — Settings Popup

const wageInput = document.getElementById('wage-input');
const saveBtn = document.getElementById('save-btn');
const statusMsg = document.getElementById('status-msg');
const currentWageWrap = document.getElementById('current-wage-wrap');
const currentWageValue = document.getElementById('current-wage-value');

function showStatus(msg, duration = 2000) {
  statusMsg.textContent = msg;
  statusMsg.classList.remove('hidden');
  setTimeout(() => statusMsg.classList.add('hidden'), duration);
}

function loadWage() {
  chrome.storage.sync.get(['hourlyWage'], (result) => {
    const wage = result.hourlyWage;
    if (wage && wage > 0) {
      currentWageValue.textContent = `$${parseFloat(wage).toFixed(2)}`;
      currentWageWrap.classList.add('visible');
      wageInput.placeholder = parseFloat(wage).toFixed(2);
    }
  });
}

function saveWage() {
  const raw = wageInput.value.trim();
  const wage = parseFloat(raw);

  if (!raw || isNaN(wage) || wage <= 0) {
    showStatus('⚠ Please enter a valid hourly wage.');
    return;
  }

  chrome.storage.sync.set({ hourlyWage: wage }, () => {
    currentWageValue.textContent = `$${wage.toFixed(2)}`;
    currentWageWrap.classList.add('visible');
    wageInput.value = '';
    wageInput.placeholder = wage.toFixed(2);
    showStatus('✓ Wage saved!');
  });
}

saveBtn.addEventListener('click', saveWage);

wageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveWage();
});

loadWage();
