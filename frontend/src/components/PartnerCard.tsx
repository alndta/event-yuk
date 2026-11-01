import { Sliders, Music, MapPin, Star, ArrowRight } from 'lucide-react';
import { PartnerItem } from '../data/mockPartners';

interface Props {
  partner: PartnerItem;
  onInvite: (partner: PartnerItem) => void;
}

export default function PartnerCard({ partner, onInvite }: Props) {
  const isBand = partner.type === 'TALENT';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Banner / Header */}
        <div className="p-5 flex items-start gap-4 border-b border-slate-100">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isBand ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {isBand ? <Music className="w-3 h-3 text-purple-600" /> : <Sliders className="w-3 h-3 text-indigo-600" />}
                <span>{isBand ? 'Talenta / Band' : 'Vendor Produksi'}</span>
              </span>

              <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{partner.rating}</span>
              </div>
            </div>

            <h3 className="font-extrabold text-base text-slate-900 mt-1 line-clamp-1">
              {partner.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{partner.categoryLabel}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-slate-400" /> {partner.city}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Description */}
        <div className="p-5 space-y-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Estimasi Biaya / Honor:</span>
            <span className="font-bold text-slate-900 font-mono">{partner.priceRange}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {partner.description}
          </p>

          {/* Specs / Riders bullets */}
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isBand ? 'Riders & Manajemen:' : 'Spesifikasi Peralatan:'}
            </div>
            {partner.specsOrRiders.slice(0, 3).map((item, idx) => (
              <div key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                <span className="text-sky-500 font-bold">•</span>
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onInvite(partner)}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
            isBand
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <span>Ajukan Undangan & Deal Harga</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
