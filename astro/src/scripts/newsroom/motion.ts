export {};

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const cards = document.querySelectorAll('.newsroom-shell .come-out-animation');
const cardObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) entry.target.toggleAttribute('data-come-out-animation', entry.isIntersecting);
});

function updateCardMotion() {
  cardObserver.disconnect();
  for (const card of cards) {
    card.removeAttribute('data-come-out-animation');
    if (!motionPreference.matches) cardObserver.observe(card);
  }
}

updateCardMotion();
motionPreference.addEventListener('change', updateCardMotion);
