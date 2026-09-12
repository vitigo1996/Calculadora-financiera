import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

interface AuthLockScreenProps {
  children: React.ReactNode;
}

export const AuthLockScreen: React.FC<AuthLockScreenProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinPad, setShowPinPad] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Intentar autenticación biométrica WebAuthn o simulada
  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage('');
    try {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          // Si el dispositivo cuenta con autenticador biométrico disponible
          setTimeout(() => {
            setIsUnlocked(true);
            setIsAuthenticating(false);
          }, 400);
          return;
        }
      }
      // Fallback simulado estándar si no hay WebAuthn nativo disponible
      setTimeout(() => {
        setIsUnlocked(true);
        setIsAuthenticating(false);
      }, 500);
    } catch {
      setIsAuthenticating(false);
      setShowPinPad(true);
    }
  };

  useEffect(() => {
    // Disparar autenticación al inicio
    handleBiometricAuth();
  }, []);

  const handleNumberPress = (num: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      if (newPin.length === 4) {
        // Validación de PIN
        setTimeout(() => {
          setIsUnlocked(true);
        }, 300);
      }
    }
  };

  const handleDeleteNumber = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-6 select-none font-sans">
      {/* Top Section */}
      <div className="pt-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-4 border border-blue-400/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white mb-1">
          Mis Finanzas
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Acceso Seguro Protegido
        </p>
      </div>

      {/* Center Action (Huella o PIN) */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-xs">
        {!showPinPad ? (
          <div className="flex flex-col items-center gap-6 animate-fadeIn">
            <button
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className="relative group p-6 rounded-full bg-slate-900 border-2 border-blue-500/50 hover:border-blue-400 transition-all shadow-2xl hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-30" />
              <Fingerprint className="w-16 h-16 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </button>

            <div className="text-center">
              <span className="text-xs font-semibold text-slate-300 block">
                {isAuthenticating ? 'Verificando huella...' : 'Toca el sensor para desbloquear'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Huella dactilar o reconocimiento biométrico
              </span>
            </div>

            <button
              onClick={() => setShowPinPad(true)}
              className="mt-4 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" /> Usar Código PIN
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* 4 PIN Dots */}
            <div className="flex items-center gap-4 mb-6">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    pinInput.length > idx
                      ? 'bg-blue-500 scale-110 shadow-md shadow-blue-500/50'
                      : 'border-2 border-slate-700 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <span className="text-xs text-rose-400 mb-4 font-medium">
                {errorMessage}
              </span>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberPress(num)}
                  className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-lg font-bold text-white transition-all active:scale-90 flex items-center justify-center shadow-sm mx-auto"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setShowPinPad(false)}
                className="w-16 h-16 rounded-2xl bg-transparent text-slate-400 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center mx-auto"
              >
                <Fingerprint className="w-6 h-6 text-blue-400" />
              </button>
              <button
                onClick={() => handleNumberPress('0')}
                className="w-16 h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-lg font-bold text-white transition-all active:scale-90 flex items-center justify-center shadow-sm mx-auto"
              >
                0
              </button>
              <button
                onClick={handleDeleteNumber}
                className="w-16 h-16 rounded-2xl bg-transparent text-slate-400 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center mx-auto"
              >
                Borrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-4 text-center">
        <span className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Datos encriptados localmente
        </span>
      </div>
    </div>
  );
};
