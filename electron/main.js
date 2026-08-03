'use strict';

const { app, BrowserWindow, ipcMain, nativeTheme, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

let db;
let SQL;

async function initDatabase() {
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'equilibrium.db');

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  function persist() {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
  db.persist = persist;

  // ── Base Schema ────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL,
      description TEXT, color TEXT NOT NULL, icon TEXT
    );
    CREATE TABLE IF NOT EXISTS sentiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, emoji TEXT
    );
    CREATE TABLE IF NOT EXISTS activities (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      zona_id         INTEGER NOT NULL,
      descripcion     TEXT    NOT NULL,
      sentimiento_id  INTEGER,
      resistencia     INTEGER,
      habilidad       TEXT,
      meta_cumplida   TEXT,
      notas           TEXT,
      mision_tipo     TEXT    DEFAULT NULL,
      completada      INTEGER DEFAULT 0,
      completada_at   TEXT    DEFAULT NULL,
      timestamp       INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_act_zona   ON activities(zona_id);
    CREATE INDEX IF NOT EXISTS idx_act_ts     ON activities(timestamp);
    CREATE INDEX IF NOT EXISTS idx_act_mision ON activities(mision_tipo, completada);
    CREATE TABLE IF NOT EXISTS achievements (
      id          TEXT PRIMARY KEY,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      frequency TEXT NOT NULL,
      zona_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      period_key TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      zona_id INTEGER,
      status TEXT NOT NULL DEFAULT 'activo',
      completed_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS project_subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── v1.3 Migrations: add columns if they don't exist ──────────────────────
  function addColumnIfMissing(table, column, definition) {
    try {
      const res = db.exec(`SELECT COUNT(*) FROM pragma_table_info('${table}') WHERE name='${column}'`);
      if (res[0]?.values[0][0] === 0) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`[DB] Migration: added ${table}.${column}`);
      }
    } catch (e) { console.warn('[DB] Migration warning:', e.message); }
  }
  addColumnIfMissing('activities', 'deadline',          'TEXT DEFAULT NULL');
  addColumnIfMissing('activities', 'streak_multiplier', 'REAL DEFAULT 1.0');

  // ── Seeds ──────────────────────────────────────────────────────────────────
  const zoneCount = db.exec("SELECT COUNT(*) FROM zones")[0]?.values[0][0];
  if (!zoneCount) {
    db.run(`INSERT INTO zones VALUES (1,'Confort','Lo familiar y seguro.','#6366F1','🏠')`);
    db.run(`INSERT INTO zones VALUES (2,'Miedo','El umbral del riesgo.','#EF4444','⚡')`);
    db.run(`INSERT INTO zones VALUES (3,'Aprendizaje','Adquisición de habilidades.','#F59E0B','📚')`);
    db.run(`INSERT INTO zones VALUES (4,'Crecimiento','Metas cumplidas y expansión.','#10B981','🚀')`);
    db.run(`INSERT INTO sentiments(label,emoji) VALUES ('Energizado','⚡'),('Ansioso','😰'),('Orgulloso','😤'),('Satisfecho','😊'),('Retado','💪'),('Curioso','🔍'),('Vulnerable','🫀'),('Imparable','🔥')`);
    persist();
  }

  console.log('[DB] Equilibrium v1.3 ready at:', dbPath);
}

// ─── Helper ───────────────────────────────────────────────────────────────────
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
    ORDER BY a.timestamp DESC LIMIT 200
  `);
  return rowsToObjects(res);
});

ipcMain.handle('activities:create', (_e, data) => {
  db.run(
    `INSERT INTO activities
       (zona_id,descripcion,sentimiento_id,resistencia,habilidad,meta_cumplida,notas,mision_tipo,deadline)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [data.zona_id, data.descripcion, data.sentimiento_id||null, data.resistencia||null,
     data.habilidad||null, data.meta_cumplida||null, data.notas||null,
     data.mision_tipo||null, data.deadline||null]
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

ipcMain.handle('activities:complete', (_e, { id, xpMultiplier }) => {
  db.run(
    `UPDATE activities SET completada=1, completada_at=datetime('now'), streak_multiplier=? WHERE id=?`,
    [xpMultiplier || 1.0, id]
  );
  db.persist();
  return { success: true };
});

