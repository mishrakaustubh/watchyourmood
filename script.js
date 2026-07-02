document.querySelector('#step-1 h1').textContent = getGreeting();

const GENRE_MAP = {
  funny: [35, 10770, 10762],
  emotional: [99, 18, 10749, 10751],
  intense: [28, 12, 80, 53, 10752, 10759, 9648, 10768, 878],
  chill: [16, 14, 10765, 10767, 10749, 10751],
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
  'Netflix': { bg: 'linear-gradient(160deg, #1a1a1a 40%, #e50914 100%)', text: '#ffffff', border: '#e50914' },
  'Prime': { bg: 'linear-gradient(135deg, #003580 0%, #00a8e0 100%)', text: '#ffffff', border: '#00a8e0' },
  'JioHotstar': { bg: 'linear-gradient(135deg, #0033cc 0%, #e20074 100%)', text: '#ffffff', border: '#e20074' },
  'Zee5': { bg: 'linear-gradient(135deg, #3b0072 0%, #6b21a8 100%)', text: '#e9d5ff', border: '#a855f7' },
  'SonyLIV': { bg: 'linear-gradient(135deg, #1a0000 0%, #8b2500 100%)', text: '#ff8c42', border: '#e85d04' }
};

const userSelection = {
  mood: null,
  type: null,
  language: null,
  era: null,
  actorId: null,
  actorName: null,
  starMode: false,
  animeMode: false,
  selectPlatform: 'all' ,
  searchType: 'actor'
};

function showStep(stepId) {
  document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
  document.getElementById(stepId).classList.remove('hidden');
  document.getElementById('results-back-btn').style.display = stepId === 'results' ? 'block' : 'none';
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
    showStep('results');
    document.querySelector('#results h1').textContent = 'Searching the best...';
document.querySelector('.results-container').innerHTML = `
  <div class="skeleton-card"></div>
  <div class="skeleton-card"></div>
  <div class="skeleton-card"></div>
`;
    const movies = await fetchMovies();
    displayMovies(movies);
  });
});

