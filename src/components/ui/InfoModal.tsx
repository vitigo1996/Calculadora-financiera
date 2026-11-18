import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  title: string | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, title, onClose }) => {
  if (!isOpen || !title) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn modal-backdrop-scroll">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp text-center space-y-4 modal-card-scroll">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black font-mono border border-blue-200 dark:border-blue-800/60 shadow-xs">
          ?
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Habrá información a detalle más adelante.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export const InfoButton: React.FC<{ onClick: (e?: React.MouseEvent) => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xs flex-shrink-0"
    title="Más información"
  >
    ?
  </button>
);
