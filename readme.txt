# 💳 Finance Manager

Aplicación personal de finanzas para el hogar. Construida con React + Vite.

## Funcionalidades

- **Billetera** — Seguimiento de saldos en Efectivo, Bancolombia y Wise (COP/USD), y registro de deudas personales.
- **Obligaciones** — Registro de sueldos, gastos del hogar, tarjetas de crédito (Nu, Falabella, Addi) y créditos (carro, Icetex).
- **Portafolio** — Control de ahorros (Casa, Emergencia, Personal, Boda) e inversiones en eToro.
- **Distribución** — Resumen mensual de gastos fijos de David, con desglose por mitad de mes y fin de mes.

## Tecnologías

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- Persistencia local con `localStorage`
- Fuentes: Outfit + DM Serif Display (Google Fonts)

## Instalación

```bash
npm install
npm run dev
```

## Estructura

```
finance-manager/
├── src/
│   └── App.jsx       # Componente principal
├── index.html
├── package.json
└── README.md
```

## Notas

- Los datos se guardan localmente en el navegador (localStorage).
- La tasa de cambio USD/COP se obtiene automáticamente al cargar.