async function fetchMovies() {
  const genres = userSelection.animeMode 
  ? '16' 
  : userSelection.starMode 
    ? (userSelection.mood && userSelection.mood !== 'any' ? GENRE_MAP[userSelection.mood].join('|') : '')
    : GENRE_MAP[userSelection.mood].join('|');

  const keywords = userSelection.animeMode ? '&with_keywords=210024' : '';
  const castFilter = userSelection.starMode 
  ? userSelection.searchType === 'director'
    ? `&with_crew=${userSelection.actorId}`
    : `&with_people=${userSelection.actorId}`
  : '';
  const era = ERA_MAP[userSelection.era];
  const language = userSelection.language === 'any' ? '' : `&with_original_language=${userSelection.language}`;
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';

const fallbackProviders = '8|119|122|232|237';

const shuffledProviders = userSelection.starMode 
  ? [fallbackProviders, fallbackProviders, fallbackProviders]
  : [...['8', '119', '122', '232', '237']].sort(() => Math.random() - 0.5);

  const page = Math.floor(Math.random() * 3) + 1;
  const sortMethods = ['popularity.desc', 'vote_average.desc', 'revenue.desc', 'release_date.desc'];
  const sort1 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  let sort2 = sortMethods[Math.floor(Math.random() * sortMethods.length)];
  while (sort2 === sort1) sort2 = sortMethods[Math.floor(Math.random() * sortMethods.length)];

  function buildUrl(providers, sortBy, extra = '') {
  const providerFilter = userSelection.starMode ? '' : `&watch_region=IN&with_watch_providers=${providers}`;
  const genreFilter = genres ? `&with_genres=${genres}` : '';
  return `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}${genreFilter}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}${language}${providerFilter}&sort_by=${sortBy}&page=${page}${keywords}${castFilter}${extra}`;
}

  async function getFallback(sortBy, extra = '') {
    const res = await fetch(buildUrl(fallbackProviders, sortBy, extra));
    return res.json();
  }

  try {
    const [d1, d2, d3] = await Promise.all([
      fetch(buildUrl(shuffledProviders[0], 'vote_average.desc', '&vote_average.gte=7&vote_count.gte=50&vote_count.lte=10000&popularity.lte=100')).then(r => r.json()),
      fetch(buildUrl(shuffledProviders[1], sort1)).then(r => r.json()),
      fetch(buildUrl(shuffledProviders[2], sort2)).then(r => r.json()),
    ]);

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
  // Fallback 1: actor only, no genre, no provider filter
  const fallback1Url = userSelection.starMode
    ? `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}&with_people=${userSelection.actorId}&sort_by=popularity.desc&page=1`
    : buildUrl(fallbackProviders, sort1);

  const fallback1Data = await fetch(fallback1Url).then(r => r.json());
  const fallback1Results = fallback1Data.results?.sort(() => Math.random() - 0.5) || [];

  for (const movie of fallback1Results) {
    if (results.length >= 3) break;
    if (!seen.has(movie.id)) {
      seen.add(movie.id);
      results.push(movie);
    }
  }
}

if (results.length < 3 && userSelection.starMode) {
  // Fallback 2: try tv instead of movie or vice versa
  const altMediaType = mediaType === 'movie' ? 'tv' : 'movie';
  const fallback2Url = `https://api.themoviedb.org/3/discover/${altMediaType}?api_key=${API_KEY}&with_people=${userSelection.actorId}&sort_by=popularity.desc&page=1`;

  const fallback2Data = await fetch(fallback2Url).then(r => r.json());
  const fallback2Results = fallback2Data.results?.sort(() => Math.random() - 0.5) || [];

  for (const movie of fallback2Results) {
    if (results.length >= 3) break;
    if (!seen.has(movie.id)) {
      seen.add(movie.id);
      results.push(movie);
    }
  }
}

if (results.length < 3 && userSelection.starMode) {
  // Fallback 3: use person credits endpoint directly
  const fallback3Url = `https://api.themoviedb.org/3/person/${userSelection.actorId}/combined_credits?api_key=${API_KEY}`;
  const fallback3Data = await fetch(fallback3Url).then(r => r.json());
  const credits = [...(fallback3Data.cast || [])].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  for (const movie of credits) {
    if (results.length >= 3) break;
    if (!seen.has(movie.id) && movie.poster_path) {
      seen.add(movie.id);
      results.push(movie);
    }
  }
}
    return results;

  } catch(err) {
  document.querySelector('#results h1').textContent = 'Something went wrong';
  document.querySelector('.results-container').innerHTML = `
    <p style="font-family:'Segoe UI', sans-serif; opacity:0.7; text-align:center; letter-spacing:1px;">
      We couldn't fetch movies right now. Check your connection and try again.
    </p>
  `;
  document.getElementById('retry-section').classList.remove('hidden');
  return [];
}
}

