import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string | null;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Aviso',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pb-64 sm:pb-8 flex justify-center items-start sm:items-center animate-fadeIn modal-backdrop-scroll">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp space-y-4 my-auto modal-card-scroll">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isDanger
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : isWarning
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : isSuccess
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}
            >
              {isDanger || isWarning ? (
                <AlertTriangle className="w-4 h-4" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              {title}
            </h3>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-2 pt-2">
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all text-center text-white ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500'
                : isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
