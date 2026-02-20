#!/usr/bin/env node

import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

const OUT_DIR = join(process.cwd(), 'public', 'data');
const OUT_FILE = join(OUT_DIR, 'dashboard.json');

const DEFAULT_WEATHER = {
  current: {
    temp_c: 18,
    humidity: 55,
    wind_kph: 12,
    weather_code: 0,
    weather_desc: 'Clear sky',
  },
  tomorrow: {
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    temp_max_c: 20,
    temp_min_c: 12,
    humidity_max: 60,
    humidity_min: 45,
    wind_kph: 15,
    weather_code: 0,
    weather_desc: 'Clear sky',
  },
};

const DEFAULT_METALS = {
  goldUSD: 2850.0,
  oilUSD: 79.0,
};

function getWeatherDesc(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return map[code] || 'Unknown';
}

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

// Timestamp for 14 days ago
const TWO_WEEKS_AGO = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;

async function fetchTopStories(query) {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=points>10,created_at_i>${TWO_WEEKS_AGO}&hitsPerPage=200`;
  const data = await fetchJSON(url);
  if (!data || !Array.isArray(data.hits)) return [];
  const validHits = data.hits.filter(hit => typeof hit.created_at_i === 'number');
  const sorted = validHits.sort((a, b) => b.created_at_i - a.created_at_i);
  return sorted.slice(0, 5).map(hit => ({
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    points: hit.points,
    comments: hit.num_comments,
    created_at: new Date(hit.created_at_i * 1000).toISOString(),
  }));
}

async function fetchRedditTop(subreddit, minScore = 50) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=100`;
  const data = await fetchJSON(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!data || !Array.isArray(data.data.children)) return [];
  const posts = data.data.children
    .map(child => child.data)
    .filter(post => !post.over_18 && post.score >= minScore && post.url && !post.url.startsWith('https://www.reddit.com/r/'));
  const sorted = posts.sort((a, b) => b.created_utc - a.created_utc);
  return sorted.slice(0, 5).map(post => ({
    title: post.title,
    url: post.url,
    points: post.score,
    comments: post.num_comments,
    created_at: new Date(post.created_utc * 1000).toISOString(),
  }));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const year = new Date().getFullYear();

  // Load previous data if available (for fallbacks)
  let previous = null;
  try {
    const raw = await readFile(OUT_FILE, 'utf-8');
    previous = JSON.parse(raw);
  } catch (_) {}

  const timezone = 'Asia/Amman';
  const lat = 32.55;
  const lon = 35.85;

  // Weather
  let weather = previous?.weather;
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max&timezone=${timezone}&forecast_days=2`;
    const data = await fetchJSON(weatherUrl);
    if (data) {
      const current = {
        temp_c: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind_kph: data.current.wind_speed_10m,
        weather_code: data.current.weather_code,
        weather_desc: getWeatherDesc(data.current.weather_code),
      };
      const day0 = data.daily;
      const tomorrow = {
        date: day0.time[1],
        temp_max_c: day0.temperature_2m_max[1],
        temp_min_c: day0.temperature_2m_min[1],
        humidity_max: day0.relative_humidity_2m_max[1],
        humidity_min: day0.relative_humidity_2m_min[1],
        wind_kph: day0.wind_speed_10m_max[1],
        weather_code: day0.weather_code[1],
        weather_desc: getWeatherDesc(day0.weather_code[1]),
      };
      weather = { current, tomorrow };
    } else {
      throw new Error('no weather data');
    }
  } catch (e) {
    console.error('Weather update failed, using previous/fallback:', e);
    if (!weather) weather = DEFAULT_WEATHER;
  }

  // Metals: fetch gold from MetalPriceAPI (requires METALPRICE_API_KEY), oil from fallback, exchange from floatrates
  let goldUSD = DEFAULT_METALS.goldUSD;
  let oilUSD = DEFAULT_METALS.oilUSD;
  let jodRate = 0.709; // fallback

  let exchangeRates = { JOD: 0.709 };
  try {
    const exchangeData = await fetchJSON('https://www.floatrates.com/daily/usd.json');
    if (exchangeData) {
      // floatrates uses lowercase keys like 'jod', 'eur', etc.
      ['jod', 'eur', 'gbp', 'sar'].forEach(cur => {
        if (exchangeData[cur] && exchangeData[cur].rate) {
          exchangeRates[cur.toUpperCase()] = +exchangeData[cur].rate.toFixed(4);
        }
      });
    } else {
      throw new Error('invalid exchange response');
    }
  } catch (e) {
    console.warn('Exchange API failed, using fallback rates:', e);
  }

  try {
    const apiKey = process.env.METALPRICE_API_KEY;
    if (!apiKey) throw new Error('METALPRICE_API_KEY not set');
    // Try orientation: base=XAU, currencies=USD (gives USD per troy ounce)
    let goldRes = await fetchJSON(`https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=XAU&currencies=USD`);
    if (goldRes?.rates?.USD) {
      goldUSD = +goldRes.rates.USD.toFixed(2);
    } else {
      // Fallback orientation: base=USD, currencies=XAU (gives XAU per USD)
      goldRes = await fetchJSON(`https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU`);
      if (goldRes?.rates?.XAU) {
        // Convert: 1 / XAU_rate = USD per XAU
        goldUSD = +(1 / goldRes.rates.XAU).toFixed(2);
      } else {
        throw new Error('invalid gold response from both query orientations');
      }
    }
  } catch (e) {
    console.warn('Gold API failed, using fallback value:', e);
    // keep default goldUSD
  }

  // Oil: no reliable free API; keep fallback and mark as estimated
  // We could also try other sources later, but for now static is fine.

  // Constants for gold conversion
  const OZ_TO_GRAM = 31.1035;
  // jodRate is fetched from exchange API; keep 0.709 as fallback already set above.

  // Prayer times: Sehar (Fajr) and Iftar (Maghrib) for Amman, Jordan
  let prayer = null;
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lat = 31.9539;
    const lon = 35.9106;
    const method = 2; // Al-Azhar
    const school = 1; // Hanafi
    const prayerRes = await fetchJSON(
      `https://api.aladhan.com/v1/timings/${today}?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}`
    );
    if (prayerRes?.data?.timings) {
      const t = prayerRes.data.timings;
      prayer = {
        fajr: t.Fajr,
        maghrib: t.Maghrib,
        date: prayerRes.data.date?.readable || today,
      };
    } else {
      throw new Error('missing timings');
    }
  } catch (e) {
    console.warn('Prayer API failed:', e);
  }

  // Events & Holidays: try Nager.Date API, fallback to static list for Jordan
  let events = [];
  try {
    const holidays = await fetchJSON(`https://date.nager.at/api/v3/PublicHolidays/${year}/JO`);
    if (Array.isArray(holidays) && holidays.length > 0) {
      events = holidays
        .filter(h => h.global || h.countries?.includes('JO'))
        .map(h => ({
          date: h.date,
          name: h.localName || h.name,
          type: 'Public Holiday',
          global: !!h.global,
        }));
    } else {
      throw new Error('empty holidays response');
    }
  } catch (e) {
    console.warn('Holidays API failed or empty; using fallback static list:', e);
    // Static fallback: major Jordanian holidays 2026 (verify dates each year)
    events = [
      { date: `${year}-01-01`, name: "New Year's Day", type: 'Public Holiday' },
      { date: `${year}-03-01`, name: 'Ramadan Start (estimated)', type: 'Religious' },
      { date: `${year}-03-31`, name: 'Eid al-Fitr (estimated)', type: 'Religious' },
      { date: `${year}-04-01`, name: 'Eid al-Fitr Holiday', type: 'Religious' },
      { date: `${year}-05-01`, name: 'Labour Day', type: 'Public Holiday' },
      { date: `${year}-06-06`, name: 'Eid al-Adha (estimated)', type: 'Religious' },
      { date: `${year}-06-07`, name: 'Eid al-Adha Holiday', type: 'Religious' },
      { date: `${year}-06-08`, name: 'Eid al-Adha Holiday', type: 'Religious' },
      { date: `${year}-08-25`, name: 'Islamic New Year', type: 'Religious' },
      { date: `${year}-11-30`, name: 'Independence Day', type: 'National' },
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'Public Holiday' },
    ];
  }

  // Ensure sorted
  events.sort((a, b) => a.date.localeCompare(b.date));

  // News: combine Hacker News and Reddit sources
  let news = previous?.news || { ai: [], vibeCoding: [], progDb: [] };
  try {
    const [aiHN, aiReddit] = await Promise.all([
      fetchTopStories('ai'),
      fetchRedditTop('artificial').catch(() => []),
    ]);
    const [vibeHN, vibeReddit] = await Promise.all([
      fetchTopStories('vibe coding'),
      fetchRedditTop('vibecoding').catch(() => []),
    ]);
    const [progHN, progReddit] = await Promise.all([
      fetchTopStories('programming'), // broader query to ensure hits
      fetchRedditTop('programming').catch(() => []),
    ]);

    const merge = (a, b) => [...a, ...b]
      .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
      .slice(0, 5);

    news = {
      ai: merge(aiHN, aiReddit),
      vibeCoding: merge(vibeHN, vibeReddit),
      progDb: merge(progHN, progReddit),
    };
  } catch (e) {
    console.error('News fetch failed, keeping previous if any:', e);
  }

  const dashboard = {
    updatedAt: new Date().toISOString(),
    timezone,
    weather,
    metals: {
      goldUSD,
      oilUSD,
      updatedAt: new Date().toISOString(),
      gold24KUSD: +(goldUSD / OZ_TO_GRAM).toFixed(2),
      gold21KUSD: +((goldUSD / OZ_TO_GRAM) * (21 / 24)).toFixed(2),
      gold18KUSD: +((goldUSD / OZ_TO_GRAM) * (18 / 24)).toFixed(2),
      gold24KJD: +((goldUSD / OZ_TO_GRAM) * exchangeRates.JOD).toFixed(2),
      gold21KJD: +((goldUSD / OZ_TO_GRAM) * (21 / 24) * exchangeRates.JOD).toFixed(2),
      gold18KJD: +((goldUSD / OZ_TO_GRAM) * (18 / 24) * exchangeRates.JOD).toFixed(2),
    },
    exchange: exchangeRates,
    prayer,
    events,
    news,
  };

  await writeFile(OUT_FILE, JSON.stringify(dashboard, null, 2));
  console.log(`Dashboard data updated: ${OUT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error in update-data:', err);
  process.exit(1);
});