// Servicio Inteligente de Asociación y Sugerencia de Categorías
// Asocia el título o descripción de un registro con la categoría más relevante

interface CategoryRule {
  categoryId: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  // Alimentación: Mercado
  {
    categoryId: 'mercado',
    keywords: [
      'mercado', 'supermercado', 'super', 'exito', 'jumbo', 'carulla', 'olimpica', 'd1', 'tiendas d1',
      'ara', 'tiendas ara', 'isimo', 'viveres', 'despensa', 'frutas', 'verduras', 'carniceria',
      'panaderia', 'fruver', 'huevos', 'leche', 'carne', 'pollo', 'pescado', 'pan', 'abarrotes',
      'tienda', 'minimercado', 'plaza', 'bodega'
    ]
  },
  // Alimentación: Restaurante
  {
    categoryId: 'restaurante',
    keywords: [
      'restaurante', 'almuerzo', 'cena', 'desayuno', 'brunch', 'comida', 'comer', 'hamburguesa',
      'burger', 'pizza', 'pizzeria', 'sushi', 'tacos', 'asado', 'parrilla', 'picada', 'corral',
      'frisby', 'mcdonalds', 'kfc', 'crepes', 'waffles', 'subway', 'sanduche', 'sandwich',
      'arepa', 'empanada', 'pollo frito', 'chuzo', 'perro caliente', 'hot dog', 'pasta', 'wok'
    ]
  },
  // Alimentación: Bebidas
  {
    categoryId: 'bebidas',
    keywords: [
      'bebida', 'bebidas', 'cafe', 'café', 'starbucks', 'juan valdez', 'tostao', 'cerveza', 'birra',
      'trago', 'licor', 'vino', 'coctel', 'gaseosa', 'jugo', 'batido', 'smoothie', 'bar',
      'discoteca', 'pub', 'cerveceria', 'agua', 'soda', 'refresco'
    ]
  },
  // Alimentación: Domicilio
  {
    categoryId: 'domicilio',
    keywords: [
      'domicilio', 'domicilios', 'rappi', 'pedidosya', 'ifood', 'didi food', 'ubereats',
      'delivery', 'pedido', 'encargo'
    ]
  },

  // Transporte: Gasolina
  {
    categoryId: 'gasolina',
    keywords: [
      'gasolina', 'combustible', 'tanqueo', 'tanquear', 'primax', 'terpel', 'esso', 'mobil',
      'texaco', 'biomax', 'acpm', 'diesel', 'gas'
    ]
  },
  // Transporte: Apps
  {
    categoryId: 'apps',
    keywords: [
      'uber', 'didi', 'cabify', 'indrive', 'in drive', 'beat', 'taxi', 'taxis', 'picap', 'mototaxi'
    ]
  },
  // Transporte: Público
  {
    categoryId: 'publico',
    keywords: [
      'publico', 'metro', 'transmilenio', 'sitp', 'mio', 'metroplus', 'tranvia', 'colectivo',
      'pasaje', 'pasajes', 'recarga cívica', 'civica', 'tullave', 'buseta', 'bus'
    ]
  },
  // Transporte: Mantenimiento
  {
    categoryId: 'mantenimiento',
    keywords: [
      'mantenimiento', 'mecanico', 'mecánico', 'taller', 'cambio de aceite', 'llanta', 'llantas',
      'frenos', 'repuesto', 'repuestos', 'bateria', 'lavado de carro', 'lavadero', 'tecnomecanica',
      'alineacion', 'balanceo'
    ]
  },
  // Transporte: Tiquetes
  {
    categoryId: 'tiquetes',
    keywords: [
      'tiquete', 'tiquetes', 'vuelo', 'vuelos', 'avion', 'avión', 'avianca', 'latam', 'wingo',
      'copa', 'aeropuerto', 'pasaje aereo', 'terminal', 'boleto', 'viaje en bus', 'flota'
    ]
  },
  // Transporte: Parqueadero
  {
    categoryId: 'parqueadero',
    keywords: [
      'parqueadero', 'parking', 'estacionamiento', 'parqueo', 'valet', 'parquimetro', 'aparcamiento'
    ]
  },

