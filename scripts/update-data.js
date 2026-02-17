#!/usr/bin/env node

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const OUT_DIR = join(process.cwd(), 'public', 'data');
const OUT_FILE = join(OUT_DIR, 'dashboard.json');

// Helpers
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json();
}

function toJordanTime(dateStr) {
  // Open-Meteo returns date as "YYYY-MM-DD" and hour as integer in Asia/Amman timezone
  // We'll keep it simple: date and hour as provided (they're already in Asia/Amman)
  return dateStr;
}

function convertGold(usdPerOz, usdToJod) {
  // 1 troy oz = 31.1035 grams; gold price per gram in JOD if needed, but we just convert price
  return +(usdPerOz * usdToJod).toFixed(2);
}

function convertOil(usdPerBarrel, usdToJod) {
  return +(usdPerBarrel * usdToJod).toFixed(2);
}

// Steps
async function main() {
  try {
    // Coordinates for Irbid, Jordan
    const lat = 32.55;
    const lon = 35.85;
    const timezone = 'Asia/Amman';

    // 1. Weather (current + tomorrow)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max&timezone=${timezone}&forecast_days=2`;
    const weather = await fetchJSON(weatherUrl);

    // Determine WMO weather code interpretation (simple mapping)
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

    const current = {
      temp_c: weather.current.temperature_2m,
      humidity: weather.current.relative_humidity_2m,
      wind_kph: weather.current.wind_speed_10m,
      weather_code: weather.current.weather_code,
      weather_desc: getWeatherDesc(weather.current.weather_code),
    };

    const day0 = weather.daily;
    const idx = 1; // tomorrow
    const tomorrow = {
      date: day0.time[idx],
      temp_max_c: day0.temperature_2m_max[idx],
      temp_min_c: day0.temperature_2m_min[idx],
      humidity_max: day0.relative_humidity_2m_max[idx],
      humidity_min: day0.relative_humidity_2m_min[idx],
      wind_kph: day0.wind_speed_10m_max[idx],
      weather_code: day0.weather_code[idx],
      weather_desc: getWeatherDesc(day0.weather_code[idx]),
    };

    // 2. Metals (gold and oil) - USD only; JOD conversion will be done client-side with fixed rate (0.709)
    const [goldData, oilData] = await Promise.all([
      fetchJSON('https://api.metals.live/v1/spot?metals=xau'),
      fetchJSON('https://api.metals.live/v1/spot?metals=cl'),
    ]);

    // goldData: array with latest object containing 'xauUSD' and 'timestamp'
    const latestGold = goldData[0];
    const goldUSD = latestGold.xauUSD;

    // oilData: array with latest object containing 'clUSD' (WTI)
    const latestOil = oilData[0];
    const oilUSD = latestOil.clUSD;

    const metals = {
      goldUSD: +goldUSD.toFixed(2),
      oilUSD: +oilUSD.toFixed(2),
      updatedAt: new Date().toISOString(),
    };

    // 3. News from Hacker News
    async function fetchTopStories(query) {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=points>10&hitsPerPage=100`;
      const data = await fetchJSON(url);
      // Sort by created_at_i descending (most recent first)
      const sorted = [...data.hits].sort((a, b) => b.created_at_i - a.created_at_i);
      return sorted.slice(0, 5).map(hit => ({
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        points: hit.points,
        comments: hit.num_comments,
        created_at: new Date(hit.created_at * 1000).toISOString(),
      }));
    }

    const [aiNews, vibeNews, progDbNews] = await Promise.all([
      fetchTopStories('ai'),
      fetchTopStories('vibe coding'),
      fetchTopStories('programming languages OR databases'),
    ]);

    const news = {
      ai: aiNews,
      vibeCoding: vibeNews,
      progDb: progDbNews,
    };

    // 4. Dashboard JSON
    const dashboard = {
      updatedAt: new Date().toISOString(),
      timezone: timezone,
      weather: {
        current,
        tomorrow,
      },
      metals,
      news,
    };

    // Ensure out dir exists
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify(dashboard, null, 2));

    console.log(`Dashboard data updated: ${OUT_FILE}`);
  } catch (err) {
    console.error('Error updating data:', err);
    process.exit(1);
  }
}

main();