async function displayMovies(movies) {
  const container = document.querySelector('.results-container');
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';

  const cards = [];

  for (const movie of movies) {
    const platform = await getStreamingPlatform(movie.id, mediaType);
    const colors = PLATFORM_COLORS[platform] || PLATFORM_COLORS['Netflix'];

    const card = document.createElement('div');
    card.classList.add('movie-card');
    if (colors.bg.includes('gradient')) {
  card.style.background = colors.bg;
} else {
  card.style.backgroundColor = colors.bg;
}
    card.style.borderColor = colors.border;
    card.style.color = colors.text;
    card.style.setProperty('--glow-color', colors.border);

    card.innerHTML = `
  <div class="card-image-wrapper">
    <img 
      src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
      alt="${movie.title || movie.name}"
      loading="lazy"
      style="opacity:0; transition: opacity 0.4s ease;"
      onload="this.style.opacity='1'"
    />
    <div class="card-overlay">
      <span>See More</span>
    </div>
  </div>
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

  if (cards.length === 0) {
  document.querySelector('#results h1').textContent = 'No matches found';
  container.innerHTML = `
    <p style="font-family:'Segoe UI', sans-serif; opacity:0.7; text-align:center; letter-spacing:1px;">
      We couldn't find anything matching your picks. Try different options!
    </p>
  `;
  document.getElementById('retry-section').classList.remove('hidden');
  return;
}

  await new Promise(resolve => setTimeout(resolve, 800));
  container.innerHTML = '';
  document.querySelector('#results h1').textContent = "Here's what to watch";
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.4s ease ${index * 0.15}s, transform 0.4s ease ${index * 0.15}s`;
    container.appendChild(card);
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 50);
  });

  setTimeout(() => {
    document.getElementById('retry-section').classList.remove('hidden');
    document.getElementById('retry-section').style.animation = 'fadeInUp 0.4s ease forwards';
    document.getElementById('retry-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, cards.length * 150 + 400);
  document.getElementById('platform-filter').classList.remove('hidden');
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
  if (name.includes('Hotstar') || name.includes('Disney') || name.includes('Jio') || name.includes('JioCinema')) return 'JioHotstar';
  if (name.includes('Zee5') || name.includes('ZEE5')) return 'Zee5';
  if (name.includes('Sony')) return 'SonyLIV';
  return 'Prime';
}

document.querySelector('.retry-btn').addEventListener('click', async () => {
  if (userSelection.surpriseMode) {
    randomizeSelections();
  }

  document.getElementById('retry-section').classList.add('hidden');
  document.getElementById('platform-filter').classList.add('hidden');
  document.querySelector('#results h1').textContent = 'Searching the best...';
  document.querySelector('.results-container').innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  let movies;
  if (userSelection.selectedPlatform && userSelection.selectedPlatform !== 'all') {
    movies = await fetchMoviesForPlatform(userSelection.selectedPlatform);
  } else {
    movies = await fetchMovies();
  }

  displayMovies(movies);
});

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showStep(btn.dataset.target);
  });
});

async function openMoviePage(movie, platform, colors, mediaType) {
  const page = document.getElementById('movie-page');
  page.style.background = '';
page.style.backgroundColor = '';

if (colors.bg.includes('gradient')) {
  page.style.background = colors.bg;
} else {
  page.style.backgroundColor = colors.bg;
}
  page.style.color = colors.text;
  page.style.setProperty('--page-bg', colors.bg);

  document.getElementById('movie-poster').src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
  document.getElementById('movie-title').textContent = movie.title || movie.name;
  document.getElementById('movie-rating').textContent = `${movie.vote_average.toFixed(1)} ⭐ — ${platform}`;
  document.getElementById('movie-plot').textContent = movie.overview || 'No description available.';
  document.getElementById('movie-genres').textContent = movie.genre_ids.map(id => GENRE_NAMES[id] || '').filter(Boolean).join(' · ');

  if (movie.backdrop_path) {
    document.getElementById('movie-backdrop').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
  }

  document.getElementById('movie-cast').innerHTML = '';
  document.getElementById('movie-trailer').innerHTML = '';

  page.classList.remove('hidden');
  document.querySelector('.top-nav').style.display = 'none';
  document.querySelector('.divider').style.display = 'none';

  // Fetch cast and trailer
  const [creditsRes, videosRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/${mediaType}/${movie.id}/credits?api_key=${API_KEY}`),
    fetch(`https://api.themoviedb.org/3/${mediaType}/${movie.id}/videos?api_key=${API_KEY}`)
  ]);

  const creditsData = await creditsRes.json();
  const videosData = await videosRes.json();

  const cast = creditsData.cast?.slice(0, 8) || [];
  document.getElementById('movie-cast').innerHTML = cast.map(actor =>
    `<span class="cast-badge" style="border-color:${colors.border}">${actor.name}</span>`
  ).join('');

  const trailer = videosData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
const imagesRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${movie.id}/images?api_key=${API_KEY}`);
const imagesData = await imagesRes.json();
const backdrops = imagesData.backdrops?.slice(0, 10) || [];

let trailerHTML = '';
if (trailer) {
  trailerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>`;
} else {
  trailerHTML = `<p style="opacity:0.5; letter-spacing:2px; font-size:0.9rem;">NO TRAILER AVAILABLE</p>`;
}

let galleryHTML = '';
if (backdrops.length > 0) {
  galleryHTML = `
  <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:20px;">
    ${backdrops.map(img => `
      <img 
        src="https://image.tmdb.org/t/p/w500${img.file_path}"
        style="width:calc(50% - 5px); border-radius:8px; opacity:0; transition:opacity 0.4s ease; cursor:pointer;"
        onload="this.style.opacity='1'"
        onclick="openLightbox('https://image.tmdb.org/t/p/original${img.file_path}')"
      />
    `).join('')}
  </div>
`;
}

