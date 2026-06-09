import express from 'express';
import { getOne, getAll, run } from '../database.js';

const router = express.Router();

function parseField(field) {
  if (!field) return null;
  return {
    ...field,
    config: field.config ? JSON.parse(field.config) : {},
    required: Boolean(field.required)
  };
}

function parseValue(value) {
  if (!value) return null;
  let parsed = value.value;
  try {
    parsed = JSON.parse(value.value);
  } catch {
    // keep as string
  }
  return { ...value, parsed };
}

// Field Groups
router.get('/groups', (req, res) => {
  const groups = getAll('SELECT * FROM acf_groups ORDER BY sort_order ASC, id ASC');
  res.json(groups);
});

router.get('/groups/:id', (req, res) => {
  const group = getOne('SELECT * FROM acf_groups WHERE id = ?', [req.params.id]);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json(group);
});

router.post('/groups', (req, res) => {
  const { name, slug, description, location, sort_order } = req.body;
  const result = run(
    `INSERT INTO acf_groups (name, slug, description, location, sort_order) VALUES (?, ?, ?, ?, ?)`,
    [name, slug, description || '', location || 'homepage', sort_order || 0]
  );
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/groups/:id', (req, res) => {
  const { name, slug, description, location, sort_order } = req.body;
  run(
    `UPDATE acf_groups SET name = ?, slug = ?, description = ?, location = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name, slug, description || '', location || 'homepage', sort_order || 0, req.params.id]
  );
  res.json({ id: parseInt(req.params.id), ...req.body });
});

router.delete('/groups/:id', (req, res) => {
  const fields = getAll('SELECT id FROM acf_fields WHERE group_id = ?', [req.params.id]);
  fields.forEach(f => run('DELETE FROM acf_values WHERE field_id = ?', [f.id]));
  run('DELETE FROM acf_fields WHERE group_id = ?', [req.params.id]);
  run('DELETE FROM acf_groups WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Fields within a group
router.get('/groups/:groupId/fields', (req, res) => {
  const fields = getAll(
    'SELECT * FROM acf_fields WHERE group_id = ? ORDER BY sort_order ASC, id ASC',
    [req.params.groupId]
  );
  res.json(fields.map(parseField));
});

router.get('/fields/:id', (req, res) => {
  const field = getOne('SELECT * FROM acf_fields WHERE id = ?', [req.params.id]);
  if (!field) return res.status(404).json({ error: 'Field not found' });
  res.json(parseField(field));
});

router.post('/fields', (req, res) => {
  const { group_id, name, label, type, config, sort_order, required } = req.body;
  const result = run(
    `INSERT INTO acf_fields (group_id, name, label, type, config, sort_order, required) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [group_id, name, label, type, JSON.stringify(config || {}), sort_order || 0, required ? 1 : 0]
  );
  res.json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/fields/:id', (req, res) => {
  const { group_id, name, label, type, config, sort_order, required } = req.body;
  run(
    `UPDATE acf_fields SET group_id = ?, name = ?, label = ?, type = ?, config = ?, sort_order = ?, required = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [group_id, name, label, type, JSON.stringify(config || {}), sort_order || 0, required ? 1 : 0, req.params.id]
  );
  res.json({ id: parseInt(req.params.id), ...req.body });
});

router.delete('/fields/:id', (req, res) => {
  run('DELETE FROM acf_values WHERE field_id = ?', [req.params.id]);
  run('DELETE FROM acf_fields WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Field Values
router.get('/values', (req, res) => {
  const { location } = req.query;
  let query = `
    SELECT v.*, f.name as field_name, f.label as field_label, f.type as field_type, f.config as field_config,
           g.slug as group_slug, g.name as group_name, g.location
    FROM acf_values v
    JOIN acf_fields f ON v.field_id = f.id
    JOIN acf_groups g ON f.group_id = g.id
    WHERE 1=1
  `;
  const params = [];

  if (location) {
    query += ' AND g.location = ?';
    params.push(location);
  }

  query += ' ORDER BY g.sort_order ASC, f.sort_order ASC';

  const rows = getAll(query, params);
  const result = rows.map(row => {
    let value = row.value;
    try { value = JSON.parse(row.value); } catch { /* string */ }
    return {
      id: row.id,
      field_id: row.field_id,
      field_name: row.field_name,
      field_label: row.field_label,
      field_type: row.field_type,
      field_config: row.field_config ? JSON.parse(row.field_config) : {},
      group_slug: row.group_slug,
      group_name: row.group_name,
      location: row.location,
      value
    };
  });

  res.json(result);
});

router.get('/values/structured', (req, res) => {
  const { location } = req.query;
  let query = `
    SELECT v.*, f.name as field_name, f.label as field_label, f.type as field_type, f.config as field_config,
           g.slug as group_slug, g.name as group_name, g.location
    FROM acf_values v
    JOIN acf_fields f ON v.field_id = f.id
    JOIN acf_groups g ON f.group_id = g.id
    WHERE 1=1
  `;
  const params = [];

  if (location) {
    query += ' AND g.location = ?';
    params.push(location);
  }

  const rows = getAll(query, params);
  const structured = {};

  rows.forEach(row => {
    if (!structured[row.location]) structured[row.location] = {};
    if (!structured[row.location][row.group_slug]) {
      structured[row.location][row.group_slug] = { _meta: { name: row.group_name } };
    }
    let value = row.value;
    try { value = JSON.parse(row.value); } catch { /* string */ }
    structured[row.location][row.group_slug][row.field_name] = {
      label: row.field_label,
      type: row.field_type,
      value
    };
  });

  res.json(structured);
});

router.post('/values', (req, res) => {
  const { field_id, value } = req.body;
  const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');

  const existing = getOne('SELECT id FROM acf_values WHERE field_id = ?', [field_id]);
  if (existing) {
    run(`UPDATE acf_values SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE field_id = ?`, [serialized, field_id]);
    res.json({ id: existing.id, field_id, value });
  } else {
    const result = run(`INSERT INTO acf_values (field_id, value) VALUES (?, ?)`, [field_id, serialized]);
    res.json({ id: result.lastInsertRowid, field_id, value });
  }
});

router.put('/values/bulk', (req, res) => {
  const { values } = req.body;
  if (!Array.isArray(values)) return res.status(400).json({ error: 'values array required' });

  values.forEach(({ field_id, value }) => {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    const existing = getOne('SELECT id FROM acf_values WHERE field_id = ?', [field_id]);
    if (existing) {
      run(`UPDATE acf_values SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE field_id = ?`, [serialized, field_id]);
    } else {
      run(`INSERT INTO acf_values (field_id, value) VALUES (?, ?)`, [field_id, serialized]);
    }
  });

  res.json({ success: true });
});

router.delete('/values/:id', (req, res) => {
  run('DELETE FROM acf_values WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
