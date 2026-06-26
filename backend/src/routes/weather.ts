import { Router } from 'express';

export const weatherRouter = Router();

const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',        icon: '☀️' },
  1:  { label: 'Mainly clear',     icon: '🌤️' },
  2:  { label: 'Partly cloudy',    icon: '⛅' },
  3:  { label: 'Overcast',         icon: '☁️' },
  45: { label: 'Fog',              icon: '🌫️' },
  48: { label: 'Icy fog',          icon: '🌫️' },
  51: { label: 'Light drizzle',    icon: '🌦️' },
  53: { label: 'Drizzle',          icon: '🌦️' },
  55: { label: 'Heavy drizzle',    icon: '🌧️' },
  61: { label: 'Light rain',       icon: '🌧️' },
  63: { label: 'Rain',             icon: '🌧️' },
  65: { label: 'Heavy rain',       icon: '🌧️' },
  71: { label: 'Light snow',       icon: '🌨️' },
  73: { label: 'Snow',             icon: '❄️' },
  75: { label: 'Heavy snow',       icon: '❄️' },
  80: { label: 'Rain showers',     icon: '🌦️' },
  81: { label: 'Rain showers',     icon: '🌧️' },
  82: { label: 'Violent showers',  icon: '⛈️' },
  95: { label: 'Thunderstorm',     icon: '⛈️' },
  96: { label: 'Thunderstorm + hail', icon: '⛈️' },
  99: { label: 'Thunderstorm + hail', icon: '⛈️' },
};

weatherRouter.get('/current', async (req, res) => {
  try {
    const lat  = req.query.lat  ?? '45.5017';
    const lon  = req.query.lon  ?? '-73.5673';
    const unit = req.query.unit ?? 'celsius';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode,is_day` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
      `&temperature_unit=${unit}&wind_speed_unit=kmh&timezone=auto&forecast_days=5`;

    const r = await fetch(url);
    if (!r.ok) throw new Error(`Open-Meteo error ${r.status}`);
    const data: any = await r.json();

    const cur = data.current;
    const wmo = WMO[cur.weathercode] ?? { label: 'Unknown', icon: '🌡️' };

    const daily = (data.daily?.time ?? []).map((date: string, i: number) => ({
      date,
      high: data.daily.temperature_2m_max[i],
      low:  data.daily.temperature_2m_min[i],
      icon: (WMO[data.daily.weathercode[i]] ?? { icon: '🌡️' }).icon,
      label: (WMO[data.daily.weathercode[i]] ?? { label: '' }).label,
    }));

    res.json({
      temp:       cur.temperature_2m,
      feelsLike:  cur.apparent_temperature,
      humidity:   cur.relative_humidity_2m,
      windSpeed:  cur.wind_speed_10m,
      condition:  wmo.label,
      icon:       wmo.icon,
      isDay:      cur.is_day === 1,
      unit:       unit === 'fahrenheit' ? '°F' : '°C',
      timezone:   data.timezone,
      daily,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
