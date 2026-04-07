/**
 * MIDO Restaurante v2 - Reservas JavaScript
 * Funcionalidades avançadas de reserva
 */

// ============================================
// STATE
// ============================================
let reservationState = {
    step: 1,
    date: null,
    time: null,
    guests: null,
    table: null,
    occasion: null,
    name: '',
    phone: '',
    email: '',
    notes: '',
    preferences: []
};

// Table configuration
const tables = [
    { id: 1, seats: 2, status: 'available' },
    { id: 2, seats: 2, status: 'available' },
    { id: 3, seats: 4, status: 'available' },
    { id: 4, seats: 4, status: 'occupied' },
    { id: 5, seats: 4, status: 'available' },
    { id: 6, seats: 6, status: 'available' },
    { id: 7, seats: 6, status: 'occupied' },
    { id: 8, seats: 8, status: 'available' }
];

// Current date for calendar
let currentDate = new Date();
let selectedDate = null;

// ============================================
// DOM ELEMENTS
// ============================================
const form = document.getElementById('reservationForm');
const formSections = document.querySelectorAll('.form-section');
const formSteps = document.querySelectorAll('.form-step');

// Step 1
const datePickerGrid = document.getElementById('datePickerGrid');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const timeSlots = document.getElementById('timeSlots');
const guestOptions = document.getElementById('guestOptions');
const step1Next = document.getElementById('step1Next');

// Step 2
const tableMap = document.getElementById('tableMap');
const step2Prev = document.getElementById('step2Prev');
const step2Next = document.getElementById('step2Next');

// Step 3
const occasionOptions = document.getElementById('occasionOptions');
const inputName = document.getElementById('inputName');
const inputPhone = document.getElementById('inputPhone');
const inputEmail = document.getElementById('inputEmail');
const inputNotes = document.getElementById('inputNotes');
const step3Prev = document.getElementById('step3Prev');
const submitReservation = document.getElementById('submitReservation');

// Summary
const summaryDate = document.getElementById('summaryDate');
const summaryTime = document.getElementById('summaryTime');
const summaryGuests = document.getElementById('summaryGuests');
const summaryTable = document.getElementById('summaryTable');
const summaryOccasion = document.getElementById('summaryOccasion');

// Success Modal
const successModal = document.getElementById('successModal');
const successDetails = document.getElementById('successDetails');

