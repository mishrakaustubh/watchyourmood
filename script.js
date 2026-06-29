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
  animeMode: false
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
    : GENRE_MAP[userSelection.mood].join('|');

  const keywords = userSelection.animeMode ? '&with_keywords=210024' : '';
  const castFilter = userSelection.starMode ? `&with_cast=${userSelection.actorId}` : '';
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
    return `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${API_KEY}&with_genres=${genres}&primary_release_date.gte=${era.gte}&primary_release_date.lte=${era.lte}${language}${providerFilter}&sort_by=${sortBy}&page=${page}${keywords}${castFilter}${extra}`;
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

  } catch(err) {
    document.querySelector('#results h1').textContent = 'Something went wrong, try again!';
    document.querySelector('.results-container').innerHTML = '';
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
  <img 
    src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
    alt="${movie.title || movie.name}"
    loading="lazy"
    style="opacity:0; transition: opacity 0.4s ease;"
    onload="this.style.opacity='1'"
  />
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
  if (name.includes('Hotstar') || name.includes('Disney') || name.includes('Jio')) return 'JioHotstar';
  if (name.includes('Zee5') || name.includes('ZEE5')) return 'Zee5';
  if (name.includes('Sony')) return 'SonyLIV';
  return 'Prime';
}

document.querySelector('.retry-btn').addEventListener('click', async () => {
  if (!userSelection.starMode) {
    const moods = ['funny', 'emotional', 'intense', 'chill', 'horror'];
    const eras = ['classic', '2000s', '2010s', 'recent', 'any'];
    if (!userSelection.mood) {
      userSelection.mood = moods[Math.floor(Math.random() * moods.length)];
      userSelection.era = eras[Math.floor(Math.random() * eras.length)];
    }
  }

  document.getElementById('retry-section').classList.add('hidden');
  document.querySelector('#results h1').textContent = 'Searching the best...';
  document.querySelector('.results-container').innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;
  const movies = await fetchMovies();
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

  const cast = creditsData.cast?.slice(0, 6) || [];
  document.getElementById('movie-cast').innerHTML = cast.map(actor =>
    `<span class="cast-badge" style="border-color:${colors.border}">${actor.name}</span>`
  ).join('');

  const trailer = videosData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
const imagesRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${movie.id}/images?api_key=${API_KEY}`);
const imagesData = await imagesRes.json();
const backdrops = imagesData.backdrops?.slice(0, 9) || [];

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
  const moods = ['funny', 'emotional', 'intense', 'chill', 'horror'];
  const types = ['movie', 'series', 'any'];
  const languages = ['en', 'hi', 'te', 'ta', 'kn', 'ko', 'any'];
  const eras = ['classic', '2000s', '2010s', 'recent', 'any'];

  userSelection.mood = moods[Math.floor(Math.random() * moods.length)];
  userSelection.type = types[Math.floor(Math.random() * types.length)];
  userSelection.language = languages[Math.floor(Math.random() * languages.length)];
  userSelection.era = eras[Math.floor(Math.random() * eras.length)];

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

    if (!data.results?.length) {
      dropdown.classList.add('hidden');
      return;
    }

    dropdown.innerHTML = data.results.slice(0, 6).map(actor => `
      <div class="dropdown-item" data-id="${actor.id}" data-name="${actor.name}">
        ${actor.name}
      </div>
    `).join('');

    dropdown.classList.remove('hidden');

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        userSelection.actorId = item.dataset.id;
        userSelection.actorName = item.dataset.name;
        document.getElementById('star-name').textContent = item.dataset.name;
        document.getElementById('search-input-field').value = item.dataset.name;
        dropdown.classList.add('hidden');
        showStep('step-star');
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