document.getElementById('movie-trailer').innerHTML = trailerHTML + galleryHTML;
}

document.getElementById('movie-back-btn').addEventListener('click', () => {
  document.getElementById('movie-page').classList.add('hidden');
  document.querySelector('.top-nav').style.display = 'flex';
  document.querySelector('.divider').style.display = 'block';
  showStep('results');
});

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
}

document.getElementById('surprise-icon').addEventListener('click', async () => {
  userSelection.surpriseMode = true;
  randomizeSelections();

  showStep('results');
  document.querySelector('#results h1').textContent = 'Searching the best...';
  document.querySelector('.results-container').innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  let movies = await fetchMovies();
  let attempts = 1;

  while (movies.length === 0 && attempts < 3) {
    randomizeSelections();
    movies = await fetchMovies();
    attempts++;
  }

  displayMovies(movies);
});

document.getElementById('anime-icon').addEventListener('click', () => {
  userSelection.language = 'ja';
  userSelection.type = 'any';
  userSelection.era = 'any';
  showStep('step-anime');
});

document.querySelectorAll('#step-anime .mood-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    userSelection.mood = btn.dataset.mood;
    userSelection.animeMode = true;
    showStep('results');
    document.querySelector('#results h1').textContent = 'Searching the best...';
    document.querySelector('.results-container').innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
    const movies = await fetchMovies();
    displayMovies(movies);
    userSelection.animeMode = false;
  });
});

document.getElementById('search-icon').addEventListener('click', () => {
  const searchBar = document.getElementById('search-bar');
  searchBar.classList.toggle('hidden');
  if (!searchBar.classList.contains('hidden')) {
    document.getElementById('search-input-field').focus();
  }
});

let searchTimeout;

document.getElementById('search-input-field').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  const dropdown = document.getElementById('search-dropdown');

  if (query.length < 2) {
    dropdown.classList.add('hidden');
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    let results = data.results || [];

    if (userSelection.searchType === 'director') {
      results = results.filter(p => p.known_for_department === 'Directing');
    }

    if (!results.length) {
      dropdown.innerHTML = `<div class="dropdown-item" style="cursor:default; opacity:0.6;">No ${userSelection.searchType} found</div>`;
      dropdown.classList.remove('hidden');
      return;
    }

    dropdown.innerHTML = results.slice(0, 6).map(person => `
      <div class="dropdown-item" data-id="${person.id}" data-name="${person.name}">
        ${person.name}
      </div>
    `).join('');

    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', async () => {
        userSelection.actorId = item.dataset.id;
        userSelection.actorName = item.dataset.name;
        userSelection.starMode = true;
        userSelection.mood = 'intense';
        userSelection.language = 'any';
        userSelection.type = 'any';
        userSelection.era = 'any';

        document.getElementById('search-input-field').value = item.dataset.name;
        dropdown.classList.add('hidden');
        showStep('results');
        document.querySelector('#results h1').textContent = 
          userSelection.searchType === 'director' 
            ? `Best of ${item.dataset.name}'s Direction` 
            : `Best of ${item.dataset.name}`;
        document.querySelector('.results-container').innerHTML = `
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        `;

        const movies = await fetchMovies();
        displayMovies(movies);
      });
    });

  }, 300);
});

document.querySelectorAll('.mood-btn[data-starmood]').forEach(btn => {
  btn.addEventListener('click', async () => {
    userSelection.mood = btn.dataset.starmood === 'any' ? null : btn.dataset.starmood;
    userSelection.language = 'any';
    userSelection.type = 'any';
    userSelection.era = 'any';
    userSelection.starMode = true;

    showStep('results');
    document.querySelector('#results h1').textContent = 'Searching the best...';
    document.querySelector('.results-container').innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
    const movies = await fetchMovies();
    displayMovies(movies);
  });
});

