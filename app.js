// Sample Meals Database
const MEALS = {
  tinutuan: { name: "Tinutuan Power Bowl", calories: "320 kkal", protein: "14g" },
  woku: { name: "Ikan Woku Panggang", calories: "450 kkal", protein: "35g" },
  gohu: { name: "Gohu Fresh Salad", calories: "280 kkal", protein: "8g" },
  rica: { name: "Ayam Rica Tanpa Minyak", calories: "420 kkal", protein: "38g" },
  cakalang: { name: "Cakalang Fufu Bowl", calories: "480 kkal", protein: "40g" },
  garo: { name: "Sayur Garo + Tahu Panggang", calories: "300 kkal", protein: "18g" }
};

const GOALS = {
  diet: "Turun Berat Badan (Diet)",
  olahraga: "Olahraga & Otot",
  maintenance: "Hidup Sehat (Maintenance)",
  khusus: "Kebutuhan Khusus"
};

// Wizard State Setup
let state = {
  plan: 'mingguan',
  goal: '',
  tomorrowLunch: '',
  tomorrowDinner: '',
  delivery: 'delivery',
  address: '',
  nama: '',
  whatsapp: '',
  usia: '',
  berat: '',
  tinggi: '',
  alergi: '',
  targetBerat: '',
  aktivitas: '',
  currentStep: 1
};

// Pricing mappings
const PRICES = {
  mingguan: 400000,
  bulanan: 1440000
};

// Save state to localStorage
function saveState() {
  localStorage.setItem('fitbox_wizard_state', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
  const stored = localStorage.getItem('fitbox_wizard_state');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure all fields exist
      state = { ...state, ...parsed };
    } catch (e) {
      console.error("Failed to parse stored wizard state", e);
    }
  }
}

// Check if a step is valid
function isStepValid(step) {
  switch (step) {
    case 1:
      return ['mingguan', 'bulanan'].includes(state.plan);
    case 2:
      return !!state.goal;
    case 3:
      return !!state.tomorrowLunch && !!state.tomorrowDinner;
    case 4:
      if (state.delivery === 'delivery') {
        return state.address.trim().length >= 5;
      }
      return state.delivery === 'pickup';
    case 5:
      return state.nama.trim().length >= 2 && state.whatsapp.trim().length >= 8;
    default:
      return true;
  }
}

// Verify wizard integrity - ensures no skipped steps
function verifyIntegrityAndGetStep() {
  for (let s = 1; s < 5; s++) {
    if (!isStepValid(s)) {
      return s; // Return first invalid step
    }
  }
  return state.currentStep;
}

// Formats tomorrow's date in WITA (UTC+8) Indonesian format
function getTomorrowWitaString() {
  const now = new Date();
  // Get time in ms, offset by client local offset, then add 8 hours (WITA)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const witaTime = new Date(utc + (3600000 * 8));
  
  // Add 1 day
  const tomorrow = new Date(witaTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return tomorrow.toLocaleDateString('id-ID', options);
}

// Format Currency to Rupiah
function formatRupiah(num) {
  return "Rp" + num.toLocaleString('id-ID');
}

// Enable/Disable navigation buttons based on current step validity
function updateNavButtons() {
  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    btnNext.disabled = !isStepValid(state.currentStep);
  }
}

