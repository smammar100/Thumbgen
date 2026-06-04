import React, { useEffect, useState } from 'react';
import { GithubLogo, Star } from '@phosphor-icons/react';

export default function StarOnGithub() {
  const [stars, setStars] = useState<string>('...');

  useEffect(() => {
    let active = true;

    const fetchStars = () => {
      fetch('https://api.github.com/repos/smammar100/Thumbgen')
        .then((res) => {
          if (!res.ok) throw new Error('API request failed');
          return res.json();
        })
        .then((data) => {
          if (!active) return;
          if (data && typeof data.stargazers_count === 'number') {
            const count = data.stargazers_count;
            if (count >= 1000) {
              setStars((count / 1000).toFixed(1) + 'k');
            } else {
              setStars(String(count));
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching github stars:', err);
          if (active && stars === '...') {
            setStars('0');
          }
        });
    };

    // Initial load
    fetchStars();

    // 1. Fetch periodically in background (every 30 seconds)
    const intervalId = setInterval(fetchStars, 30000);

    // 2. Refresh immediately when user switches focus back to the page/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStars();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Refresh when window is focused
    window.addEventListener('focus', fetchStars);

    return () => {
      active = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchStars);
    };
  }, []);

  return (
    <a
      href="https://github.com/smammar100/Thumbgen"
      target="_blank"
      rel="noopener noreferrer"
      className="animate-rainbow before:animate-rainbow group relative inline-flex h-9 cursor-pointer items-center justify-center rounded-md border-0 bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] text-black dark:text-white select-none"
    >
      <div className="flex items-center gap-1.5">
        <GithubLogo size={15} weight="bold" className="text-black dark:text-white" />
        <span className="font-sans font-medium text-[11px]">Star on GitHub</span>
      </div>
      <div className="ml-2.5 flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-2">
        <Star
          size={13}
          weight="fill"
          className="text-gray-400 transition-colors duration-200 group-hover:text-yellow-400 group-hover:scale-110"
        />
        <span className="font-mono text-xs font-bold tabular-nums text-black dark:text-white">
          {stars}
        </span>
      </div>
    </a>
  );
}
