const slides = Array.from(document.querySelectorAll('.slide'));
const dotsWrap = document.getElementById('slideshow-dots');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    const dot = dotsWrap?.children[i];
    if (dot) dot.classList.toggle('active', i === index);
  });
  currentSlide = index;
}

if (slides.length && dotsWrap) {
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `View photo ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index));
    dotsWrap.appendChild(dot);
  });
  showSlide(0);
  setInterval(() => showSlide((currentSlide + 1) % slides.length), 4200);
}

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });
reveals.forEach((item) => observer.observe(item));

const GOOGLE_SHEET_WEB_APP_URL = '';

async function logToGoogleSheet(payload) {
  if (!GOOGLE_SHEET_WEB_APP_URL) return;
  try {
    await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('Google Sheet logging skipped:', error);
  }
}

const form = document.getElementById('rsvp-form');
const status = document.getElementById('form-status');
if (form && status) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Sending your RSVP...';
    status.className = 'form-status';
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const payload = {
      guestName: form.querySelector('#name').value.trim(),
      attendance: form.querySelector('#attendance').value,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok || data.success === 'true') {
        await logToGoogleSheet(payload);
        window.location.href = 'thanks.html';
      } else {
        throw new Error(data.message || 'Unable to send RSVP right now.');
      }
    } catch (error) {
      status.textContent = error.message.includes('Activation')
        ? 'Please activate the form from the email sent to Lufunokevin@gmail.com, then try again.'
        : 'We could not submit your RSVP just now. Please try again in a moment.';
      status.classList.add('error');
      submitButton.disabled = false;
    }
  });
}