// Render the active step panel
function renderStep() {
  // Hide all panels
  document.querySelectorAll('.wizard-step-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Show active step panel
  const activePanel = document.getElementById(`step-${state.currentStep}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Update Progress Tracker UI
  document.querySelectorAll('.progress-step').forEach((stepEl, idx) => {
    const stepNum = idx + 1;
    stepEl.classList.remove('active', 'completed');
    
    if (stepNum === state.currentStep) {
      stepEl.classList.add('active');
    } else if (stepNum < state.currentStep) {
      stepEl.classList.add('completed');
    }
  });

  // Calculate Progress Fill percentage
  const totalSteps = 5;
  const progressPercent = ((state.currentStep - 1) / (totalSteps - 1)) * 100;
  const fillBar = document.getElementById('progress-bar-fill');
  if (fillBar) {
    fillBar.style.width = `${progressPercent}%`;
  }

  // Update Navigation Bar Buttons
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');

  if (state.currentStep === 1) {
    if (btnBack) btnBack.style.visibility = 'hidden';
  } else {
    if (btnBack) btnBack.style.visibility = 'visible';
  }

  if (state.currentStep === 6) {
    // Hide navigation bar at the bottom for final confirmation screen
    const navBar = document.getElementById('wizard-nav');
    if (navBar) navBar.style.display = 'none';
    renderRecap();
  } else {
    const navBar = document.getElementById('wizard-nav');
    if (navBar) navBar.style.display = 'flex';
    if (btnNext) btnNext.innerText = 'Lanjut';
  }

  updateNavButtons();
}

// Initialize Wizard UI Values from State
function initWizardInputs() {
  // Step 1: Preselect plan
  document.querySelectorAll('[name="plan-option"]').forEach(input => {
    if (input.value === state.plan) {
      input.checked = true;
      input.closest('.option-card').classList.add('selected');
    } else {
      input.closest('.option-card').classList.remove('selected');
    }
  });

  // Step 2: Preselect goal
  document.querySelectorAll('[name="goal-option"]').forEach(input => {
    if (input.value === state.goal) {
      input.checked = true;
      input.closest('.option-card').classList.add('selected');
    } else {
      input.closest('.option-card').classList.remove('selected');
    }
  });

  // Step 3: Meal selections
  document.querySelectorAll('.meal-option-item').forEach(item => {
    const mealId = item.dataset.meal;
    const type = item.dataset.type; // lunch or dinner
    
    if ((type === 'lunch' && state.tomorrowLunch === mealId) ||
        (type === 'dinner' && state.tomorrowDinner === mealId)) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });

  // Step 4: Delivery method
  document.querySelectorAll('[name="delivery-option"]').forEach(input => {
    if (input.value === state.delivery) {
      input.checked = true;
      input.closest('.option-card').classList.add('selected');
    } else {
      input.closest('.option-card').classList.remove('selected');
    }
  });

  const addressWrapper = document.getElementById('address-input-wrapper');
  const pickupBox = document.getElementById('pickup-info-box');
  const addressText = document.getElementById('address-text');
  
  if (state.delivery === 'delivery') {
    if (addressWrapper) addressWrapper.classList.add('active');
    if (pickupBox) pickupBox.classList.remove('active');
  } else {
    if (addressWrapper) addressWrapper.classList.remove('active');
    if (pickupBox) pickupBox.classList.add('active');
  }

  if (addressText) {
    addressText.value = state.address;
  }

  // Step 5: Data Diri
  const inputNama = document.getElementById('input-nama');
  const inputWa = document.getElementById('input-wa');
  const inputUsia = document.getElementById('input-usia');
  const inputBerat = document.getElementById('input-berat');
  const inputTinggi = document.getElementById('input-tinggi');
  const inputAlergi = document.getElementById('input-alergi');
  const inputTargetBerat = document.getElementById('input-target-berat');
  const inputAktivitas = document.getElementById('input-aktivitas');

  if (inputNama) inputNama.value = state.nama;
  if (inputWa) inputWa.value = state.whatsapp;
  if (inputUsia) inputUsia.value = state.usia;
  if (inputBerat) inputBerat.value = state.berat;
  if (inputTinggi) inputTinggi.value = state.tinggi;
  if (inputAlergi) inputAlergi.value = state.alergi;
  if (inputTargetBerat) inputTargetBerat.value = state.targetBerat;
  if (inputAktivitas) inputAktivitas.value = state.aktivitas;
}

// Render Recap / Checkout summary screen
function renderRecap() {
  const planLabel = state.plan === 'mingguan' ? 'Paket Mingguan (5 Hari / 10 Porsi)' : 'Paket Bulanan (20 Hari / 40 Porsi)';
  const priceVal = PRICES[state.plan];
  
  // Set Recap values
  document.getElementById('recap-plan').innerText = planLabel;
  document.getElementById('recap-total-price').innerText = formatRupiah(priceVal);
  document.getElementById('recap-goal').innerText = GOALS[state.goal] || '-';
  
  // Meals recap
  const lunchMeal = MEALS[state.tomorrowLunch];
  const dinnerMeal = MEALS[state.tomorrowDinner];
  
  const mealsList = document.getElementById('recap-meals-list');
  if (mealsList && lunchMeal && dinnerMeal) {
    mealsList.innerHTML = `
      <li class="recap-meal-item">
        <span class="recap-meal-tag">Makan Siang</span>
        <strong>${lunchMeal.name}</strong> (${lunchMeal.calories} / ${lunchMeal.protein})
      </li>
      <li class="recap-meal-item">
        <span class="recap-meal-tag">Makan Malam</span>
        <strong>${dinnerMeal.name}</strong> (${dinnerMeal.calories} / ${dinnerMeal.protein})
      </li>
    `;
  }

  // Delivery recap
  const recapDeliveryVal = document.getElementById('recap-delivery-val');
  const recapDeliverySub = document.getElementById('recap-delivery-sub');
  
  if (state.delivery === 'delivery') {
    if (recapDeliveryVal) recapDeliveryVal.innerText = 'FitBox Hot Delivery';
    if (recapDeliverySub) recapDeliverySub.innerText = `Alamat: ${state.address}`;
  } else {
    if (recapDeliveryVal) recapDeliveryVal.innerText = 'Pickup Sendiri';
    if (recapDeliverySub) recapDeliverySub.innerText = 'Diambil langsung di Dapur FitBox Manado';
  }

  // Personal data recap
  document.getElementById('recap-name').innerText = state.nama;
  document.getElementById('recap-whatsapp').innerText = state.whatsapp;

  // Render optional data recap list
  const optionalRecap = [];
  if (state.usia) optionalRecap.push(`Usia: ${state.usia} tahun`);
  if (state.berat) optionalRecap.push(`Berat: ${state.berat} kg`);
  if (state.tinggi) optionalRecap.push(`Tinggi: ${state.tinggi} cm`);
  if (state.alergi) optionalRecap.push(`Alergi: ${state.alergi}`);
  if (state.targetBerat) optionalRecap.push(`Target Berat: ${state.targetBerat} kg`);
  if (state.aktivitas) {
    let actText = state.aktivitas;
    if (state.aktivitas === 'low') actText = 'Ringan (Jarang Olahraga)';
    if (state.aktivitas === 'medium') actText = 'Sedang (Olahraga 2-3x/minggu)';
    if (state.aktivitas === 'high') actText = 'Tinggi (Aktif Olahraga)';
    optionalRecap.push(`Aktivitas: ${actText}`);
  }

  const optionalRecapContainer = document.getElementById('recap-optional-container');
  const optionalRecapSection = document.getElementById('recap-optional-section');
  if (optionalRecapContainer && optionalRecapSection) {
    if (optionalRecap.length > 0) {
      optionalRecapSection.style.display = 'block';
      optionalRecapContainer.innerHTML = optionalRecap.map(item => `<li>${item}</li>`).join('');
    } else {
      optionalRecapSection.style.display = 'none';
    }
  }

  // Update tomorrow's date recap text
  const recapDate = document.getElementById('recap-tomorrow-date');
  if (recapDate) {
    recapDate.innerText = getTomorrowWitaString();
  }

  // Generate WhatsApp link
  updateWhatsAppLink();
}

// Generate the prefilled WhatsApp checkout link
function updateWhatsAppLink() {
  const mockNumber = '6281234567890'; // Prefilled mock WhatsApp business contact
  const planLabel = state.plan === 'mingguan' ? 'Paket Mingguan' : 'Paket Bulanan';
  const priceFormatted = formatRupiah(PRICES[state.plan]);
  
  const lunchMeal = MEALS[state.tomorrowLunch] ? MEALS[state.tomorrowLunch].name : '';
  const dinnerMeal = MEALS[state.tomorrowDinner] ? MEALS[state.tomorrowDinner].name : '';
  
  const deliveryLabel = state.delivery === 'delivery' ? `Hot Delivery ke alamat: ${state.address}` : 'Ambil Sendiri di Dapur';
  
  let optionalDetails = '';
  if (state.usia) optionalDetails += `\n- Usia: ${state.usia} tahun`;
  if (state.berat || state.tinggi) optionalDetails += `\n- TB/BB: ${state.tinggi || '-'} cm / ${state.berat || '-'} kg`;
  if (state.alergi) optionalDetails += `\n- Alergi: ${state.alergi}`;
  if (state.targetBerat) optionalDetails += `\n- Target Berat Badan: ${state.targetBerat} kg`;
  if (state.aktivitas) {
    let actText = state.aktivitas;
    if (state.aktivitas === 'low') actText = 'Ringan';
    if (state.aktivitas === 'medium') actText = 'Sedang';
    if (state.aktivitas === 'high') actText = 'Tinggi';
    optionalDetails += `\n- Tingkat Aktivitas: ${actText}`;
  }

  const message = `Halo FitBox Manado! Saya ingin mengonfirmasi langganan katering sehat.

Rincian Pemesanan (POC Website):
- Paket: ${planLabel} (${priceFormatted})
- Tujuan Target: ${GOALS[state.goal]}
- Tanggal Mulai: ${getTomorrowWitaString()}
- Menu Esok Hari:
  * Siang: ${lunchMeal}
  * Malam: ${dinnerMeal}
- Metode Pengiriman: ${deliveryLabel}

Data Diri:
- Nama: ${state.nama}
- No. WhatsApp: ${state.whatsapp}${optionalDetails}

Mohon instruksi untuk pembayaran dan langkah aktivasi selanjutnya. Terima kasih!`;

  const btnWa = document.getElementById('btn-whatsapp');
  if (btnWa) {
    btnWa.href = `https://wa.me/${mockNumber}?text=${encodeURIComponent(message)}`;
  }
}

// Attach Event Listeners on Page Load
document.addEventListener('DOMContentLoaded', () => {
  // Only execute wizard logic if on order.html
  if (!document.getElementById('order-wizard-root')) return;

  // Load previous state
  loadState();

  // Read plan query parameter (?plan=mingguan|bulanan) to pre-populate Step 1
  const urlParams = new URLSearchParams(window.location.search);
  const planParam = urlParams.get('plan');
  if (planParam && ['mingguan', 'bulanan'].includes(planParam.toLowerCase())) {
    state.plan = planParam.toLowerCase();
    state.currentStep = 1; // reset step on query param navigation to allow verification
    saveState();
  }

  // Date banner calculations
  const tomorrowDateLabel = document.getElementById('tomorrow-date-label');
  if (tomorrowDateLabel) {
    tomorrowDateLabel.innerText = getTomorrowWitaString();
  }

  // Ensure state consistency (fallback to first incomplete step)
  const safeStep = verifyIntegrityAndGetStep();
  if (safeStep < state.currentStep) {
    state.currentStep = safeStep;
    saveState();
  }

  // Initialize UI inputs from state
  initWizardInputs();
  renderStep();

  // Step 1 event listener (Plan selection)
  document.querySelectorAll('[name="plan-option"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.plan = e.target.value;
      
      // Update styling class
      document.querySelectorAll('[name="plan-option"]').forEach(radio => {
        radio.closest('.option-card').classList.remove('selected');
      });
      e.target.closest('.option-card').classList.add('selected');
      
      saveState();
      updateNavButtons();
    });
    
    // Allow clicking the card itself
    input.closest('.option-card').addEventListener('click', () => {
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    });
  });

  // Step 2 event listener (Goal selection)
  document.querySelectorAll('[name="goal-option"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.goal = e.target.value;
      
      document.querySelectorAll('[name="goal-option"]').forEach(radio => {
        radio.closest('.option-card').classList.remove('selected');
      });
      e.target.closest('.option-card').classList.add('selected');
      
      saveState();
      updateNavButtons();
    });

    input.closest('.option-card').addEventListener('click', () => {
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    });
  });

  // Step 3 event listeners (Lunch and Dinner selections)
  document.querySelectorAll('.meal-option-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type; // lunch or dinner
      const mealId = item.dataset.meal;

      // Deselect siblings of same type
      document.querySelectorAll(`.meal-option-item[data-type="${type}"]`).forEach(sibling => {
        sibling.classList.remove('selected');
      });

      // Select clicked
      item.classList.add('selected');

      // Update state
      if (type === 'lunch') {
        state.tomorrowLunch = mealId;
      } else if (type === 'dinner') {
        state.tomorrowDinner = mealId;
      }

      saveState();
      updateNavButtons();
    });
  });

  // Step 4 event listeners (Delivery / Pickup options)
  document.querySelectorAll('[name="delivery-option"]').forEach(input => {
    input.addEventListener('change', (e) => {
      state.delivery = e.target.value;
      
      document.querySelectorAll('[name="delivery-option"]').forEach(radio => {
        radio.closest('.option-card').classList.remove('selected');
      });
      e.target.closest('.option-card').classList.add('selected');

      // Toggle input textareas
      const addressWrapper = document.getElementById('address-input-wrapper');
      const pickupBox = document.getElementById('pickup-info-box');
      
      if (state.delivery === 'delivery') {
        if (addressWrapper) addressWrapper.classList.add('active');
        if (pickupBox) pickupBox.classList.remove('active');
      } else {
        if (addressWrapper) addressWrapper.classList.remove('active');
        if (pickupBox) pickupBox.classList.add('active');
        state.address = ''; // reset address if pickup chosen
      }
      
      saveState();
      updateNavButtons();
    });

    input.closest('.option-card').addEventListener('click', () => {
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    });
  });

  // Textarea change listener
  const addressText = document.getElementById('address-text');
  if (addressText) {
    addressText.addEventListener('input', (e) => {
      state.address = e.target.value;
      saveState();
      updateNavButtons();
    });
  }

  // Step 5 Event Listeners
  const inputNama = document.getElementById('input-nama');
  if (inputNama) {
    inputNama.addEventListener('input', (e) => {
      state.nama = e.target.value;
      saveState();
      updateNavButtons();
    });
  }

  const inputWa = document.getElementById('input-wa');
  if (inputWa) {
    inputWa.addEventListener('input', (e) => {
      state.whatsapp = e.target.value;
      saveState();
      updateNavButtons();
    });
  }

  // Optional Field listeners
  const optFields = ['usia', 'berat', 'tinggi', 'alergi', 'target-berat', 'aktivitas'];
  optFields.forEach(field => {
    const id = `input-${field}`;
    const inputEl = document.getElementById(id);
    if (inputEl) {
      inputEl.addEventListener('input', (e) => {
        const camelKey = field.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        state[camelKey] = e.target.value;
        saveState();
      });
    }
  });

  // Optional Fields drawer toggle
  const toggleBtn = document.getElementById('optional-toggle-btn');
  const optionalSection = document.getElementById('optional-section');
  if (toggleBtn && optionalSection) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = optionalSection.classList.toggle('active');
      toggleBtn.innerHTML = isVisible ? 'Sembunyikan Informasi Opsional &minus;' : 'Lengkapi Informasi Opsional (Untuk Riset & Nutrisi) &plus;';
    });
  }

  // Navigation Button Handlers
  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (isStepValid(state.currentStep)) {
        state.currentStep += 1;
        saveState();
        renderStep();
        window.scrollTo(0, 0);
      }
    });
  }

  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
        saveState();
        renderStep();
        window.scrollTo(0, 0);
      }
    });
  }

  // Reset button on recap screen
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear localStorage and reset state
      localStorage.removeItem('fitbox_wizard_state');
      state = {
        plan: 'mingguan',
        goal: '',
        tomorrowLunch: '',
        tomorrowDinner: '',
        delivery: 'delivery',
        address: '',
        nama: '',
        whatsapp: '',
        usia: '',
        berat: '',
        tinggi: '',
        alergi: '',
        targetBerat: '',
        aktivitas: '',
        currentStep: 1
      };
      initWizardInputs();
      renderStep();
      window.location.href = 'index.html';
    });
  }
});
