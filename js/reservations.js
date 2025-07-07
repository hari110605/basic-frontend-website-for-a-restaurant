// ===============================================================================
//                    RESERVATIONS MODULE
// ===============================================================================

// Show reservation modal
function showReservationModal() {
  if (!api.isAuthenticated()) {
    showNotification('Please login to make a reservation', 'warning');
    showLoginModal();
    return;
  }
  
  const modal = document.getElementById('reservationModal');
  if (modal) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('reservationDate');
    if (dateInput) {
      dateInput.min = today;
    }
    
    modal.style.display = 'block';
  }
}

// Hide reservation modal
function hideReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (modal) {
    modal.style.display = 'none';
    clearReservationForm();
  }
}

// Clear reservation form
function clearReservationForm() {
  const form = document.getElementById('reservationForm');
  if (form) form.reset();
}

// Handle reservation form submission
async function handleReservation(event) {
  event.preventDefault();
  
  const form = event.target;
  const reservationData = {
    reservation_date: form.reservation_date.value,
    reservation_time: form.reservation_time.value,
    party_size: parseInt(form.party_size.value),
    special_requests: form.special_requests.value || ''
  };
  
  // Validate date is not in the past
  const reservationDateTime = new Date(`${reservationData.reservation_date}T${reservationData.reservation_time}`);
  const now = new Date();
  
  if (reservationDateTime <= now) {
    showNotification('Please select a future date and time', 'error');
    return;
  }
  
  try {
    const reservation = await api.createReservation(reservationData);
    
    hideReservationModal();
    showNotification('Reservation created successfully!', 'success');
    
    // Show confirmation details
    showReservationConfirmation(reservation);
    
  } catch (error) {
    console.error('Reservation failed:', error);
    showNotification(error.message || 'Failed to create reservation', 'error');
  }
}

// Show reservation confirmation
function showReservationConfirmation(reservation) {
  const confirmationHtml = `
    <div class="reservation-confirmation">
      <h3>Reservation Confirmed!</h3>
      <p><strong>Date:</strong> ${formatDate(reservation.reservation_date)}</p>
      <p><strong>Time:</strong> ${reservation.reservation_time}</p>
      <p><strong>Party Size:</strong> ${reservation.party_size} people</p>
      <p><strong>Status:</strong> ${reservation.status}</p>
      ${reservation.special_requests ? `<p><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
      <p class="confirmation-note">You will receive a confirmation email shortly. Please arrive 15 minutes before your reservation time.</p>
    </div>
  `;
  
  // Create and show confirmation modal
  const confirmationModal = document.createElement('div');
  confirmationModal.className = 'modal';
  confirmationModal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
      ${confirmationHtml}
      <button class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
    </div>
  `;
  
  document.body.appendChild(confirmationModal);
  confirmationModal.style.display = 'block';
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (confirmationModal.parentNode) {
      confirmationModal.remove();
    }
  }, 10000);
}

// Load user reservations for dashboard
async function loadUserReservations() {
  try {
    const reservations = await api.getUserReservations();
    return reservations;
  } catch (error) {
    console.error('Failed to load reservations:', error);
    throw error;
  }
}

// Format reservation status for display
function formatReservationStatus(status) {
  const statusMap = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    seated: 'Seated',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show'
  };
  return statusMap[status] || status;
}

// Get reservation status color
function getReservationStatusColor(status) {
  const colors = {
    pending: '#ffa500',
    confirmed: '#28a745',
    seated: '#007bff',
    completed: '#6c757d',
    cancelled: '#dc3545',
    no_show: '#dc3545'
  };
  return colors[status] || '#6c757d';
}

// Render reservations list
function renderReservationsList(reservations, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (reservations.length === 0) {
    container.innerHTML = '<p class="no-data">No reservations found.</p>';
    return;
  }
  
  container.innerHTML = reservations.map(reservation => `
    <div class="reservation-item">
      <div class="reservation-header">
        <h4>${formatDate(reservation.reservation_date)} at ${reservation.reservation_time}</h4>
        <span class="status-badge" style="background-color: ${getReservationStatusColor(reservation.status)}">
          ${formatReservationStatus(reservation.status)}
        </span>
      </div>
      <div class="reservation-details">
        <p><strong>Party Size:</strong> ${reservation.party_size} people</p>
        ${reservation.table_number ? `<p><strong>Table:</strong> ${reservation.table_number}</p>` : ''}
        ${reservation.special_requests ? `<p><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
        <p><strong>Created:</strong> ${formatDateTime(reservation.created_at)}</p>
      </div>
    </div>
  `).join('');
}

// Initialize reservation form handler
document.addEventListener('DOMContentLoaded', () => {
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    reservationForm.addEventListener('submit', handleReservation);
  }
});
