export const CurrencyService = {
  async fetchLiveUsdRate(): Promise<number | null> {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates && data.rates.COP) {
          const copRate = Math.round(data.rates.COP * 100) / 100;
          try {
            localStorage.setItem('last_live_usd_rate', copRate.toString());
            localStorage.setItem('last_live_usd_timestamp', new Date().toISOString());
          } catch {
      // Almacenamiento no disponible (modo privado o bloqueado): se ignora sin afectar la app
    }
          return copRate;
        }
      }
    } catch (error) {
      console.warn('Error al obtener la TRM en vivo desde internet:', error);
    }
    return null;
  },

  getLastCachedRate(): number | null {
    try {
      const cached = localStorage.getItem('last_live_usd_rate');
      if (cached) {
        const parsed = parseFloat(cached);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Almacenamiento no disponible (modo privado o bloqueado): se ignora sin afectar la app
    }
    return null;
  }
};
