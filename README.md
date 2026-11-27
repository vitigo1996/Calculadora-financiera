# Finanzas Personales & Hogar (Android & Web)

Aplicación moderna, modular y offline-first de finanzas personales, adaptada para control individual y en pareja, basada en modelos de presupuesto quincenal, distribución proporcional de gastos, optimizador de suscripciones, administración de tarjetas de crédito y seguimiento de portafolio patrimonial multi-divisa (USD / COP).

---

## Características Principales

1. **Dashboard Financiero Integral**:
   - Patrimonio total en tiempo real (conversión automática USD a COP con TRM).
   - Ingresos brutos, deducciones de ley (8% salud/pensión), gastos totales y disponible libre mensual.
   - Gráficos interactivos de distribución de gastos y composición patrimonial.

2. **Presupuesto Quincenal (Mitad de Mes vs Fin de Mes)**:
   - Separación inteligente de compromisos según fecha de cobro (1ra quincena vs 2da quincena).
   - División de vivienda compartida (arriendo, servicios, internet) proporcional a los ingresos de cada miembro de la pareja.
   - Códigos de referencia de pago integrados (ej. factura de servicios, internet).

3. **Tarjetas de Crédito & Cupos**:
   - Visualización de tarjetas bancarias (Nu, Falabella, Addi, etc.).
   - Monitor de cupo utilizado vs disponible.
   - Registro y desglose de compras por tarjeta.

4. **Optimizador de Suscripciones Compartidas**:
   - Cálculo del costo real mensual dividiendo planes familiares entre miembros y anualidades (Nintendo, Spotify, Netflix, Gemini AI, Gimnasio, Datos móviles).
   - Interruptor para pausar/activar servicios.

5. **Portafolio de Activos & Fondo de Emergencia**:
   - Inversiones globales (eToro ETF, Plenti USDt).
   - Ahorros locales (Nu Cajita, Comfama Ahorro Casa, Bancolombia, Efectivo).
   - Termómetro de salud del fondo de emergencia (meses de gastos cubiertos).

6. **Calculadoras & Simulador Financiero**:
   - Simulador de crédito con tabla de amortización y costo total en intereses.
   - Proyector de interés compuesto para metas de ahorro a 5, 10 o 20 años.
   - Termómetro de capacidad de endeudamiento prudente.

7. **Privacidad & Exportación**:
   - 100% offline-first: tus datos financieros nunca salen de tu dispositivo.
   - Exportación a Excel (`.xlsx`) y copias de seguridad en formato JSON.

---

## Cómo Probar la Aplicación en tu PC (Navegador)

### Opción Rápida (1 Clic):
Haz doble clic sobre el archivo **`Iniciar_App_Web.bat`** en esta carpeta. Se abrirá automáticamente tu navegador en `http://localhost:3000`.

### Opción Terminal:
```bash
npm run dev
```

---

## Cómo Probarla en tu Celular Android

### Opción 1: Descarga Directa desde GitHub Actions (Recomendada)
1. Sube tu código a tu repositorio de GitHub:
   ```bash
   git push origin main
   ```
2. En tu repositorio de GitHub, ve a la pestaña **Actions**.
3. El flujo compilará automáticamente el archivo firmado **`app-release.apk`** (requiere los secretos de firma `MISFINANZAS_*` configurados en el repositorio).
4. Descárgalo en tu celular e instálalo para probar la app inmediatamente.

### Opción 2: Compilación Local con Android Studio
1. Ejecuta:
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```
2. En Android Studio, haz clic en **Run** (ícono verde) conectando tu celular por USB o usando un emulador.

---

## Estructura del Proyecto

```
d:/App Finanzas/
├── .github/workflows/         # Automatización de compilación de APK en GitHub
├── android/                   # Proyecto nativo Android (Capacitor / Gradle)
├── src/
│   ├── components/            # Barra de navegación, menús y componentes UI
│   ├── context/               # Estado global reactivo (FinanceContext)
│   ├── features/              # Vistas segmentadas por módulos funcionales
│   │   ├── budget/            # Presupuesto quincenal y vivienda
│   │   ├── calculator/        # Simulador de préstamos e interés compuesto
│   │   ├── cards/             # Tarjetas de crédito y desglose
│   │   ├── dashboard/         # Resumen y métricas principales
│   │   ├── portfolio/         # Activos e inversiones USD/COP
│   │   ├── settings/          # Ajustes de sueldos, TRM y exportación Excel
│   │   └── subscriptions/     # Suscripciones inteligentes
│   ├── models/                # Tipos TypeScript
│   └── services/              # Motor de cálculo y exportador Excel
├── package.json
└── Iniciar_App_Web.bat        # Acceso directo para probar en PC
```
