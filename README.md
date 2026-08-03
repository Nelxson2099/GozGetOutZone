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

![Version](https://img.shields.io/badge/version-1.5.0-10B981?style=flat-square)
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

## ✨ Features Principales

- **🪟 Sección Proyectos en Ventanitas & Superposición (Nuevo v1.5)**:
  - 🧩 **Grid Adaptativo ("Ventanitas")**: Visualización compacta en tarjetas dispuestas en una cuadrícula de 3 columnas ideal para gestionar decenas de proyectos simultáneos.
  - 🔍 **Superposición Modal de Proyecto (Overlay)**: Al hacer clic en cualquier ventanita de proyecto se abre un panel centrado superpuesto para interactuar con subtareas, barras de progreso y adición de fases.
  - 🏆 **Ranking Dinámico por Progreso (TOP #1)**: El proyecto con **más subtareas completadas** lidera la tabla con bordes dorados y distintivo `🏆 TOP #1 LÍDER`.
  - ⚠️ **Modal Alarma de Confirmación**: Botón especial *"Proyecto Completado"* con ventana emergente de seguridad (*"¿Estás seguro?"*) antes de transferirlo al archivo.

- **💾 Copia de Seguridad & Migración JSON (Nuevo v1.5)**:
  - 📤 **Exportar JSON**: Descarga un archivo `.json` completo con todos tus proyectos, subtareas, misiones, actividades, hábitos y racha de XP.
  - 📥 **Importar JSON**: Restaura o sincroniza fácilmente toda tu información al cambiar de PC o reinstalar la app.

- **🔄 Sección Hábitos**:
  - 🌿 **3 Ramas / Frecuencias**: Hábitos **Diarios**, **Semanales** (período exacto Lunes a Domingo) y **Mensuales**.
  - 📅 **Control por Período**: Registro de cumplimiento en tiempo real con barras de progreso y cálculo de racha.
  - 🏷️ **Asociación por Zona**: Vincula cada rutina a una Zona de Expansión.

- **Gestión de Actividades & Misiones RPG**:
  - 🏆 **Misiones Principales** (1000 XP) y ⚡ **Misiones Secundarias** (100 XP) con fecha límite en rojo si se vencen.
  - 🔥 **Sistema de Rachas & Multiplicadores**: Completa misiones diariamente para subir tu racha (multiplicadores de XP de hasta x3).
  - 🎖️ **Sistema de Niveles & Logros**: Rangos desde 🌱 *Novicio* hasta 🌟 *Trascendente* con insignias desbloqueables.

- **Dashboard Estadístico & Insights**:
  - Radar chart interactivo (Chart.js), score de equilibrio conductual e historial en línea de tiempo.

- **SQLite local & Ventana Frameless**:
  - 100% privado, offline, datos en SQLite local (`%AppData%/equilibrium/equilibrium.db`) y experiencia de usuario nativa frameless.

---

## 🛠️ Stack Técnico

```
Electron 33      → Runtime de escritorio, IPC, ventana nativa
React 18         → UI reactiva modular
Vite 6           → Build tool ultrarrápido
Tailwind CSS 3   → Sistema de diseño con tokens de marca
sql.js / SQLite  → Base de datos SQL local con persistencia
Lucide React     → Iconografía moderna
Chart.js 4       → Radar chart
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

### 1. Modo Desarrollo (Para programar)
```bash
pnpm dev
```

### 2. Modo Producción (Para usar la app)
Compila el código y empaqueta la aplicación en un ejecutable nativo de Windows (`.exe`).
```bash
pnpm electron:build
# El ejecutable se generará en: dist-electron/
```

---

## 📁 Arquitectura

```
GetOutZone - GOZ/
├── electron/
│   ├── main.js          # Proceso principal: SQLite, IPC handlers, ventana, export/import JSON
│   └── preload.js       # Bridge seguro renderer ↔ main (contextBridge)
├── src/
│   ├── components/
│   │   ├── TitleBar.jsx      # Titlebar custom con drag region
│   │   ├── Sidebar.jsx       # Navegación + stats por zona + Respaldo JSON
│   │   ├── Dashboard.jsx     # Radar chart + actividad reciente
│   │   ├── Habits.jsx        # Hábitos (Diarios, Semanales, Mensuales)
│   │   ├── Projects.jsx      # Proyectos (Grid de ventanitas, Superposición modal, Subtareas)
│   │   ├── BackupModal.jsx   # Modal de exportación e importación JSON
│   │   ├── Missions.jsx      # Sistema de misiones RPG
│   │   ├── Timeline.jsx      # Historial filtrable
│   │   ├── InsightsPanel.jsx # Score + recomendaciones
│   │   ├── ActivityModal.jsx # Modal para registrar actividad
│   │   └── FAB.jsx           # Botón flotante
│   ├── App.jsx          # Root: estado global, IPC integration
│   ├── constants.js     # Definición de niveles y logros
│   └── index.css        # Design system: glassmorphism, tokens
├── PROJECT.md           # Estado del proyecto
└── package.json         # Dependencias y scripts
```

---

## 🗃️ Esquema de Base de Datos

```sql
-- Zonas y Sentimientos
zones(id, name, description, color, icon)
sentiments(id, label, emoji)

-- Actividades y Logros
activities(id, zona_id, descripcion, sentimiento_id, resistencia, habilidad, meta_cumplida, notas, mision_tipo, completada, completada_at, timestamp, created_at, deadline, streak_multiplier)
achievements(id, unlocked_at)

-- Hábitos y Logs por Período
habits(id, title, description, frequency, zona_id, created_at)
habit_logs(id, habit_id, period_key, completed_at)

-- Proyectos y Subtareas
projects(id, title, description, zona_id, status, completed_at, created_at)
project_subtasks(id, project_id, title, completed, created_at)
```

---

## 🔌 IPC API (Electron ↔ React)

| Namespace | Método / Canal | Descripción |
|-----------|----------------|-------------|
| `activities` | `getAll`, `create`, `delete`, `complete`, `getMissions`, `getStats`, `getXP`, `getInsights` | Métricas y actividades |
| `habits` | `getAll`, `create`, `delete`, `toggleLog` | Gestión de hábitos diarios/semanales/mensuales |
| `projects` | `getAll`, `create`, `delete`, `complete`, `reopen`, `addSubtask`, `toggleSubtask`, `deleteSubtask` | Gestión de proyectos, subtareas y ranking |
| `data` | `export`, `import` | Exportación e importación integral de datos en formato JSON |
| `zones` | `getAll` | Obtener zonas |
| `achievements` | `getAll`, `unlock` | Logros desbloqueables |
| `window` | `minimize`, `maximize`, `close` | Controles de ventana nativos |

---

## 📝 Changelog

### v1.5.0 — Grid de Ventanitas de Proyectos, Superposición Modal & Respaldo JSON (2026-08-03)
- ✅ **Grid de Proyectos ("Ventanitas")**: Rediseño visual a cuadrícula adaptativa de 3 columnas para navegación cómoda con decenas de proyectos.
- ✅ **Superposición Modal del Proyecto (Overlay)**: Despliegue de modal centrado al hacer clic en cualquier tarjeta de proyecto para interactuar con subtareas, barras de progreso y fases.
- ✅ **Copia de Seguridad & Migración JSON**: Botón *Respaldo JSON* en la barra lateral para exportar e importar toda la base de datos local (`equilibrium_backup.json`) entre distintas PCs.
- ✅ **Preservación Total de Datos**: Actualización 100% no destructiva en SQLite manteniendo datos de proyectos, hábitos y misiones intactos.

### v1.4.0 — Hábitos & Proyectos (2026-07-25)
- ✅ **Sección HÁBITOS**: Clasificación en 3 ramas (Diarios, Semanales y Mensuales).
- ✅ **Sección PROYECTOS**: Proyectos Actuales y Realizados con subtareas ilimitadas.

### v1.0.0 — Genesis (2026-05-14)
- ✅ Arquitectura Electron + Vite + React con ventana frameless.
- ✅ Base de datos SQLite local privada.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

*Built by Nelxson2099 × Antigravity AI · 2026*stión de proyectos, subtareas y ranking |
| `zones` | `getAll` | Obtener zonas |
| `achievements` | `getAll`, `unlock` | Logros desbloqueables |
| `window` | `minimize`, `maximize`, `close` | Controles de ventana nativos |

---

## 📝 Changelog

### v1.4.0 — Hábitos & Proyectos (2026-07-25)
- ✅ **Sección HÁBITOS**: Clasificación en 3 ramas (Diarios, Semanales [Lunes a Domingo] y Mensuales) con marcas por período y rachas.
- ✅ **Sección PROYECTOS**: Proyectos Actuales y Realizados, subtareas ilimitadas por proyecto.
- ✅ **Ranking Dinámico**: Ordenamiento automático de proyectos en tiempo real posicionando en el **TOP #1** al proyecto con más subtareas completadas.
- ✅ **Modal de Alarma de Confirmación**: Alerta de confirmación de seguridad antes de transferir un proyecto a la sección de realizados.
- ✅ **Optimización de SQLite & IPC**: Blindaje contra fallas de inicialización DDL y manejo defensivo en llamadas de estado.

### v1.0.0 — Genesis (2026-05-14)
- ✅ Arquitectura Electron + Vite + React con ventana frameless.
- ✅ Base de datos SQLite local privada.

---

*Built by Nelxson2099 × Antigravity AI · 2026*
