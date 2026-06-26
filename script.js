const GENRE_MAP = {
  funny: [35, 10770, 10762],
  emotional: [99, 18, 10749, 10751],
  intense: [28, 12, 80, 53, 10752, 10759, 9648, 10768, 878],
  chill: [16, 14, 10766, 10767, 10749, 10751],
  horror: [27, 9648]
};

const GENRE_NAMES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
  10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
  10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

const ERA_MAP = {
  classic: { gte: '1900-01-01', lte: '1999-12-31' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31' },
  recent: { gte: '2020-01-01', lte: '2026-12-31' },
  any: { gte: '1900-01-01', lte: '2026-12-31' }
};

const PLATFORM_COLORS = {
  'Netflix': { bg: '#141414', text: '#ffffff', border: '#e50914' },
  'Prime': { bg: '#0f172a', text: '#f5f5f7', border: '#00a8e1' },
  'Jio+Hotstar': { bg: '#0c111b', text: '#ffffff', border: '#1f80e0' },
  'Zee5': { bg: '#0f0617', text: '#ffffff', border: '#82308e' },
  'SonyLIV': { bg: '#161616', text: '#ffffff', border: '#d1a153' }
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
  document.getElementById('progress-bar').style.display = stepId === 'results' ? 'none' : 'flex';
}

document.querySelectorAll('.mood-btn[data-mood]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.mood = btn.dataset.mood;
    showStep('step-2');
    updateProgress(1);
  });
});

document.querySelectorAll('.mood-btn[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.type = btn.dataset.type;
    showStep('step-3');
    updateProgress(2);
  });
});

document.querySelectorAll('.mood-btn[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    userSelection.language = btn.dataset.lang;
    showStep('step-4');
    updateProgress(3);
  });
});

document.querySelectorAll('.mood-btn[data-era]').forEach(btn => {
  btn.addEventListener('click', async () => {
    userSelection.era = btn.dataset.era;
    const movies = await fetchMovies();
    displayMovies(movies);
    showStep('results');
    updateProgress(4);
  });
});

async function fetchMovies() {
  const genres = GENRE_MAP[userSelection.mood].join('|');
  const era = ERA_MAP[userSelection.era];
  const language = userSelection.language === 'any' ? '' : `&with_original_language=${userSelection.language}`;
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';

  const providerList = ['8', '119', '122', '232', '237'];
  const shuffledProviders = [...providerList].sort(() => Math.random() - 0.5);
  const fallbackProviders = '8|119|122|232|237';

  const page = Math.floor(Math.random() * 3) + 1;
  const sortMethods = ['popularity.desc', 'vote_average.desc', 'revenue.desc', 'release_date.desc'];
  const sort1 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  let sort2 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  while (sort2 === sort1) sort2 = sortMethods[Math.floor(Math.random() * sortMethods.length)];

  function buildUrl(providers, sortBy, extra = '') {
    return `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}&with_genres=${genres}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}${language}&watch_region=IN&with_watch_providers=${providers}&sort_by=${sortBy}&page=${page}${extra}`;
  }

  const [d1, d2, d3] = await Promise.all([
    fetch(buildUrl(shuffledProviders[0], 'vote_average.desc', '&vote_average.gte=7&vote_count.gte=50&vote_count.lte=10000&popularity.lte=100')).then(r => r.json()),
    fetch(buildUrl(shuffledProviders[1], sort1)).then(r => r.json()),
    fetch(buildUrl(shuffledProviders[2], sort2)).then(r => r.json()),
  ]);

  async function getFallback(sortBy, extra = '') {
    const res = await fetch(buildUrl(fallbackProviders, sortBy, extra));
    return res.json();
  }

  const underratedRaw = d1.results?.length ? d1 : await getFallback('vote_average.desc', '&vote_average.gte=7&vote_count.gte=50&vote_count.lte=10000&popularity.lte=100');
  const popular1Raw = d2.results?.length ? d2 : await getFallback(sort1);
  const popular2Raw = d3.results?.length ? d3 : await getFallback(sort2);

  const underrated = underratedRaw.results?.sort(() => Math.random() - 0.5)[0];
  const popular1 = popular1Raw.results?.sort(() => Math.random() - 0.5)[0];
  const popular2 = popular2Raw.results?.sort(() => Math.random() - 0.5)[0];

  const seen = new Set();
  const results = [underrated, popular1, popular2].filter(movie => {
    if (!movie || seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });

  if (results.length < 3) {
    const extraData = await getFallback(sort1);
    const extras = extraData.results?.sort(() => Math.random() - 0.5) || [];
    for (const movie of extras) {
      if (results.length >= 3) break;
      if (!seen.has(movie.id)) {
        seen.add(movie.id);
        results.push(movie);
      }
    }
  }

  return results;
}

async function displayMovies(movies) {
  const container = document.querySelector('.results-container');
  container.innerHTML = '<p class="loading-text">Curating your watchlist...</p>';
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';

  const cards = [];

  for (const movie of movies) {
    const platform = await getStreamingPlatform(movie.id, mediaType);
    const colors = PLATFORM_COLORS[platform] || PLATFORM_COLORS['Netflix'];

    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.style.backgroundColor = colors.bg;
    card.style.borderColor = colors.border;
    card.style.color = colors.text;

    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}" />
      <div class="card-info">
        <h2>${movie.title || movie.name}</h2>
        <p class="card-genre">${movie.genre_ids.slice(0,2).map(id => GENRE_NAMES[id] || '').join(', ')}</p>
        <p class="card-rating">${movie.vote_average.toFixed(1)} ⭐</p>
        <span class="platform-badge">${platform}</span>
      </div>
    `;

    card.addEventListener('click', () => openMoviePage(movie, platform, colors, mediaType));
    cards.push(card);
  }

  await new Promise(resolve => setTimeout(resolve, 800));
  container.innerHTML = '';
  cards.forEach(card => container.appendChild(card));
  document.getElementById('retry-section').classList.remove('hidden');
}

async function getStreamingPlatform(movieId, mediaType) {
  const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${movieId}/watch/providers?api_key=${API_KEY}`);
  const data = await res.json();
  const india = data.results?.IN;
  if (!india) return 'Prime';
  const available = india.flatrate || india.buy || india.rent || [];
  if (available.length === 0) return 'Prime';
  const name = available[0].provider_name;
  if (name.includes('Netflix')) return 'Netflix';
  if (name.includes('Prime')) return 'Prime';
  if (name.includes('Hotstar') || name.includes('Disney') || name.includes('Jio')) return 'Jio+Hotstar';
  if (name.includes('Zee5') || name.includes('ZEE5')) return 'Zee5';
  if (name.includes('Sony')) return 'SonyLIV';
  return 'Prime';
}

document.querySelector('.retry-btn').addEventListener('click', async () => {
  document.getElementById('retry-section').classList.add('hidden');
  const movies = await fetchMovies();
  displayMovies(movies);
});

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showStep(btn.dataset.target);
  });
});