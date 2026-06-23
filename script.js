const GENRE_MAP = {
  funny: [35],
  emotional: [18, 10749],
  intense: [53, 80, 9648],
  chill: [10749, 35, 10764],
  horror: [27, 9648],
  mindless: [35, 10770]
};

const ERA_MAP = {
  classic: { gte: '1900-01-01', lte: '1999-12-31' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31' },
  recent: { gte: '2020-01-01', lte: '2026-12-31' },
  any: { gte: '1900-01-01', lte: '2026-12-31' }
};

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
  btn.addEventListener('click', async () => {
    userSelection.era = btn.dataset.era;
    const movies = await fetchMovies();
    displayMovies(movies);
    showStep('results');
  });
});

async function fetchMovies() {
  const genres = GENRE_MAP[userSelection.mood].join(',');
  const era = ERA_MAP[userSelection.era];
  const language = userSelection.language === 'any' ? '' : `&with_original_language=${userSelection.language}`;
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';

  const url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}&with_genres=${genres}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}&sort_by=vote_average.desc&vote_count.gte=100${language}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results.slice(0, 3);
}

function displayMovies(movies) {
  const container = document.querySelector('.results-container');
  container.innerHTML = '';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}" />
      <h2>${movie.title || movie.name}</h2>
      <p>${movie.vote_average.toFixed(1)} ⭐</p>
    `;
    container.appendChild(card);
  });
}