ipcMain.handle('activities:getMissions', () => {
  const res = db.exec(`
    SELECT a.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon,
           s.label AS sentimiento_label, s.emoji AS sentimiento_emoji
    FROM activities a
    JOIN zones z ON a.zona_id = z.id
    LEFT JOIN sentiments s ON a.sentimiento_id = s.id
    WHERE a.mision_tipo IS NOT NULL
    ORDER BY a.completada ASC, a.mision_tipo DESC, a.timestamp DESC
  `);
  return rowsToObjects(res);
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

ipcMain.handle('activities:getXP', () => {
  const res = db.exec(`
    SELECT
      COALESCE(SUM(CASE WHEN mision_tipo='principal' AND completada=1
        THEN CAST(ROUND(1000 * COALESCE(streak_multiplier,1.0)) AS INTEGER) ELSE 0 END),0) AS xp_principal,
      COALESCE(SUM(CASE WHEN mision_tipo='secundaria' AND completada=1
        THEN CAST(ROUND(100 * COALESCE(streak_multiplier,1.0)) AS INTEGER) ELSE 0 END),0) AS xp_secundaria,
      COALESCE(SUM(CASE WHEN mision_tipo='principal'  AND completada=0 THEN 1 ELSE 0 END),0) AS pendientes_principal,
      COALESCE(SUM(CASE WHEN mision_tipo='secundaria' AND completada=0 THEN 1 ELSE 0 END),0) AS pendientes_secundaria,
      COALESCE(SUM(CASE WHEN mision_tipo IS NOT NULL  AND completada=1 THEN 1 ELSE 0 END),0) AS total_completadas
    FROM activities
  `);
  return rowsToObjects(res)[0] || { xp_principal:0, xp_secundaria:0, pendientes_principal:0, pendientes_secundaria:0, total_completadas:0 };
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

ipcMain.handle('zones:getAll',      () => rowsToObjects(db.exec('SELECT * FROM zones ORDER BY id')));
ipcMain.handle('sentiments:getAll', () => rowsToObjects(db.exec('SELECT * FROM sentiments ORDER BY id')));

// ── Habits ────────────────────────────────────────────────────────────────────
ipcMain.handle('habits:getAll', () => {
  try {
    const habitsRes = db.exec(`
      SELECT h.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon
      FROM habits h
      LEFT JOIN zones z ON h.zona_id = z.id
      ORDER BY h.id DESC
    `);
    const habits = rowsToObjects(habitsRes);
    const logsRes = db.exec(`SELECT * FROM habit_logs ORDER BY completed_at DESC`);
    const logs = rowsToObjects(logsRes);
    return { habits, logs };
  } catch (err) {
    console.error('[DB] habits:getAll error:', err);
    return { habits: [], logs: [] };
  }
});

ipcMain.handle('habits:create', (_e, data) => {
  db.run(
    `INSERT INTO habits (title, description, frequency, zona_id) VALUES (?,?,?,?)`,
    [data.title, data.description || '', data.frequency, data.zona_id || null]
  );
  db.persist();
  const res = db.exec(`
    SELECT h.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon
    FROM habits h LEFT JOIN zones z ON h.zona_id = z.id
    WHERE h.id = (SELECT MAX(id) FROM habits)
  `);
  return rowsToObjects(res)[0];
});

ipcMain.handle('habits:delete', (_e, id) => {
  db.run(`DELETE FROM habits WHERE id=?`, [id]);
  db.run(`DELETE FROM habit_logs WHERE habit_id=?`, [id]);
  db.persist();
  return { success: true };
});

ipcMain.handle('habits:toggleLog', (_e, { habitId, periodKey }) => {
  const existing = db.exec(
    `SELECT id FROM habit_logs WHERE habit_id=? AND period_key=?`,
    [habitId, periodKey]
  );
  const rows = rowsToObjects(existing);
  if (rows.length > 0) {
    db.run(`DELETE FROM habit_logs WHERE habit_id=? AND period_key=?`, [habitId, periodKey]);
  } else {
    db.run(
      `INSERT INTO habit_logs (habit_id, period_key) VALUES (?,?)`,
      [habitId, periodKey]
    );
  }
  db.persist();
  const logsRes = db.exec(`SELECT * FROM habit_logs ORDER BY completed_at DESC`);
  return rowsToObjects(logsRes);
});

// ── Projects ──────────────────────────────────────────────────────────────────
ipcMain.handle('projects:getAll', () => {
  try {
    const projectsRes = db.exec(`
      SELECT p.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon
      FROM projects p
      LEFT JOIN zones z ON p.zona_id = z.id
      ORDER BY p.id DESC
    `);
    const projects = rowsToObjects(projectsRes);
    const subtasksRes = db.exec(`SELECT * FROM project_subtasks ORDER BY id ASC`);
    const allSubtasks = rowsToObjects(subtasksRes);

    const subtaskMap = {};
    allSubtasks.forEach(s => {
      if (!subtaskMap[s.project_id]) subtaskMap[s.project_id] = [];
      subtaskMap[s.project_id].push(s);
    });

    return projects.map(p => ({
      ...p,
      subtasks: subtaskMap[p.id] || []
    }));
  } catch (err) {
    console.error('[DB] projects:getAll error:', err);
    return [];
  }
});

ipcMain.handle('projects:create', (_e, data) => {
  db.run(
    `INSERT INTO projects (title, description, zona_id) VALUES (?,?,?)`,
    [data.title, data.description || '', data.zona_id || null]
  );
  db.persist();
  const res = db.exec(`SELECT MAX(id) as id FROM projects`);
  const newId = rowsToObjects(res)[0]?.id;

  if (data.initialSubtasks && Array.isArray(data.initialSubtasks)) {
    data.initialSubtasks.forEach(st => {
      if (st.trim()) {
        db.run(`INSERT INTO project_subtasks (project_id, title) VALUES (?,?)`, [newId, st.trim()]);
      }
    });
    db.persist();
  }

  const projRes = db.exec(`
    SELECT p.*, z.name AS zona_name, z.color AS zona_color, z.icon AS zona_icon
    FROM projects p LEFT JOIN zones z ON p.zona_id = z.id WHERE p.id=?
  `, [newId]);
  const proj = rowsToObjects(projRes)[0];
  const subtasksRes = db.exec(`SELECT * FROM project_subtasks WHERE project_id=?`, [newId]);
  proj.subtasks = rowsToObjects(subtasksRes);
  return proj;
});

ipcMain.handle('projects:delete', (_e, id) => {
  db.run(`DELETE FROM projects WHERE id=?`, [id]);
  db.run(`DELETE FROM project_subtasks WHERE project_id=?`, [id]);
  db.persist();
  return { success: true };
});

ipcMain.handle('projects:complete', (_e, id) => {
  db.run(
    `UPDATE projects SET status='completado', completed_at=datetime('now') WHERE id=?`,
    [id]
  );
  db.persist();
  return { success: true };
});

ipcMain.handle('projects:reopen', (_e, id) => {
  db.run(
    `UPDATE projects SET status='activo', completed_at=NULL WHERE id=?`,
    [id]
  );
  db.persist();
  return { success: true };
});

ipcMain.handle('projects:addSubtask', (_e, { projectId, title }) => {
  db.run(`INSERT INTO project_subtasks (project_id, title) VALUES (?,?)`, [projectId, title]);
  db.persist();
  const res = db.exec(`SELECT * FROM project_subtasks WHERE project_id=? ORDER BY id ASC`, [projectId]);
  return rowsToObjects(res);
});

ipcMain.handle('projects:toggleSubtask', (_e, { subtaskId, completed, projectId }) => {
  db.run(`UPDATE project_subtasks SET completed=? WHERE id=?`, [completed ? 1 : 0, subtaskId]);
  db.persist();
  const res = db.exec(`SELECT * FROM project_subtasks WHERE project_id=? ORDER BY id ASC`, [projectId]);
  return rowsToObjects(res);
});

ipcMain.handle('projects:deleteSubtask', (_e, { subtaskId, projectId }) => {
  db.run(`DELETE FROM project_subtasks WHERE id=?`, [subtaskId]);
  db.persist();
  const res = db.exec(`SELECT * FROM project_subtasks WHERE project_id=? ORDER BY id ASC`, [projectId]);
  return rowsToObjects(res);
});

// ─── Data Export / Import JSON ─────────────────────────────────────────────
ipcMain.handle('data:export', () => {
  try {
    const activities   = rowsToObjects(db.exec('SELECT * FROM activities'));
    const achievements = rowsToObjects(db.exec('SELECT * FROM achievements'));
    const habits       = rowsToObjects(db.exec('SELECT * FROM habits'));
    const habit_logs   = rowsToObjects(db.exec('SELECT * FROM habit_logs'));
    const projects     = rowsToObjects(db.exec('SELECT * FROM projects'));
    const subtasks     = rowsToObjects(db.exec('SELECT * FROM project_subtasks'));

    return {
      version: '1.3',
      exportedAt: new Date().toISOString(),
      activities,
      achievements,
      habits,
      habit_logs,
      projects,
      project_subtasks: subtasks
    };
  } catch (err) {
    console.error('[DB] data:export error:', err);
    throw err;
  }
});

ipcMain.handle('data:import', (_e, payload) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Formato de datos JSON inválido');
    }

    const { activities, achievements, habits, habit_logs, projects, project_subtasks } = payload;

    // Clear existing user data (zones & sentiments remain as preset defaults)
    db.run('DELETE FROM activities');
    db.run('DELETE FROM achievements');
    db.run('DELETE FROM habits');
    db.run('DELETE FROM habit_logs');
    db.run('DELETE FROM projects');
    db.run('DELETE FROM project_subtasks');

    // Import activities
    if (Array.isArray(activities)) {
      activities.forEach(a => {
        db.run(
          `INSERT INTO activities (id, zona_id, descripcion, sentimiento_id, resistencia, habilidad, meta_cumplida, notas, mision_tipo, completada, completada_at, timestamp, created_at, deadline, streak_multiplier)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [a.id, a.zona_id, a.descripcion, a.sentimiento_id||null, a.resistencia||null, a.habilidad||null, a.meta_cumplida||null, a.notas||null, a.mision_tipo||null, a.completada||0, a.completada_at||null, a.timestamp||Math.floor(Date.now()/1000), a.created_at||new Date().toISOString(), a.deadline||null, a.streak_multiplier||1.0]
        );
      });
    }

    // Import achievements
    if (Array.isArray(achievements)) {
      achievements.forEach(ach => {
        db.run(`INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?,?)`, [ach.id, ach.unlocked_at || new Date().toISOString()]);
      });
    }

    // Import habits
    if (Array.isArray(habits)) {
      habits.forEach(h => {
        db.run(`INSERT INTO habits (id, title, description, frequency, zona_id, created_at) VALUES (?,?,?,?,?,?)`,
          [h.id, h.title, h.description||'', h.frequency, h.zona_id||null, h.created_at||new Date().toISOString()]);
      });
    }

    // Import habit logs
    if (Array.isArray(habit_logs)) {
      habit_logs.forEach(hl => {
        db.run(`INSERT INTO habit_logs (id, habit_id, period_key, completed_at) VALUES (?,?,?,?)`,
          [hl.id, hl.habit_id, hl.period_key, hl.completed_at||new Date().toISOString()]);
      });
    }

    // Import projects
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        db.run(`INSERT INTO projects (id, title, description, zona_id, status, completed_at, created_at) VALUES (?,?,?,?,?,?,?)`,
          [p.id, p.title, p.description||'', p.zona_id||null, p.status||'activo', p.completed_at||null, p.created_at||new Date().toISOString()]);
      });
    }

    // Import project subtasks
    if (Array.isArray(project_subtasks)) {
      project_subtasks.forEach(st => {
        db.run(`INSERT INTO project_subtasks (id, project_id, title, completed, created_at) VALUES (?,?,?,?,?)`,
          [st.id, st.project_id, st.title, st.completed||0, st.created_at||new Date().toISOString()]);
      });
    }

    db.persist();
    return { success: true };
  } catch (err) {
    console.error('[DB] data:import error:', err);
    throw err;
  }
});

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
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
