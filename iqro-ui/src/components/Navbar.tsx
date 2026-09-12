import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Code2, Home } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Navbar: React.FC = () => {
  const location = useLocation();
  const BASE_URL = import.meta.env.BASE_URL;
  const navRef = useRef<HTMLElement>(null);

  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; top: number; height: number }>({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });
  const [hasPositioned, setHasPositioned] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };

  const updatePill = () => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        top: activeEl.offsetTop,
        height: activeEl.offsetHeight,
      });
      setHasPositioned(true);
    }
  };

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      updatePill();
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  useEffect(() => {
    if (!navRef.current) return;
    const observer = new ResizeObserver(() => {
      updatePill();
    });
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <img
            src={`${BASE_URL}icon.png`}
            alt="Logo Iqro"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg border border-slate-200 shadow-xs bg-white p-0.5 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-wider text-sm sm:text-base leading-tight">
              IQRO' DIGITAL
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium hidden xs:inline">
              Open Data Al-Qur'an
            </span>
          </div>
        </Link>

        {/* Navigation Links with Sliding Indicator */}
        <nav ref={navRef} className="relative flex items-center gap-1.5 sm:gap-2">
          {/* Animated Sliding Background Indicator */}
          <div
            className={`absolute bg-slate-900 rounded-xl shadow-xs transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0 ${
              hasPositioned ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              top: `${pillStyle.top}px`,
              height: `${pillStyle.height}px`,
            }}
          />

          {[
            { path: '/', label: 'Beranda', icon: Home, title: 'Beranda' },
            { path: '/baca', label: 'Baca Iqro', icon: BookOpen, title: 'Baca Lembaran Iqro' },
            { path: '/developer', label: 'Developer', icon: Code2, title: 'Dokumentasi API Developer' },
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.title}
                data-active={active ? 'true' : 'false'}
                className={`relative z-10 flex items-center gap-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  active
                    ? `${hasPositioned ? 'bg-transparent' : 'bg-slate-900 shadow-xs'} px-3.5 py-2 text-white`
                    : 'p-2 sm:px-2.5 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {active && (
                  <span className="animate-in fade-in zoom-in-95 duration-150">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          <a
            href="https://github.com/dyazincahya/iqro-json"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition-all whitespace-nowrap ml-1 sm:ml-2"
            title="Repositori GitHub"
          >
            <GithubIcon className="w-4 h-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
