import React from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
  Mail,
  ExternalLink,
} from "lucide-react";

interface WarningDisclaimerProps {
  className?: string;
}

export const WarningDisclaimer: React.FC<WarningDisclaimerProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-amber-50/95 border border-amber-300/80 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm text-left ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-3.5 mb-4 sm:mb-5">
        <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shrink-0">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
        </div>
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 sm:px-2.5 py-0.5 rounded-md">
            Pernyataan & Himbauan
          </span>
          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-amber-950 mt-1">
            Murni Edukasi & Tidak Untuk Dikomersialisasikan
          </h3>
        </div>
      </div>

      <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed sm:pl-11 md:pl-[52px]">
        {/* Tujuan Edukasi & Amal Jariyah */}
        <p>
          Proyek ini{" "}
          <strong className="font-semibold text-slate-900">
            tidak dibuat untuk tujuan komersial
          </strong>
          , melainkan semata-mata untuk kepentingan edukasi dan riset
          pemanfaatan teknologi sebagai media pembelajaran Al-Qur'an.
          Dokumentasi ini hadir agar warisan ilmu membaca Al-Qur'an dapat
          dipelajari secara mudah oleh generasi masa kini.
        </p>

        {/* Imbauan Pengembang */}
        <div className="p-4 bg-amber-100/60 border border-amber-200 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1.5">
            <span>📌</span> Imbauan bagi Pengembang Aplikasi:
          </h4>
          <p className="text-slate-700 text-xs md:text-sm">
            Kami mengimbau kepada siapa pun yang memanfaatkan data dari
            repositori ini agar{" "}
            <strong className="text-red-700 font-semibold">
              tidak mengkomersialisasikan
            </strong>{" "}
            aplikasinya. Hendaknya aplikasi disebarluaskan secara{" "}
            <strong className="text-emerald-700 font-semibold">gratis</strong>{" "}
            sebagai amal jariyah bagi Bapak{" "}
            <code className="bg-white border border-amber-300/70 text-amber-900 px-1.5 py-0.5 rounded text-xs font-mono">
              KH. As‘ad Humam
            </code>
            , agar pahalanya terus mengalir kepada beliau dan keluarganya hingga
            akhirat kelak.
          </p>
        </div>

        {/* Status Proyek & Keterbukaan Koreksi Data */}
        <div className="p-4 bg-emerald-50/90 border border-emerald-300/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <span>🛠️</span> Status Data & Keterbukaan Koreksi:
            </h4>
            <p className="text-slate-700 text-xs md:text-sm leading-relaxed">
              Proyek digitalisasi ini <strong>masih terus berjalan</strong>. Hasil data JSON yang ada saat ini sebagian mungkin <strong>belum 100% sama persis dengan buku fisik aslinya</strong> (seperti ketepatan harakat, susunan baris/kolom, atau transliterasi Latin).
            </p>
            <p className="text-slate-600 text-xs">
              Kami sangat terbuka terhadap koreksi! Silakan ajukan <strong>Issue</strong> atau <strong>Pull Request (PR)</strong> di GitHub dengan mencantumkan secara spesifik <em>Jilid, Nomor Halaman, dan Posisi Baris/Kolom</em> yang belum sesuai agar dapat segera disempurnakan.
            </p>
          </div>
          <a
            href="https://github.com/dyazincahya/iqro-json/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-2xs transition-all hover:scale-105 active:scale-95 text-center shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>Buka Issue Koreksi</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Hak Cipta & Dukungan Buku Fisik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-white/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-900">
                Hak Cipta Karya Asli
              </h5>
              <p className="text-xs text-slate-600 mt-1">
                Seluruh materi, teks Arab, susunan, dan metode Iqro' adalah hak
                cipta milik Alm. <strong>KH. As'ad Humam</strong> &{" "}
                <strong>Team Tadarus AMM Yogyakarta</strong>. Proyek ini tidak
                mengklaim kepemilikan atas materi buku tersebut.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
            <ShoppingBag className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-xs font-bold text-slate-900">
                Dukung Buku Fisik Asli
              </h5>
              <p className="text-xs text-slate-600 mt-1 mb-2.5">
                Kami sangat menganjurkan para santri dan orang tua untuk{" "}
                <strong>tetap membeli buku fisik Iqro' resmi</strong> cetakan
                Team Tadarus AMM Yogyakarta sebagai dukungan nyata terhadap
                dakwah dan operasional penerbit aslinya.
              </p>
              <a
                href="https://www.gramedia.com/products/bk-iqromembaca-al-quran-besar-cd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-all hover:scale-105 active:scale-95 text-center cursor-pointer shadow-2xs"
              >
                <span>Beli Buku Fisik Resmi di Gramedia</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Takedown Policy */}
        <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Pemberitahuan & Takedown:</strong> Jika pihak pemegang hak
              cipta resmi berkeberatan atas keberadaan data ini, silakan hubungi
              kami untuk penyesuaian/penghapusan segera.
            </span>
          </div>
          <a
            href="mailto:kangcahyakeren@gmail.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium shrink-0 transition-all hover:scale-105 active:scale-95 text-center break-all cursor-pointer shadow-2xs"
          >
            kangcahyakeren@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};
