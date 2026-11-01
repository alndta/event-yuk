import useDialog from '../hooks/useDialog';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, X, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
}

function AuthPromptModalInner({ isOpen, message, onClose }: Props) {
  const dialogRef = useDialog(onClose);
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div ref={dialogRef} className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 overflow-hidden flex flex-col relative">
        {/* Top Accent Gradient */}
        <div className="h-2 bg-brand-lime" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7 text-center">
          {/* Official Event Yuk Brand Logo */}
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-200/90 p-2">
            <img
              src="/logo-event-yuk.png"
              alt="Event Yuk Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.promptTitle')}
          </h3>

          <p className="text-sm sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {message ||
              t('auth.promptDefault')}
          </p>

          {/* Reassuring Value Points */}
          <div className="mt-5 p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-left space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('auth.promptEscrow')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{t('auth.promptPks')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full min-h-12 px-4 rounded-full text-white font-bold text-sm sm:text-sm transition flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy-dark transition-colors"
            >
              <LogIn className="w-4 h-4 text-[#5E7628]" />
              <span>{t('auth.promptLogin')}</span>
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="w-full min-h-12 px-4 rounded-full text-white font-bold text-sm sm:text-sm /25 transition flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy-dark transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('auth.promptRegister')}</span>
            </Link>

            <button
              onClick={onClose}
              className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              {t('auth.promptLater')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPromptModal(props: Props) {
  if (!props.isOpen) return null;
  return <AuthPromptModalInner {...props} />;
}
