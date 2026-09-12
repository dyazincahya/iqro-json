import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code2, ArrowRight, Sparkles, Layers, Database, HeartHandshake } from 'lucide-react';
import { WarningDisclaimer } from '../components/WarningDisclaimer';
import type { LevelInfo } from '../types';

interface HomePageProps {
  levels: LevelInfo[];
}

const JILID_COLORS: Record<number, { gradient: string; badge: string; text: string }> = {
  1: { gradient: 'from-blue-600 to-blue-800', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-900' },
  2: { gradient: 'from-emerald-600 to-emerald-800', badge: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-900' },
  3: { gradient: 'from-rose-600 to-rose-800', badge: 'bg-rose-100 text-rose-800', text: 'text-rose-900' },
  4: { gradient: 'from-purple-600 to-purple-800', badge: 'bg-purple-100 text-purple-800', text: 'text-purple-900' },
  5: { gradient: 'from-amber-600 to-amber-800', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-900' },
  6: { gradient: 'from-teal-600 to-teal-800', badge: 'bg-teal-100 text-teal-800', text: 'text-teal-900' },
};

export const HomePage: React.FC<HomePageProps> = ({ levels }) => {
  const BASE_URL = import.meta.env.BASE_URL;

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digitalisasi Karya KH. As'ad Humam</span>
          </div>

          {/* Arabic Calligraphy */}
          <div className="font-serif text-6xl md:text-7xl lg:text-8xl text-emerald-800/90 font-bold mb-4 drop-shadow-xs select-none">
            اقرأ
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            Belajar Membaca Al-Qur'an <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 bg-clip-text text-transparent">
              Dalam Format Digital Terbuka
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-8">
            Dokumentasi lengkap buku <strong>Iqro' Jilid 1 hingga 6</strong> dalam format JSON terstruktur dan antarmuka pembaca interaktif yang mudah diakses kapan saja.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mx-auto w-full max-w-xs sm:max-w-none">
            <Link
              to="/baca"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>Mulai Baca</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/developer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 shadow-2xs hover:shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Code2 className="w-5 h-5 text-slate-600" />
              <span>API Developer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-14 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">6 Jilid Lengkap</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Mencakup seluruh lembaran dari Iqro 1 hingga Iqro 6 yang disusun berurutan sesuai metode buku asli.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Format JSON Terstruktur</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Data teks Arab, transliterasi Latin, posisi baris/kolom, dan petunjuk mengajar tersedia via CDN terbuka.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Murni Non-Komersial</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Dibuat semata-mata untuk tujuan pendidikan dan sebagai amal jariyah bagi almarhum Bapak KH. As'ad Humam.
            </p>
          </div>
        </div>

        {/* Section: Pilih Jilid Cepat */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Katalog Buku</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Pilih Jilid untuk Mulai Belajar
              </h2>
            </div>
            <Link
              to="/baca"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <span>Buka Tampilan Lembaran Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {levels.map((level) => {
              const color = JILID_COLORS[level.id] || { gradient: 'from-slate-700 to-slate-900', badge: 'bg-slate-100 text-slate-800', text: 'text-slate-900' };
              return (
                <Link
                  key={level.id}
                  to={`/baca/iqro-${level.id}`}
                  className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between h-44 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color.badge}`}>
                      Jilid {level.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {level.pagesCount} hal
                    </span>
                  </div>

                  <div className="my-auto text-center">
                    <div className="font-serif text-3xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      اقرأ
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 mt-1 uppercase tracking-wider">
                      {level.title}
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 flex items-center justify-center gap-1 border-t border-slate-100 pt-2 transition-colors">
                    <span>Buka</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Warning Disclaimer on Home Page */}
        <div className="mt-16">
          <WarningDisclaimer />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img src={`${BASE_URL}icon.png`} alt="Iqro icon" className="w-5 h-5 object-contain" />
            <span>Iqro Digital JSON &copy; {new Date().getFullYear()} — Proyek Edukasi Al-Qur'an</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/baca" className="hover:text-slate-900 hover:underline">Baca Iqro</Link>
            <Link to="/developer" className="hover:text-slate-900 hover:underline">Developer API</Link>
            <a
              href="https://github.com/dyazincahya/iqro-json"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
