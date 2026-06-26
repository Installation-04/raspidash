import { useEffect, useState } from 'react';
import { SkeletonCard } from '../Skeleton';
import { ServiceStatRow } from '../ServiceStatRow';
import { AppConfig } from '../../types';

interface Props {
  config?: AppConfig;
}

export function WeatherWidget({ config }: Props) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  const lat  = (config as any)?.weatherLat  ?? '45.5017';
  const lon  = (config as any)?.weatherLon  ?? '-73.5673';
  const unit = config?.temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch(`/api/weather/current?lat=${lat}&lon=${lon}&unit=${unit}`)
        .then(r => r.json())
        .then(d => { if (!cancelled) { if (d.error) setErr(d.error); else setData(d); } })
        .catch(e => { if (!cancelled) setErr(e.message); });

    load();
    const t = setInterval(load, 10 * 60 * 1000);
    return () => { cancelled = true; clearInterval(t); };
  }, [lat, lon, unit]);

  if (err) return <div className="text-red-400 text-sm p-2">{err}</div>;
  if (!data) return <SkeletonCard />;

  return (
    <>
      <div className="flex-1 overflow-auto flex flex-col gap-3">
        {/* Current */}
        <div className="flex items-center gap-3">
          <span className="text-5xl leading-none">{data.icon}</span>
          <div>
            <div className="text-3xl font-bold text-tx">{Math.round(data.temp)}{data.unit}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>{data.condition}</div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { label: 'Feels like', value: `${Math.round(data.feelsLike)}${data.unit}` },
            { label: 'Humidity',   value: `${data.humidity}%` },
            { label: 'Wind',       value: `${Math.round(data.windSpeed)} km/h` },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-xs py-0.5">
              <span style={{ color: 'rgb(var(--color-text-muted))' }}>{r.label}</span>
              <span className="font-mono text-tx">{r.value}</span>
            </div>
          ))}
        </div>

        {/* 5-day forecast */}
        {data.daily?.length > 0 && (
          <div className="border-t pt-2" style={{ borderColor: 'rgb(var(--color-bg-border) / 0.5)' }}>
            <div className="grid grid-cols-5 gap-1">
              {data.daily.slice(0, 5).map((d: any) => {
                const dow = new Date(d.date).toLocaleDateString('en', { weekday: 'short' });
                return (
                  <div key={d.date} className="flex flex-col items-center gap-0.5 text-[10px]">
                    <span style={{ color: 'rgb(var(--color-text-muted))' }}>{dow}</span>
                    <span className="text-base leading-none">{d.icon}</span>
                    <span className="text-tx font-medium">{Math.round(d.high)}°</span>
                    <span style={{ color: 'rgb(var(--color-text-muted))' }}>{Math.round(d.low)}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ServiceStatRow stats={[
        { value: `${Math.round(data.temp)}${data.unit}`, label: 'Temp' },
        { value: `${data.humidity}%`,                    label: 'Humidity' },
        { value: `${Math.round(data.windSpeed)} km/h`,   label: 'Wind' },
      ]} />
    </>
  );
}
