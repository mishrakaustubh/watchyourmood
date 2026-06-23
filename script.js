const userSelection = {
  mood: null,
  type: null,
  language: null,
  era: null
};

function showStep(stepId) {
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  document.getElementById(stepId).classList.remove('hidden');
}

document.querySelectorAll('.mood-btn[data-mood]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.mood = btn.dataset.mood;
    showStep('step-2');
  });
});

document.querySelectorAll('.mood-btn[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.type = btn.dataset.type;
    showStep('step-3');
  });
});

document.querySelectorAll('.mood-btn[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.language = btn.dataset.lang;
    showStep('step-4');
  });
});

document.querySelectorAll('.mood-btn[data-era]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.era = btn.dataset.era;
    console.log('User selected:', userSelection);
    showStep('results');
  });
});