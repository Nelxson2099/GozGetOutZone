# Equilibrium

<div align="center">

```
 ███████╗ ██████╗ ██╗   ██╗██╗██╗     ██╗██████╗ ██████╗ ██╗██╗   ██╗███╗   ███╗
 ██╔════╝██╔═══██╗██║   ██║██║██║     ██║██╔══██╗██╔══██╗██║██║   ██║████╗ ████║
 █████╗  ██║   ██║██║   ██║██║██║     ██║██████╔╝██████╔╝██║██║   ██║██╔████╔██║
 ██╔══╝  ██║▄▄ ██║██║   ██║██║██║     ██║██╔══██╗██╔══██╗██║██║   ██║██║╚██╔╝██║
 ███████╗╚██████╔╝╚██████╔╝██║███████╗██║██████╔╝██║  ██║██║╚██████╔╝██║ ╚═╝ ██║
 ╚══════╝ ╚══▀▀═╝  ╚═════╝ ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝     ╚═╝
```

**Desktop App para trackear tu progresión entre las 4 Zonas del Crecimiento Personal**

![Version](https://img.shields.io/badge/version-1.0.0-10B981?style=flat-square)
![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-local-003B57?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/license-MIT-6366F1?style=flat-square)

</div>

---

## 🧭 ¿Qué es Equilibrium?

Equilibrium es una aplicación de escritorio privada y offline-first que te ayuda a mapear, trackear y balancear tu presencia en las **4 Zonas del Crecimiento Personal**:

| Zona | Color | Descripción |
|------|-------|-------------|
| 🏠 **Confort** | Índigo | Lo familiar y seguro. El hogar del status quo. |
| ⚡ **Miedo** | Rojo | El umbral del riesgo. Aquí vive el coraje. |
| 📚 **Aprendizaje** | Ámbar | La zona de adquisición de habilidades. |
| 🚀 **Crecimiento** | Esmeralda | El territorio de las metas cumplidas. |

---

## ✨ Features

- **Radar Chart** — Visualiza tu balance entre zonas en tiempo real
- **Timeline** — Historial filtrable de todos tus eventos de expansión
- **Sistema de Insights** — Alertas conductuales: *"Llevas X días en Zona de Confort"*
- **Score de Equilibrio** — Puntuación calculada de balance entre zonas
- **FAB + Modal 2-pasos** — Registro rápido con campos específicos por zona
- **SQLite local** — 100% privado, sin servidores, sin nube
- **Ventana frameless** — Experiencia nativa premium con titlebar personalizada

---

## 🛠️ Stack Técnico

```
Electron 33      → Runtime de escritorio, IPC, ventana nativa
React 18         → UI reactiva modular
Vite 6           → Build tool ultrarrápido
Tailwind CSS 3   → Sistema de diseño con tokens de marca
better-sqlite3   → SQLite síncrono de alto rendimiento
Chart.js 4       → Radar chart
date-fns         → Formateo de fechas en español
```

---

## 🚀 Instalación y Uso

Para descargar y usar este proyecto en tu propia máquina:

```bash
# 1. Clona el repositorio
git clone https://github.com/Nelxson2099/GozGetOutZone.git
cd GozGetOutZone

# 2. Instala las dependencias (requiere Node.js y pnpm)
pnpm install
```

Existen dos maneras de ejecutar Equilibrium, dependiendo de si quieres editar el código o solo usar la aplicación.

### 1. Modo Desarrollo (Para programar)
Ejecuta la app con recarga en vivo (HMR) y procesos de Node.js en segundo plano. Los cambios en el código se reflejan instantáneamente.
```bash
pnpm install   # Solo la primera vez
pnpm dev
```

### 2. Modo Producción (Para usar la app)
Compila el código y empaqueta la aplicación en un instalador nativo de Windows (`.exe`). Este modo es ultra rápido y **no** requiere procesos de Node.js de fondo. Si haces cambios en el código, debes volver a compilar.
```bash
pnpm electron:build
# El ejecutable y el instalador se generarán en la carpeta: dist-electron/
```

> **Nota sobre los datos:** Tu información personal (tareas, historial, métricas) se guarda centralizada en `%AppData%/equilibrium/equilibrium.db`. Ambos modos comparten la misma base de datos, por lo que **no perderás tu información** al pasar del modo desarrollo al ejecutable compilado.

### Prerequisitos de Sistema
- Node.js ≥ 18
- pnpm ≥ 8 (`npm install -g pnpm`)

---

## 📁 Arquitectura (MNE — Modular Neural Engineering)

```
GetOutZone - GOZ/
├── electron/
│   ├── main.js          # Proceso principal: SQLite, IPC, ventana
│   └── preload.js       # Bridge seguro renderer ↔ main (contextBridge)
├── src/
│   ├── components/
│   │   ├── TitleBar.jsx      # Titlebar custom con drag region
│   │   ├── Sidebar.jsx       # Navegación + stats por zona
│   │   ├── Dashboard.jsx     # Radar chart + actividad reciente
│   │   ├── Timeline.jsx      # Historial filtrable
│   │   ├── InsightsPanel.jsx # Score + recomendaciones
│   │   ├── ActivityModal.jsx # Modal 2-pasos para registrar
│   │   ├── InsightBanner.jsx # Banner de alerta conductual
│   │   └── FAB.jsx           # Botón flotante
│   ├── App.jsx          # Root: estado global, routing de vistas
│   ├── main.jsx         # React entry point
│   └── index.css        # Design system: glassmorphism, tokens, animaciones
├── assets/              # Iconos y recursos estáticos
├── electron/main.js     # Electron main process
├── SOUL.md              # Identidad y filosofía del proyecto
├── PROJECT.md           # Roadmap y estado de features
└── package.json         # pnpm + electron-builder config
```

---

## 🗃️ Esquema de Base de Datos

```sql
-- Zonas (semilla fija, 4 registros)
zones(id, name, description, color, icon)

-- Sentimientos disponibles (8 opciones)
sentiments(id, label, emoji)

-- Tabla principal de actividades
activities(
  id            INTEGER PRIMARY KEY,
  zona_id       INTEGER NOT NULL,     -- FK → zones
  descripcion   TEXT    NOT NULL,
  sentimiento_id INTEGER,             -- FK → sentiments (opcional)
  resistencia   INTEGER (1-10),       -- Solo Zona de Miedo
  habilidad     TEXT,                 -- Solo Zona de Aprendizaje
  meta_cumplida TEXT,                 -- Solo Zona de Crecimiento
  notas         TEXT,
  timestamp     INTEGER,              -- Unix timestamp (índice)
  created_at    TEXT                  -- ISO 8601 string
)
```

---

## 🔌 IPC API (Electron ↔ React)

| Canal | Tipo | Descripción |
|-------|------|-------------|
| `activities:getAll` | invoke | Lista todas las actividades (JOIN zonas/sentimientos) |
| `activities:create` | invoke | Inserta nueva actividad |
| `activities:delete` | invoke | Elimina por ID |
| `activities:getStats` | invoke | Agregados por zona |
| `activities:getInsights` | invoke | Días desde última actividad por zona |
| `zones:getAll` | invoke | Lista las 4 zonas |
| `sentiments:getAll` | invoke | Lista los 8 sentimientos |
| `window:minimize/maximize/close` | send | Controles de ventana |

---

## 🧠 Sistema de Insights — Lógica

```
Si days_since(Confort) >= 3 → "Llevas X días en Zona de Confort, es hora de un pequeño riesgo"
Si days_since(Miedo)   >= 7 → "X días sin confrontar el miedo. El coraje se entrena."
Si total(Aprendizaje)  == 0 → "Activa el Modo Aprendizaje: ¿qué podrías aprender esta semana?"
Score de Equilibrio = 100 - (varianza entre zonas / promedio) * 20
```

---

## 📝 Changelog

### v1.0.0 — Genesis (2026-05-14)
- ✅ Arquitectura Electron + Vite + React establecida
- ✅ SQLite local con esquema completo y seeds
- ✅ Radar chart con datos normalizados
- ✅ Timeline con filtros y detalles expandibles
- ✅ Sistema de Insights conductual
- ✅ Modal de 2 pasos con campos específicos por zona
- ✅ Score de Equilibrio con gauge visual

---

*Built by Nelxson2099 × Antigravity AI · 2026*