document.getElementById('results-back-btn').addEventListener('click', () => {
  userSelection.starMode = false;
  userSelection.animeMode = false;
  userSelection.surpriseMode = false;
  userSelection.mood = null;
  userSelection.type = null;
  userSelection.language = null;
  userSelection.era = null;
  userSelection.actorId = null;
  userSelection.actorName = null;
  document.getElementById('platform-filter').classList.add('hidden');
userSelection.selectedPlatform = 'all';
document.querySelectorAll('.platform-filter-btn').forEach(b => b.classList.remove('active'));
document.querySelector('.platform-filter-btn[data-platform="all"]').classList.add('active');
document.getElementById('platform-dropdown-toggle').textContent = 'Platform ▾';
  showStep('step-1');
});

if (!localStorage.getItem('hasSeenIntro')) {
  const hint = document.getElementById('icon-hint');
  hint.classList.remove('hidden');
  setTimeout(() => {
    hint.classList.add('fade-out');
  }, 3000);
  localStorage.setItem('hasSeenIntro', 'true');
}

function getGreeting() {
  const hour = new Date().getHours();
  
  const morning = ["Woke up early this morning?", "Coffee in hand, what's the vibe?", "Early bird needs a good watch?"];
  const afternoon = ["Not sleepy this afternoon?", "Lunch break, what's the vibe?", "Afternoon slump? Let's fix that."];
  const evening = ["Evening unwind time?", "What's tonight's vibe?", "Ready to relax this evening?"];
  const night = ["Late night, what's the vibe?", "Can't sleep? Let's find something good.", "Burning the midnight oil with a show?"];

  let options;
  if (hour >= 5 && hour < 12) options = morning;
  else if (hour >= 12 && hour < 17) options = afternoon;
  else if (hour >= 17 && hour < 21) options = evening;
  else options = night;

  return options[Math.floor(Math.random() * options.length)];
}