  // Hogar: Arriendo
  {
    categoryId: 'arriendo',
    keywords: [
      'arriendo', 'arrendamiento', 'renta', 'alquiler', 'canon', 'canon de arrendamiento',
      'inmobiliaria', 'arriendo apto', 'arriendo casa'
    ]
  },
  // Hogar: Hipoteca
  {
    categoryId: 'hipoteca',
    keywords: [
      'hipoteca', 'credito hipotecario', 'crédito hipotecario', 'cuota casa', 'cuota apto',
      'cuota vivienda', 'leasing habitacional', 'cuota inicial'
    ]
  },
  // Hogar: Servicios
  {
    categoryId: 'servicios',
    keywords: [
      'servicio', 'servicios', 'servicios publicos', 'servicios públicos', 'epm', 'enel', 'emcali',
      'energia', 'energía', 'luz', 'factura de luz', 'agua', 'factura de agua', 'acueducto',
      'alcantarillado', 'gas', 'gas natural', 'aseo', 'internet', 'wifi', 'claro', 'tigo',
      'movistar', 'etb', 'wom', 'administracion', 'administración'
    ]
  },

  // Entretenimiento: Suscripciones
  {
    categoryId: 'suscripciones',
    keywords: [
      'suscripcion', 'suscripción', 'suscripciones', 'netflix', 'spotify', 'youtube', 'youtube premium',
      'hbo', 'max', 'disney', 'disney+', 'amazon prime', 'prime video', 'apple tv', 'apple music',
      'icloud', 'chatgpt', 'openai', 'claude', 'github', 'patreon', 'deezer', 'crunchyroll'
    ]
  },
  // Entretenimiento: Juegos
  {
    categoryId: 'juegos',
    keywords: [
      'juego', 'juegos', 'videojuego', 'videojuegos', 'playstation', 'psn', 'ps plus', 'xbox',
      'game pass', 'nintendo', 'switch', 'steam', 'riot', 'epic games', 'blizzard', 'casino'
    ]
  },
  // Entretenimiento: Eventos
  {
    categoryId: 'eventos',
    keywords: [
      'evento', 'eventos', 'concierto', 'boleta', 'boletas', 'tuboleta', 'taquilla', 'festival',
      'teatro', 'cine', 'cinecolombia', 'cinemark', 'procinal', 'cinepolis', 'fiesta', 'show',
      'museo', 'circo'
    ]
  },
  // Entretenimiento: Paseos
  {
    categoryId: 'paseos',
    keywords: [
      'paseo', 'paseos', 'viaje', 'viajes', 'vacaciones', 'hotel', 'airbnb', 'booking', 'hospedaje',
      'playa', 'resort', 'glamping', 'camping', 'excursion', 'excursión', 'tour', 'turismo'
    ]
  },
  // Entretenimiento: Salidas
  {
    categoryId: 'salidas',
    keywords: [
      'salida', 'salidas', 'rumba', 'parche', 'bolera', 'bolos', 'billar', 'parque de diversiones',
      'diversion', 'diversión', 'picnic', 'escape room'
    ]
  },

