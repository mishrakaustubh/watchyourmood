const GENRE_MAP = {
  funny: [35, 14, 10770, 10762],
  emotional: [99, 18, 10749, 10751],
  intense: [28, 12, 80, 53, 10752, 10759, 9648, 10768, 878],
  chill: [16, 14, 10766, 10767, 10749, 10751],
  horror: [27, 9648]
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
  const genres = GENRE_MAP[userSelection.mood].join('|');
  const era = ERA_MAP[userSelection.era];
  const language = userSelection.language === 'any' ? '' : `&with_original_language=${userSelection.language}`;
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';

  const sortMethods = ['popularity.desc', 'vote_average.desc', 'revenue.desc', 'release_date.desc'];

  const sort1 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  let sort2 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  while (sort2 === sort1) {
    sort2 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  }

  const baseParams = `api_key=${API_KEY}&with_genres=${genres}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}${language}`;

  const underratedUrl = `https://api.themoviedb.org/3/discover/${mediaType}?${baseParams}&vote_average.gte=7&vote_count.gte=50&vote_count.lte=10000&popularity.lte=100&sort_by=vote_average.desc`;
  const popularUrl1 = `https://api.themoviedb.org/3/discover/${mediaType}?${baseParams}&sort_by=${sort1}`;
  const popularUrl2 = `https://api.themoviedb.org/3/discover/${mediaType}?${baseParams}&sort_by=${sort2}`;

  const [underratedData, popularData1, popularData2] = await Promise.all([
    fetch(underratedUrl).then(r => r.json()),
    fetch(popularUrl1).then(r => r.json()),
    fetch(popularUrl2).then(r => r.json())
  ]);

  console.log('underrated:', underratedData.results?.length);
  console.log('popular1:', popularData1.results?.length);
  console.log('popular2:', popularData2.results?.length);

  const underrated = underratedData.results?.sort(() => Math.random() - 0.5)[0];
  const popular1 = popularData1.results?.sort(() => Math.random() - 0.5)[0];
  const popular2 = popularData2.results?.sort(() => Math.random() - 0.5)[0];

  return [underrated, popular1, popular2].filter(Boolean);
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