async function loadPosterBackground() {
  const [res1, res2, res3] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=1`),
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=2`),
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=3`)
  ]);
  const data1 = await res1.json();
  const data2 = await res2.json();
  const data3 = await res3.json();
  const seen = new Set();
const posters = [...(data1.results || []), ...(data2.results || []), ...(data3.results || [])]
  .filter(m => m.poster_path && !seen.has(m.id) && seen.add(m.id));

  const container = document.getElementById('poster-bg');
  const columnCount = 8;
  const columns = Array.from({ length: columnCount }, () => []);

  posters.forEach((movie, i) => {
    columns[i % columnCount].push(movie);
  });

  container.innerHTML = columns.map((col, i) => `
    <div class="poster-column ${i % 2 === 1 ? 'offset' : ''}">
      ${col.map(movie => `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" />`).join('')}
    </div>
  `).join('');
}

loadPosterBackground();

function randomizeSelections() {
  const moods = ['funny', 'emotional', 'intense', 'chill', 'horror'];
  const types = ['movie', 'series', 'any'];
  const languages = ['en', 'hi', 'te', 'ta', 'ko', 'any'];
  const eras = ['2000s', '2010s', 'recent', 'any'];

  userSelection.mood = moods[Math.floor(Math.random() * moods.length)];
  userSelection.type = types[Math.floor(Math.random() * types.length)];
  userSelection.language = languages[Math.floor(Math.random() * languages.length)];
  userSelection.era = eras[Math.floor(Math.random() * eras.length)];
}

document.getElementById('platform-dropdown-toggle').addEventListener('click', () => {
  document.getElementById('platform-dropdown-menu').classList.toggle('hidden');
});

document.querySelectorAll('.platform-filter-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.platform-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('platform-dropdown-menu').classList.add('hidden');
    document.getElementById('platform-dropdown-toggle').textContent = 
      btn.dataset.platform === 'all' ? 'Platform ▾' : `${btn.textContent.trim()} ▾`;

    userSelection.selectedPlatform = btn.dataset.platform;

    document.getElementById('retry-section').classList.add('hidden');
    document.getElementById('platform-filter').classList.add('hidden');
    document.querySelector('#results h1').textContent = 'Searching the best...';
    document.querySelector('.results-container').innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;

    let movies;
    if (btn.dataset.platform === 'all') {
      movies = await fetchMovies();
    } else {
      movies = await fetchMoviesForPlatform(btn.dataset.platform);
    }

    if (movies.length === 0) {
      const platformNames = {
        '8': 'Netflix', '119': 'Prime', '122': 'JioHotstar',
        '232': 'Zee5', '237': 'SonyLIV'
      };
      document.querySelector('#results h1').textContent = 'No results found';
      document.querySelector('.results-container').innerHTML = `
        <p style="font-family:'Segoe UI', sans-serif; opacity:0.7; text-align:center; letter-spacing:1px;">
          No results for this combination on ${platformNames[btn.dataset.platform]}. Try retry or pick another platform.
        </p>
      `;
      document.getElementById('retry-section').classList.remove('hidden');
      document.getElementById('platform-filter').classList.remove('hidden');
      return;
    }

    displayMovies(movies);
  });
});

async function fetchMoviesForPlatform(platformId) {
  const genres = userSelection.animeMode 
    ? '16' 
    : GENRE_MAP[userSelection.mood]?.join('|') || '';
  const era = ERA_MAP[userSelection.era];
  const language = userSelection.language === 'any' ? '' : `&with_original_language=${userSelection.language}`;
  const mediaType = userSelection.type === 'series' ? 'tv' : 'movie';
  const keywords = userSelection.animeMode ? '&with_keywords=210024' : '';
  const castFilter = userSelection.starMode ? `&with_people=${userSelection.actorId}` : '';
  const genreFilter = genres ? `&with_genres=${genres}` : '';

  const platformNames = {
    '8': 'Netflix', '119': 'Prime', '122': 'JioHotstar',
    '1154': 'JioHotstar', '232': 'Zee5', '237': 'SonyLIV'
  };

  const platformIds = platformId.split('|');
  const targetPlatformName = platformNames[platformIds[0]];

  let matched = [];
  let attempts = 0;
  const seen = new Set();

  // generate 5 unique random pages between 1-10
  const pages = [];
if (userSelection.starMode) {
  for (let i = 1; i <= 5; i++) pages.push(i);
} else {
  while (pages.length < 5) {
    const p = Math.floor(Math.random() * 10) + 1;
    if (!pages.includes(p)) pages.push(p);
  }
}

  for (const page of pages) {
    if (matched.length >= 3) break;

    const sortMethods = ['popularity.desc', 'vote_average.desc', 'revenue.desc', 'release_date.desc'];
const randomSort = sortMethods[Math.floor(Math.random() * sortMethods.length)];

const url = userSelection.starMode 
  ? `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}${genreFilter}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}${language}&sort_by=${randomSort}&page=${page}${keywords}${castFilter}`
  : `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}${genreFilter}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}${language}&sort_by=popularity.desc&page=${page}${keywords}${castFilter}`;
    
    const res = await fetch(url);
    const data = await res.json();
    const movies = (data.results || []).sort(() => Math.random() - 0.5);

    for (const movie of movies) {
      if (matched.length >= 3) break;
      if (seen.has(movie.id)) continue;
      seen.add(movie.id);
      const platform = await getStreamingPlatform(movie.id, mediaType);
      console.log(movie.title || movie.name, '→', platform);
      if (platform === targetPlatformName) {
        matched.push(movie);
      }
    }
    attempts++;
  }

  return matched.sort(() => Math.random() - 0.5);
}

document.getElementById('search-actor-btn').addEventListener('click', () => {
  userSelection.searchType = 'actor';
  document.getElementById('search-actor-btn').classList.add('active');
  document.getElementById('search-director-btn').classList.remove('active');
  document.getElementById('search-input-field').placeholder = 'Search by Actor...';
  document.getElementById('search-dropdown').classList.add('hidden');
  document.getElementById('search-input-field').value = '';
});

document.getElementById('search-director-btn').addEventListener('click', () => {
  userSelection.searchType = 'director';
  document.getElementById('search-director-btn').classList.add('active');
  document.getElementById('search-actor-btn').classList.remove('active');
  document.getElementById('search-input-field').placeholder = 'Search by Director...';
  document.getElementById('search-dropdown').classList.add('hidden');
  document.getElementById('search-input-field').value = '';
});