  // General: Mascota
  {
    categoryId: 'mascota',
    keywords: [
      'mascota', 'mascotas', 'perro', 'perra', 'gato', 'gata', 'veterinario', 'veterinaria',
      'vet', 'purina', 'concentrado', 'whiskas', 'dog chow', 'pedigree', 'pet shop', 'petshop',
      'arena de gato', 'baño perro', 'vacuna mascota'
    ]
  },
  // General: Salud
  {
    categoryId: 'salud',
    keywords: [
      'salud', 'medico', 'médico', 'doctor', 'doctora', 'cita medica', 'cita médica', 'eps',
      'medicina prepagada', 'sura', 'colsanitas', 'farmacia', 'drogueria', 'droguería',
      'cruz verde', 'farmatodo', 'drogas la rebaja', 'medicamento', 'medicamentos', 'pastillas',
      'remedio', 'laboratorio', 'examenes', 'radiografia', 'odontologo', 'odontología', 'dentista',
      'dientes', 'optica', 'gafas', 'lentes', 'psicologo', 'terapia', 'copago'
    ]
  },
  // General: Educación
  {
    categoryId: 'educacion',
    keywords: [
      'educacion', 'educación', 'colegio', 'universidad', 'matricula', 'matrícula', 'pension',
      'pensión', 'curso', 'capacitacion', 'taller educativo', 'udemy', 'platzi', 'coursera',
      'diplomado', 'semestre', 'libros', 'libro', 'cuaderno', 'utiles', 'útiles', 'papeleria',
      'papelería', 'clase', 'profesor'
    ]
  },
  // General: Compras
  {
    categoryId: 'compras',
    keywords: [
      'compra', 'compras', 'zara', 'h&m', 'bershka', 'pull&bear', 'falabella', 'exito ropa',
      'ropa', 'camisa', 'camiseta', 'pantalon', 'pantalón', 'vestido', 'chaqueta', 'zapatos',
      'calzado', 'tenis', 'sneakers', 'nike', 'adidas', 'puma', 'amazon', 'aliexpress',
      'mercadolibre', 'mercado libre', 'temu', 'shein', 'electrodomestico', 'tecnologia',
      'celular', 'audifonos', 'reloj', 'joyeria', 'perfume', 'maquillaje', 'regalo', 'detalles'
    ]
  },

  // Finanzas: Pago
  {
    categoryId: 'pago',
    keywords: [
      'pago', 'nomina', 'nómina', 'sueldo', 'salario', 'quincena', 'honorarios', 'liquidacion',
      'liquidación', 'prima', 'cesantias', 'cesantías', 'bono', 'comision', 'comisión', 'abono'
    ]
  },
  // Finanzas: Tarjeta
  {
    categoryId: 'tarjeta',
    keywords: [
      'tarjeta', 'tarjeta de credito', 'tarjeta de crédito', 'tc', 'visa', 'mastercard',
      'american express', 'amex', 'cuota tarjeta', 'pago tc'
    ]
  },
  // Finanzas: Inversión
  {
    categoryId: 'inversion',
    keywords: [
      'inversion', 'inversión', 'acciones', 'etf', 'dividendo', 'dividendos', 'cdt', 'bolsa',
      'trii', 'tyba', 'hapi', 'binance', 'cripto', 'crypto', 'bitcoin', 'btc', 'rendimiento',
      'interes', 'interés', 'fondos de inversion'
    ]
  },
  // Finanzas: Ahorro
  {
    categoryId: 'ahorro',
    keywords: [
      'ahorro', 'ahorros', 'alcancia', 'alcancía', 'fondo de emergencia', 'bolsillo', 'bolsillos',
      'reserva', 'guardadito'
    ]
  },
  // Finanzas: Transferencia
  {
    categoryId: 'transferencia',
    keywords: [
      'transferencia', 'traspaso', 'transfiya', 'consignacion', 'consignación', 'envio', 'envío',
      'pse', 'giro', 'remesa'
    ]
  }
];

// Normaliza texto: minúsculas, sin tildes ni caracteres especiales repetidos
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Predice la categoría a partir del título o concepto ingresado.
 * Retorna el categoryId correspondiente o null si no hay coincidencia.
 */
export function predictCategory(title: string): string | null {
  if (!title || typeof title !== 'string') return null;

  const normalized = normalizeText(title);
  if (normalized.length < 2) return null;

  // 1. Coincidencia por palabras clave ordenadas por especificidad
  // Buscamos coincidencia exacta de palabra o frase dentro del título
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizeText(kw);

      // Si la palabra clave es compuesta (frase)
      if (normalizedKw.includes(' ')) {
        if (normalized.includes(normalizedKw)) {
          return rule.categoryId;
        }
      } else {
        // Si es una sola palabra, verificamos con límites de palabra (regex \b)
        const regex = new RegExp(`(^|[^a-z0-9])${normalizedKw}([^a-z0-9]|$)`, 'i');
        if (regex.test(normalized)) {
          return rule.categoryId;
        }
      }
    }
  }

  return null;
}