// ============================================
// CALENDAR
// ============================================
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    let html = '';
    
    // Weekday headers
    weekDays.forEach(day => {
        html += `<div class="date-picker-weekday">${day}</div>`;
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div></div>`;
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < new Date(today.setHours(0, 0, 0, 0));
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        
        const classes = [];
        if (isToday) classes.push('today');
        if (isPast) classes.push('disabled');
        if (isSelected) classes.push('selected');
        
        html += `<div class="date-picker-day ${classes.join(' ')}" data-day="${day}">${day}</div>`;
    }
    
    datePickerGrid.innerHTML = html;
    
    // Add click handlers
    datePickerGrid.querySelectorAll('.date-picker-day:not(.disabled)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const day = parseInt(dayEl.dataset.day);
            selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            reservationState.date = selectedDate;
            renderCalendar();
            updateSummary();
            checkStep1Complete();
        });
    });
}

if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
}

if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

// ============================================
// TIME SLOTS
// ============================================
if (timeSlots) {
    timeSlots.addEventListener('click', (e) => {
        const slot = e.target.closest('.time-slot');
        if (!slot || slot.classList.contains('disabled')) return;
        
        timeSlots.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        reservationState.time = slot.dataset.time;
        updateSummary();
        checkStep1Complete();
    });
}

// ============================================
// GUEST SELECTOR
// ============================================
if (guestOptions) {
    guestOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.guest-option');
        if (!option) return;
        
        guestOptions.querySelectorAll('.guest-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        reservationState.guests = option.dataset.guests;
        updateSummary();
        checkStep1Complete();
        
        // Update available tables based on guests
        renderTableMap();
    });
}

function checkStep1Complete() {
    const isComplete = reservationState.date && reservationState.time && reservationState.guests;
    step1Next.disabled = !isComplete;
}

// ============================================
// TABLE MAP
// ============================================
function renderTableMap() {
    const guests = parseInt(reservationState.guests) || 1;
    
    tableMap.innerHTML = tables.map(table => {
        let status = table.status;
        
        // Auto-mark tables as occupied if too small for group
        if (table.seats < guests && status === 'available') {
            status = 'occupied';
        }
        
        const isSelected = reservationState.table === table.id;
        const classes = [status];
        if (isSelected) classes.push('selected');
        
        return `
            <div class="table ${classes.join(' ')}" data-table="${table.id}" data-seats="${table.seats}">
                <span class="table-number">M${table.id}</span>
                <span class="table-seats">${table.seats} lugares</span>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    tableMap.querySelectorAll('.table.available').forEach(tableEl => {
        tableEl.addEventListener('click', () => {
            tableMap.querySelectorAll('.table').forEach(t => t.classList.remove('selected'));
            tableEl.classList.add('selected');
            reservationState.table = parseInt(tableEl.dataset.table);
            updateSummary();
            step2Next.disabled = false;
        });
    });
}

// ============================================
// OCCASION SELECTOR
// ============================================
const occasionLabels = {
    aniversario: 'Aniversário',
    romantico: 'Encontro',
    negocios: 'Negócios',
    familia: 'Família',
    outro: 'Outro'
};

if (occasionOptions) {
    occasionOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.occasion-option');
        if (!option) return;
        
        occasionOptions.querySelectorAll('.occasion-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        reservationState.occasion = option.dataset.occasion;
        updateSummary();
    });
}

// ============================================
// FORM VALIDATION
// ============================================
function validatePhone(phone) {
    const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return regex.test(phone.replace(/\s/g, ''));
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

if (inputName) {
    inputName.addEventListener('input', (e) => {
        reservationState.name = e.target.value;
        e.target.classList.remove('error');
        document.getElementById('nameError').textContent = '';
    });
}

if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
        reservationState.phone = e.target.value;
        e.target.classList.remove('error');
        document.getElementById('phoneError').textContent = '';
    });
}

if (inputEmail) {
    inputEmail.addEventListener('input', (e) => {
        reservationState.email = e.target.value;
    });
}

if (inputNotes) {
    inputNotes.addEventListener('input', (e) => {
        reservationState.notes = e.target.value;
    });
}

// Preferences
document.querySelectorAll('.preference-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const value = e.target.value;
        if (e.target.checked) {
            reservationState.preferences.push(value);
        } else {
            reservationState.preferences = reservationState.preferences.filter(p => p !== value);
        }
    });
});

// ============================================
// STEP NAVIGATION
// ============================================
function goToStep(step) {
    reservationState.step = step;
    
    // Update sections
    formSections.forEach(section => {
        section.classList.toggle('active', parseInt(section.dataset.section) === step);
    });
    
    // Update steps indicator
    formSteps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        stepEl.classList.remove('active', 'completed');
        
        if (stepNum === step) {
            stepEl.classList.add('active');
        } else if (stepNum < step) {
            stepEl.classList.add('completed');
        }
    });
    
    // Scroll to top of form
    document.querySelector('.reservas-form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (step1Next) {
    step1Next.addEventListener('click', () => {
        renderTableMap();
        goToStep(2);
    });
}

if (step2Prev) {
    step2Prev.addEventListener('click', () => goToStep(1));
}

if (step2Next) {
    step2Next.addEventListener('click', () => goToStep(3));
}

if (step3Prev) {
    step3Prev.addEventListener('click', () => goToStep(2));
}

