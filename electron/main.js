'use strict';

const { app, BrowserWindow, ipcMain, nativeTheme, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

// ─── Database Layer (sql.js — pure WASM, no native compilation needed) ─────────
let db;
let SQL;

async function initDatabase() {
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'equilibrium.db');

  // Load existing DB from disk or create new
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Helper: persist DB to disk after each write
  function persist() {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
  db.persist = persist;

  // ── Schema ──────────────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL,
      description TEXT, color TEXT NOT NULL, icon TEXT
    );
    CREATE TABLE IF NOT EXISTS sentiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, emoji TEXT
    );
    CREATE TABLE IF NOT EXISTS activities (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      zona_id       INTEGER NOT NULL,
      descripcion   TEXT    NOT NULL,
      sentimiento_id INTEGER,
      resistencia   INTEGER,
      habilidad     TEXT,
      meta_cumplida TEXT,
      notas         TEXT,
      timestamp     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_act_zona  ON activities(zona_id);
    CREATE INDEX IF NOT EXISTS idx_act_ts    ON activities(timestamp);
  `);

  // ── Seeds ───────────────────────────────────────────────────────────────────
  const zoneCount = db.exec("SELECT COUNT(*) as c FROM zones")[0]?.values[0][0];
  if (!zoneCount) {
    db.run(`INSERT INTO zones VALUES (1,'Confort','Lo familiar y seguro.','#6366F1','🏠')`);
    db.run(`INSERT INTO zones VALUES (2,'Miedo','El umbral del riesgo.','#EF4444','⚡')`);
    db.run(`INSERT INTO zones VALUES (3,'Aprendizaje','Adquisición de habilidades.','#F59E0B','📚')`);
    db.run(`INSERT INTO zones VALUES (4,'Crecimiento','Metas cumplidas y expansión.','#10B981','🚀')`);
    db.run(`INSERT INTO sentiments(label,emoji) VALUES ('Energizado','⚡'),('Ansioso','😰'),('Orgulloso','😤'),('Satisfecho','😊'),('Retado','💪'),('Curioso','🔍'),('Vulnerable','🫀'),('Imparable','🔥')`);
    persist();
  }

  console.log('[DB] Equilibrium database initialized at:', dbPath);
}

// ─── Helper: sql.js query result → array of objects ──────────────────────────
function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('activities:getAll', () => {
  const res = db.exec(`
    SELECT a.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon,
           s.label AS sentimiento_label, s.emoji AS sentimiento_emoji
    FROM activities a
    JOIN zones z ON a.zona_id = z.id
    LEFT JOIN sentiments s ON a.sentimiento_id = s.id
    ORDER BY a.timestamp DESC LIMIT 100
  `);
  return rowsToObjects(res);
});

ipcMain.handle('activities:create', (_e, data) => {
  db.run(
    `INSERT INTO activities (zona_id,descripcion,sentimiento_id,resistencia,habilidad,meta_cumplida,notas)
     VALUES (?,?,?,?,?,?,?)`,
    [data.zona_id, data.descripcion, data.sentimiento_id||null,
     data.resistencia||null, data.habilidad||null, data.meta_cumplida||null, data.notas||null]
  );
  db.persist();
  const res = db.exec(`
    SELECT a.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon,
           s.label AS sentimiento_label, s.emoji AS sentimiento_emoji
    FROM activities a JOIN zones z ON a.zona_id=z.id
    LEFT JOIN sentiments s ON a.sentimiento_id=s.id
    WHERE a.id=(SELECT MAX(id) FROM activities)
  `);
  return rowsToObjects(res)[0];
});

ipcMain.handle('activities:delete', (_e, id) => {
  db.run('DELETE FROM activities WHERE id=?', [id]);
  db.persist();
  return { success: true };
});

ipcMain.handle('activities:getStats', () => {
  const res = db.exec(`
    SELECT z.id, z.name, z.color, z.icon,
           COUNT(a.id) AS total, AVG(a.resistencia) AS avg_resistencia,
           MAX(a.timestamp) AS last_activity
    FROM zones z LEFT JOIN activities a ON a.zona_id=z.id
    GROUP BY z.id ORDER BY z.id
  `);
  return rowsToObjects(res);
});

ipcMain.handle('activities:getInsights', () => {
  const now = Math.floor(Date.now() / 1000);
  const res = db.exec(`
    SELECT z.id, z.name, z.color, z.icon, COUNT(a.id) AS total_activities,
           CAST((${now} - COALESCE(MAX(a.timestamp), ${now - 86400*30})) / 86400 AS INTEGER) AS days_since
    FROM zones z LEFT JOIN activities a ON a.zona_id=z.id
    GROUP BY z.id ORDER BY z.id
  `);
  return rowsToObjects(res);
});

ipcMain.handle('zones:getAll', () => rowsToObjects(db.exec('SELECT * FROM zones ORDER BY id')));
ipcMain.handle('sentiments:getAll', () => rowsToObjects(db.exec('SELECT * FROM sentiments ORDER BY id')));

// ─── Window Controls ──────────────────────────────────────────────────────────
let mainWindow;
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => mainWindow?.isMaximized() ? mainWindow.restore() : mainWindow?.maximize());
ipcMain.on('window:close',    () => mainWindow?.close());

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    frame: false, titleBarStyle: 'hidden',
    backgroundColor: '#0A0B0F',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, contextIsolation: true, sandbox: false,
    },
    show: false,
  });
  nativeTheme.themeSource = 'dark';
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5888');
    // DevTools desactivados — usar Ctrl+Shift+I si necesitas inspeccionar
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
