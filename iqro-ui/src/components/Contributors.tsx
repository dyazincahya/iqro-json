import React from 'react';
import { Users, GitPullRequest, ExternalLink } from 'lucide-react';

interface ContributorsProps {
  className?: string;
}

export const Contributors: React.FC<ContributorsProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs text-center ${className}`}>
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3.5">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Komunitas & Kolaborasi</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Kontributor Repositori
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
          Terima kasih sebesar-besarnya kepada rekan-rekan yang telah berkontribusi dan meluangkan waktu serta tenaganya dalam mendigitalkan dan menyempurnakan repositori ini.
        </p>
      </div>

      {/* Contrib.rocks Dynamic Widget */}
      <div className="max-w-xl mx-auto p-6 sm:p-8 bg-slate-50/80 border border-slate-200/80 rounded-2xl mb-8 flex flex-col items-center justify-center gap-4">
        <a
          href="https://github.com/dyazincahya/iqro-json/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
          className="group block transition-transform hover:scale-105 cursor-pointer"
          title="Klik untuk melihat grafik kontributor di GitHub"
        >
          <img
            src="https://contrib.rocks/image?repo=dyazincahya/iqro-json"
            alt="Daftar Kontributor Iqro JSON"
            className="h-14 sm:h-16 md:h-18 rounded-xl object-contain drop-shadow-xs"
            loading="lazy"
          />
        </a>

        <a
          href="https://github.com/dyazincahya/iqro-json/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <span>Lihat Grafik Kontributor di GitHub</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>

      {/* Call to Contribute Footer Note */}
      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs text-slate-600">
        <span>Ingin berpartisipasi menyempurnakan data atau antarmuka Iqro?</span>
        <a
          href="https://github.com/dyazincahya/iqro-json"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Kirim Pull Request di GitHub</span>
        </a>
      </div>
    </div>
  );
};