// ============================================
// SUMMARY UPDATE
// ============================================
function updateSummary() {
    if (reservationState.date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        summaryDate.textContent = reservationState.date.toLocaleDateString('pt-PT', options);
        summaryDate.classList.remove('empty');
    }
    
    if (reservationState.time) {
        summaryTime.textContent = reservationState.time;
        summaryTime.classList.remove('empty');
    }
    
    if (reservationState.guests) {
        const guests = parseInt(reservationState.guests);
        summaryGuests.textContent = guests === 1 ? '1 pessoa' : `${guests} pessoas`;
        summaryGuests.classList.remove('empty');
    }
    
    if (reservationState.table) {
        summaryTable.textContent = `Mesa M${reservationState.table}`;
        summaryTable.classList.remove('empty');
    }
    
    if (reservationState.occasion) {
        summaryOccasion.textContent = occasionLabels[reservationState.occasion];
        summaryOccasion.classList.remove('empty');
    }
}

// ============================================
// FORM SUBMISSION
// ============================================
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate
        let hasError = false;
        
        if (!reservationState.name.trim()) {
            inputName.classList.add('error');
            document.getElementById('nameError').textContent = 'Por favor, insira seu nome';
            hasError = true;
        }
        
        if (!reservationState.phone.trim() || !validatePhone(reservationState.phone)) {
            inputPhone.classList.add('error');
            document.getElementById('phoneError').textContent = 'Por favor, insira um telefone válido';
            hasError = true;
        }
        
        if (hasError) return;
        
        // Show success modal
        showSuccessModal();
    });
}

function showSuccessModal() {
    const dateStr = reservationState.date.toLocaleDateString('pt-PT', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
    
    successDetails.innerHTML = `
        <div class="success-detail">
            <span>Data</span>
            <span>${dateStr}</span>
        </div>
        <div class="success-detail">
            <span>Hora</span>
            <span>${reservationState.time}</span>
        </div>
        <div class="success-detail">
            <span>Pessoas</span>
            <span>${reservationState.guests}</span>
        </div>
        <div class="success-detail">
            <span>Mesa</span>
            <span>M${reservationState.table}</span>
        </div>
    `;
    
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Prepare WhatsApp message
    const successBtn = successModal.querySelector('.success-btn');
    const preferencesStr = reservationState.preferences.length > 0 
        ? `\nPreferências: ${reservationState.preferences.join(', ')}` 
        : '';
    const occasionStr = reservationState.occasion 
        ? `\nOcasião: ${occasionLabels[reservationState.occasion]}` 
        : '';
    const notesStr = reservationState.notes 
        ? `\nObservações: ${reservationState.notes}` 
        : '';
    
    const message = `*Nova Reserva - MIDO Restaurante*%0A%0A` +
        `*Nome:* ${reservationState.name}%0A` +
        `*Data:* ${dateStr}%0A` +
        `*Hora:* ${reservationState.time}%0A` +
        `*Pessoas:* ${reservationState.guests}%0A` +
        `*Mesa:* M${reservationState.table}%0A` +
        `*Telefone:* ${reservationState.phone}%0A` +
        occasionStr +
        preferencesStr +
        notesStr;
    
    successBtn.href = `https://wa.me/+258879228812?text=${message}`;
}

// Close success modal on backdrop click
if (successModal) {
    successModal.querySelector('.success-modal-backdrop').addEventListener('click', () => {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// ============================================
// INITIALIZE
// ============================================
if (datePickerGrid) {
    renderCalendar();
    renderTableMap();
    checkStep1Complete();
}
// FORÇAR TODOS OS LINKS DO WHATSAPP
const FORCE_WHATSAPP_NUMBER = "258879228812";

// Função para corrigir links existentes
function forceWhatsAppLinks() {
    const links = document.querySelectorAll('a[href*="wa.me"]');

    links.forEach(link => {
        const url = new URL(link.href);

        // mantém a mensagem (?text=...)
        const text = url.searchParams.get("text");

        // recria o link com o número correto
        link.href = `https://wa.me/${FORCE_WHATSAPP_NUMBER}` + (text ? `?text=${text}` : '');
    });
}

// Executar ao carregar a página
document.addEventListener("DOMContentLoaded", forceWhatsAppLinks);
