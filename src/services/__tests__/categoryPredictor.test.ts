import { describe, it, expect } from 'vitest';
import { predictCategory } from '../categoryPredictor';

describe('categoryPredictor Service', () => {
  it('predicts mercado for supermarket related words', () => {
    expect(predictCategory('Mercado Carulla')).toBe('mercado');
    expect(predictCategory('Supermercado Exito')).toBe('mercado');
    expect(predictCategory('Tienda D1 leche y huevos')).toBe('mercado');
  });

  it('predicts restaurante for restaurant/food phrases', () => {
    expect(predictCategory('Almuerzo ejecutivo')).toBe('restaurante');
    expect(predictCategory('Hamburguesa El Corral')).toBe('restaurante');
    expect(predictCategory('Cena de sushi')).toBe('restaurante');
  });

  it('predicts gasolina for gas station brands and fuel terms', () => {
    expect(predictCategory('Tanqueo Terpel')).toBe('gasolina');
    expect(predictCategory('Gasolina Primax')).toBe('gasolina');
  });

  it('predicts apps for transport apps', () => {
    expect(predictCategory('Viaje Uber')).toBe('apps');
    expect(predictCategory('Carrera Didi')).toBe('apps');
  });

  it('predicts suscripciones for streaming and subscription terms', () => {
    expect(predictCategory('Netflix mensual')).toBe('suscripciones');
    expect(predictCategory('Spotify Premium')).toBe('suscripciones');
  });

  it('returns null or undefined for empty or unrecognized concept', () => {
    expect(predictCategory('')).toBeNull();
    expect(predictCategory('   ')).toBeNull();
    expect(predictCategory('xyzqwerty123')).toBeNull();
  });
});
