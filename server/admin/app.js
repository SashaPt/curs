const API = '/api/content';
const ACF_API = '/api/acf';
const MEDIA_API = '/api/media';

let currentSection = 'dashboard';
let currentImageCallback = null;
let currentImageFieldName = null;
let pendingFile = null;
let currencySettings = { code: 'IDR', symbol: 'Rp', locale: 'id-ID', decimals: 0 };
let currencyList = [];

const CURRENCIES = {
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', label: 'Индонезийская рупия (Rp)', decimals: 0 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'Доллар США ($)', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', label: 'Евро (€)', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', locale: 'ru-RU', label: 'Российский рубль (₽)', decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'Фунт стерлингов (£)', decimals: 2 }
};

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'textarea', label: 'Текстовая область' },
  { value: 'number', label: 'Число' },
  { value: 'url', label: 'URL' },
  { value: 'image', label: 'Изображение' },
  { value: 'repeater', label: 'Повторитель' }
];

const LOCATIONS = [
  { value: 'homepage', label: 'Главная страница' },
  { value: 'shop', label: 'Магазин' },
  { value: 'global', label: 'Глобально' }
];

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  setupNavigation();
  setupModals();
  setupMediaUpload();
  await loadCurrencySettings();
  loadSection('dashboard');
}

async function loadCurrencySettings() {
  try {
    const data = await fetch(`${API}/settings/currency`).then(r => r.json());
    currencySettings = {
      code: data.code,
      symbol: data.symbol,
      locale: data.locale,
      decimals: data.decimals ?? 0
    };
    currencyList = data.currencies || Object.values(CURRENCIES);
  } catch {
    currencyList = Object.values(CURRENCIES);
  }
}

function formatPrice(amount) {
  if (amount == null || amount === '') return '—';
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  const formatted = num.toLocaleString(currencySettings.locale, {
    minimumFractionDigits: currencySettings.decimals,
    maximumFractionDigits: currencySettings.decimals
  });
  return `${currencySettings.symbol} ${formatted}`;
}

function priceInputStep() {
  return currencySettings.decimals === 0 ? '1' : '0.01';
}

function setupNavigation() {
  document.querySelectorAll('.menu-top[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.menu-top').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      loadSection(item.dataset.section);
    });
  });
}

function setupModals() {
  document.querySelectorAll('.wp-modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });
  document.querySelectorAll('.wp-modal-backdrop').forEach(el => {
    el.addEventListener('click', closeModals);
  });
  document.getElementById('edit-form').addEventListener('submit', handleFormSubmit);
}

function closeModals() {
  const imageModalOpen = document.getElementById('image-modal')?.classList.contains('active');
  document.querySelectorAll('.wp-modal').forEach(m => m.classList.remove('active'));
  if (imageModalOpen) resetUploadModal();
}

function resetUploadModal() {
  pendingFile = null;
  currentImageCallback = null;
  currentImageFieldName = null;

  const fileInput = document.getElementById('image-file-input');
  const dropZone = document.getElementById('drop-zone');
  const placeholder = document.getElementById('drop-zone-placeholder');
  const preview = document.getElementById('drop-zone-preview');
  const uploadBtn = document.getElementById('upload-btn');

  if (fileInput) fileInput.value = '';
  if (placeholder) placeholder.hidden = false;
  if (preview) preview.hidden = true;
  if (dropZone) dropZone.classList.remove('has-preview', 'dragover');
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Загрузить';
  }
}

function showNotice(message, type = 'success') {
  const el = document.getElementById('wp-notices');
  el.innerHTML = `<div class="notice notice-${type}"><p>${message}</p></div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

function setHeader(title, actionsHtml = '') {
  document.getElementById('page-title').textContent = title;
  document.getElementById('header-actions').innerHTML = actionsHtml;
}

async function loadSection(section) {
  currentSection = section;
  const area = document.getElementById('content-area');
  document.getElementById('wp-notices').innerHTML = '';

  const loaders = {
    dashboard: loadDashboard,
    products: loadProducts,
    categories: loadCategories,
    'acf-groups': loadAcfGroups,
    'acf-content': loadAcfContent,
    media: loadMedia,
    features: loadFeatures,
    footer: loadFooter,
    settings: loadSettings
  };

  const titles = {
    dashboard: 'Консоль',
    products: 'Товары',
    categories: 'Категории',
    'acf-groups': 'Группы полей',
    'acf-content': 'Контент страниц',
    media: 'Медиатека',
    features: 'Преимущества',
    footer: 'Подвал',
    settings: 'Настройки'
  };

  setHeader(titles[section] || section);
  if (loaders[section]) await loaders[section](area);
}

// ─── Dashboard ───
async function loadDashboard(area) {
  const [products, categories, groups] = await Promise.all([
    fetch(`${API}/products`).then(r => r.json()),
    fetch(`${API}/categories`).then(r => r.json()),
    fetch(`${ACF_API}/groups`).then(r => r.json())
  ]);

  area.innerHTML = `
    <div class="dashboard-widgets">
      <div class="dashboard-widget"><h3>Товары</h3><div class="stat-value">${products.length}</div></div>
      <div class="dashboard-widget"><h3>Категории</h3><div class="stat-value">${categories.length}</div></div>
      <div class="dashboard-widget"><h3>Группы полей</h3><div class="stat-value">${groups.length}</div></div>
    </div>
    <table class="wp-list-table">
      <thead><tr><th>Товар</th><th>Цена</th><th>Категория</th><th>Статус</th></tr></thead>
      <tbody>${products.slice(0, 5).map(p => `
        <tr>
          <td>${esc(p.name)}</td>
          <td>${formatPrice(p.price)}</td>
          <td>${esc(p.category)}</td>
          <td>${p.is_featured ? '<span class="badge badge-success">Featured</span>' : ''} ${p.is_new ? '<span class="badge badge-warning">New</span>' : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ─── Products ───
async function loadProducts(area) {
  setHeader('Товары', '<button class="button button-primary" onclick="openProductModal()">Добавить товар</button>');
  const products = await fetch(`${API}/products`).then(r => r.json());

  area.innerHTML = `
    <table class="wp-list-table">
      <thead><tr>
        <th class="column-thumb">Фото</th><th>Название</th><th>Цена</th><th>Категория</th><th>Статус</th><th class="column-actions">Действия</th>
      </tr></thead>
      <tbody>${products.map(p => `
        <tr>
          <td><img src="${imgSrc(p.image)}" class="table-thumb" alt=""></td>
          <td><strong>${esc(p.name)}</strong><br><small>${esc(p.slug)}</small></td>
          <td>${formatPrice(p.price)}${p.original_price ? ` <s>${formatPrice(p.original_price)}</s>` : ''}</td>
          <td>${esc(p.category)}</td>
          <td>
            ${p.is_featured ? '<span class="badge badge-success">Featured</span> ' : ''}
            ${p.is_new ? '<span class="badge badge-warning">New</span> ' : ''}
            ${!p.in_stock ? '<span class="badge badge-secondary">Нет в наличии</span>' : ''}
          </td>
          <td class="column-actions">
            <button class="button button-small" onclick="openProductModal(${p.id})">Изменить</button>
            <button class="button button-small button-danger" onclick="deleteItem('products', ${p.id})">Удалить</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

window.openProductModal = async function(id) {
  const categories = await fetch(`${API}/categories`).then(r => r.json());
  let data = {};
  if (id) data = await fetch(`${API}/products/id/${id}`).then(r => r.json());

  const catOptions = categories.map(c =>
    `<option value="${esc(c.slug)}" ${data.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`
  ).join('');

  openModal(data.id ? 'Редактировать товар' : 'Добавить товар', `
    <input type="hidden" name="form_type" value="product">
    <input type="hidden" name="id" value="${data.id || ''}">
    <table class="form-table">
      <tr><th><label>Название</label></th><td><input type="text" name="name" value="${esc(data.name)}" required></td></tr>
      <tr><th><label>Slug</label></th><td><input type="text" name="slug" value="${esc(data.slug)}" required></td></tr>
      <tr><th><label>Описание</label></th><td><textarea name="description">${esc(data.description)}</textarea></td></tr>
      <tr><th><label>Цена (${esc(currencySettings.symbol)})</label></th><td>
        <input type="number" name="price" value="${data.price || 0}" step="${priceInputStep()}" min="0" required>
        <p class="description">Валюта: ${esc(currencySettings.code)} — ${formatPrice(data.price || 0)}</p>
      </td></tr>
      <tr><th><label>Старая цена (${esc(currencySettings.symbol)})</label></th><td>
        <input type="number" name="original_price" value="${data.original_price || ''}" step="${priceInputStep()}" min="0">
        <p class="description">Для отображения скидки (необязательно)</p>
      </td></tr>
      <tr><th><label>Категория</label></th><td><select name="category" required>${catOptions}</select></td></tr>
      <tr><th><label>Изображение</label></th><td>${imageFieldHtml('image', data.image)}</td></tr>
      <tr><th>Флаги</th><td>
        <label class="toggle-label"><input type="checkbox" name="is_featured" ${data.is_featured ? 'checked' : ''}> Featured</label><br>
        <label class="toggle-label"><input type="checkbox" name="is_new" ${data.is_new ? 'checked' : ''}> New</label><br>
        <label class="toggle-label"><input type="checkbox" name="in_stock" ${data.in_stock !== 0 && data.in_stock !== false ? 'checked' : ''}> В наличии</label>
      </td></tr>
    </table>`);
};

// ─── Categories ───
async function loadCategories(area) {
  setHeader('Категории', '<button class="button button-primary" onclick="openCategoryModal()">Добавить категорию</button>');
  const categories = await fetch(`${API}/categories`).then(r => r.json());

  area.innerHTML = `
    <table class="wp-list-table">
      <thead><tr><th class="column-thumb">Фото</th><th>Название</th><th>Slug</th><th>Описание</th><th class="column-actions">Действия</th></tr></thead>
      <tbody>${categories.map(c => `
        <tr>
          <td>${c.image ? `<img src="${imgSrc(c.image)}" class="table-thumb" alt="">` : '—'}</td>
          <td><strong>${esc(c.name)}</strong></td>
          <td>${esc(c.slug)}</td>
          <td>${esc(c.description || '')}</td>
          <td class="column-actions">
            <button class="button button-small" onclick="openCategoryModal(${c.id})">Изменить</button>
            <button class="button button-small button-danger" onclick="deleteItem('categories', ${c.id})">Удалить</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

window.openCategoryModal = async function(id) {
  let data = {};
  if (id) data = await fetch(`${API}/categories/id/${id}`).then(r => r.json());

  openModal(data.id ? 'Редактировать категорию' : 'Добавить категорию', `
    <input type="hidden" name="form_type" value="category">
    <input type="hidden" name="id" value="${data.id || ''}">
    <table class="form-table">
      <tr><th><label>Название</label></th><td><input type="text" name="name" value="${esc(data.name)}" required></td></tr>
      <tr><th><label>Slug</label></th><td><input type="text" name="slug" value="${esc(data.slug)}" required></td></tr>
      <tr><th><label>Описание</label></th><td><textarea name="description">${esc(data.description)}</textarea></td></tr>
      <tr><th><label>Изображение</label></th><td>${imageFieldHtml('image', data.image)}</td></tr>
      <tr><th><label>Порядок</label></th><td><input type="number" name="sort_order" value="${data.sort_order || 0}"></td></tr>
    </table>`);
};

// ─── ACF Groups ───
async function loadAcfGroups(area) {
  setHeader('Группы полей', '<button class="button button-primary" onclick="openGroupModal()">Добавить группу</button>');
  const groups = await fetch(`${ACF_API}/groups`).then(r => r.json());

  if (!groups.length) {
    area.innerHTML = '<div class="empty-state"><p>Нет групп полей. Создайте первую группу.</p></div>';
    return;
  }

  let html = '';
  for (const group of groups) {
    const fields = await fetch(`${ACF_API}/groups/${group.id}/fields`).then(r => r.json());
    html += `
      <div class="postbox">
        <div class="postbox-header">
          <h2>${esc(group.name)} <small style="font-weight:normal;color:#646970;">(${esc(group.location)})</small></h2>
          <div>
            <button class="button button-small" onclick="openFieldModal(${group.id})">+ Поле</button>
            <button class="button button-small" onclick="openGroupModal(${group.id})">Изменить</button>
            <button class="button button-small button-danger" onclick="deleteAcfGroup(${group.id})">Удалить</button>
          </div>
        </div>
        <div class="postbox-body">
          ${fields.length ? `<table class="wp-list-table">
            <thead><tr><th>Метка</th><th>Имя</th><th>Тип</th><th class="column-actions">Действия</th></tr></thead>
            <tbody>${fields.map(f => `
              <tr>
                <td>${esc(f.label)}${f.required ? ' <span class="badge badge-warning">*</span>' : ''}</td>
                <td><code>${esc(f.name)}</code></td>
                <td><span class="field-type-badge">${esc(f.type)}</span></td>
                <td class="column-actions">
                  <button class="button button-small" onclick="openFieldModal(${group.id}, ${f.id})">Изменить</button>
                  <button class="button button-small button-danger" onclick="deleteAcfField(${f.id})">Удалить</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>` : '<p class="description">Нет полей в этой группе.</p>'}
        </div>
      </div>`;
  }
  area.innerHTML = html;
}

window.openGroupModal = async function(id) {
  let data = {};
  if (id) data = await fetch(`${ACF_API}/groups/${id}`).then(r => r.json());

  const locOptions = LOCATIONS.map(l =>
    `<option value="${l.value}" ${data.location === l.value ? 'selected' : ''}>${l.label}</option>`
  ).join('');

  openModal(data.id ? 'Редактировать группу' : 'Добавить группу', `
    <input type="hidden" name="form_type" value="acf_group">
    <input type="hidden" name="id" value="${data.id || ''}">
    <table class="form-table">
      <tr><th><label>Название</label></th><td><input type="text" name="name" value="${esc(data.name)}" required></td></tr>
      <tr><th><label>Slug</label></th><td><input type="text" name="slug" value="${esc(data.slug)}" required></td></tr>
      <tr><th><label>Описание</label></th><td><textarea name="description">${esc(data.description)}</textarea></td></tr>
      <tr><th><label>Расположение</label></th><td><select name="location">${locOptions}</select></td></tr>
      <tr><th><label>Порядок</label></th><td><input type="number" name="sort_order" value="${data.sort_order || 0}"></td></tr>
    </table>`);
};

window.openFieldModal = async function(groupId, fieldId) {
  let data = { group_id: groupId, type: 'text', config: { sub_fields: [] } };
  if (fieldId) data = await fetch(`${ACF_API}/fields/${fieldId}`).then(r => r.json());

  const typeOptions = FIELD_TYPES.map(t =>
    `<option value="${t.value}" ${data.type === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');

  const subFields = data.config?.sub_fields || [];

  openModal(fieldId ? 'Редактировать поле' : 'Добавить поле', `
    <input type="hidden" name="form_type" value="acf_field">
    <input type="hidden" name="id" value="${data.id || ''}">
    <input type="hidden" name="group_id" value="${groupId}">
    <table class="form-table">
      <tr><th><label>Метка</label></th><td><input type="text" name="label" value="${esc(data.label)}" required></td></tr>
      <tr><th><label>Имя поля</label></th><td><input type="text" name="name" value="${esc(data.name)}" required pattern="[a-z0-9_]+"><p class="description">Только латиница, цифры и _</p></td></tr>
      <tr><th><label>Тип</label></th><td><select name="type" id="field-type-select" onchange="toggleSubFields()">${typeOptions}</select></td></tr>
      <tr><th><label>Обязательное</label></th><td><label class="toggle-label"><input type="checkbox" name="required" ${data.required ? 'checked' : ''}> Да</label></td></tr>
      <tr><th><label>Порядок</label></th><td><input type="number" name="sort_order" value="${data.sort_order || 0}"></td></tr>
      <tr id="sub-fields-row" style="display:${data.type === 'repeater' ? '' : 'none'}">
        <th><label>Подполя</label></th>
        <td>
          <div class="sub-fields-editor" id="sub-fields-container">
            ${subFields.map((sf, i) => subFieldRowHtml(sf, i)).join('')}
          </div>
          <button type="button" class="button button-small" onclick="addSubField()">+ Подполе</button>
        </td>
      </tr>
    </table>`);
};

window.toggleSubFields = function() {
  const type = document.getElementById('field-type-select').value;
  document.getElementById('sub-fields-row').style.display = type === 'repeater' ? '' : 'none';
};

window.addSubField = function() {
  const container = document.getElementById('sub-fields-container');
  const idx = container.children.length;
  container.insertAdjacentHTML('beforeend', subFieldRowHtml({ name: '', label: '', type: 'text' }, idx));
};

function subFieldRowHtml(sf, i) {
  return `<div class="sub-field-row" data-idx="${i}">
    <input type="text" name="sub_label_${i}" value="${esc(sf.label)}" placeholder="Метка">
    <input type="text" name="sub_name_${i}" value="${esc(sf.name)}" placeholder="Имя">
    <select name="sub_type_${i}">
      <option value="text" ${sf.type === 'text' ? 'selected' : ''}>Текст</option>
      <option value="image" ${sf.type === 'image' ? 'selected' : ''}>Изображение</option>
    </select>
    <button type="button" class="button button-small button-danger" onclick="this.parentElement.remove()">×</button>
  </div>`;
}

window.deleteAcfGroup = async function(id) {
  if (!confirm('Удалить группу и все её поля?')) return;
  await fetch(`${ACF_API}/groups/${id}`, { method: 'DELETE' });
  showNotice('Группа удалена');
  loadSection('acf-groups');
};

window.deleteAcfField = async function(id) {
  if (!confirm('Удалить поле?')) return;
  await fetch(`${ACF_API}/fields/${id}`, { method: 'DELETE' });
  showNotice('Поле удалено');
  loadSection('acf-groups');
};

// ─── ACF Content Editor ───
async function loadAcfContent(area) {
  setHeader('Контент страниц');

  const tabs = LOCATIONS.map(l =>
    `<button class="nav-tab ${l.value === 'homepage' ? 'nav-tab-active' : ''}" data-location="${l.value}" onclick="switchContentTab('${l.value}', this)">${l.label}</button>`
  ).join('');

  area.innerHTML = `<div class="nav-tab-wrapper">${tabs}</div><div id="acf-content-editor"></div>`;
  await renderAcfContentEditor('homepage');
}

window.switchContentTab = async function(location, btn) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('nav-tab-active'));
  btn.classList.add('nav-tab-active');
  await renderAcfContentEditor(location);
};

async function renderAcfContentEditor(location) {
  const editor = document.getElementById('acf-content-editor');
  const groups = await fetch(`${ACF_API}/groups`).then(r => r.json());
  const locationGroups = groups.filter(g => g.location === location);

  if (!locationGroups.length) {
    editor.innerHTML = `<div class="empty-state"><p>Нет групп полей для «${location}». <a href="#" onclick="document.querySelector('[data-section=acf-groups]').click();return false;">Создать группу</a></p></div>`;
    return;
  }

  const values = await fetch(`${ACF_API}/values?location=${location}`).then(r => r.json());
  const valueMap = Object.fromEntries(values.map(v => [v.field_id, v.value]));

  let html = `<form id="acf-content-form"><input type="hidden" name="form_type" value="acf_content">`;

  for (const group of locationGroups) {
    const fields = await fetch(`${ACF_API}/groups/${group.id}/fields`).then(r => r.json());
    html += `<div class="postbox"><div class="postbox-header"><h2>${esc(group.name)}</h2></div><div class="postbox-body"><table class="form-table">`;

    for (const field of fields) {
      const val = valueMap[field.id];
      html += `<tr><th><label>${esc(field.label)}</label></th><td>${renderFieldInput(field, val)}</td></tr>`;
    }

    html += `</table></div></div>`;
  }

  html += `<p><button type="submit" class="button button-primary">Сохранить контент</button></p></form>`;
  editor.innerHTML = html;

  document.getElementById('acf-content-form').addEventListener('submit', handleAcfContentSubmit);
  bindRepeaterEvents(editor);
}

function renderFieldInput(field, value) {
  const name = `field_${field.id}`;
  switch (field.type) {
    case 'textarea':
      return `<textarea name="${name}" rows="4">${esc(typeof value === 'string' ? value : '')}</textarea>`;
    case 'number':
      return `<input type="number" name="${name}" value="${value ?? ''}">`;
    case 'url':
      return `<input type="url" name="${name}" value="${esc(typeof value === 'string' ? value : '')}">`;
    case 'image': {
      const imgVal = typeof value === 'object' ? value : { path: value || '', fallback: value || '' };
      return imageFieldHtml(name, imgVal, true);
    }
    case 'repeater':
      return renderRepeaterInput(field, value);
    default:
      return `<input type="text" name="${name}" value="${esc(typeof value === 'string' ? value : (value ?? ''))}">`;
  }
}

function renderRepeaterInput(field, value) {
  const rows = Array.isArray(value) ? value : [];
  const subFields = field.config?.sub_fields || [];
  const id = `repeater_${field.id}`;

  let html = `<div class="repeater-rows" id="${id}" data-field-id="${field.id}">`;
  rows.forEach((row, i) => { html += repeaterRowHtml(field.id, subFields, row, i); });
  html += `</div><button type="button" class="button button-small" onclick="addRepeaterRow(${field.id})">+ Добавить строку</button>`;
  return html;
}

function repeaterRowHtml(fieldId, subFields, row, idx) {
  let html = `<div class="repeater-row" data-idx="${idx}">
    <div class="repeater-row-header"><span>Строка ${idx + 1}</span>
      <button type="button" class="button button-small button-danger" onclick="this.closest('.repeater-row').remove()">Удалить</button>
    </div>`;

  subFields.forEach(sf => {
    const val = row?.[sf.name];
    const inputName = `repeater_${fieldId}_${idx}_${sf.name}`;
    html += `<div class="repeater-sub-field"><label>${esc(sf.label)}</label>`;
    if (sf.type === 'image') {
      const imgVal = typeof val === 'object' ? val : { path: val || '', fallback: val || '' };
      html += imageFieldHtml(inputName, imgVal, true);
    } else {
      html += `<input type="text" name="${inputName}" value="${esc(typeof val === 'string' ? val : '')}">`;
    }
    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

window.addRepeaterRow = async function(fieldId) {
  const field = await fetch(`${ACF_API}/fields/${fieldId}`).then(r => r.json());
  const container = document.getElementById(`repeater_${fieldId}`);
  const idx = container.querySelectorAll('.repeater-row').length;
  container.insertAdjacentHTML('beforeend', repeaterRowHtml(fieldId, field.config?.sub_fields || [], {}, idx));
};

function bindRepeaterEvents() { /* events bound inline */ }

async function handleAcfContentSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const groups = await fetch(`${ACF_API}/groups`).then(r => r.json());
  const location = document.querySelector('.nav-tab-active')?.dataset.location || 'homepage';
  const locationGroups = groups.filter(g => g.location === location);
  const values = [];

  for (const group of locationGroups) {
    const fields = await fetch(`${ACF_API}/groups/${group.id}/fields`).then(r => r.json());
    for (const field of fields) {
      let value;
      if (field.type === 'repeater') {
        value = collectRepeaterValue(form, field);
      } else if (field.type === 'image') {
        value = collectImageValue(form, `field_${field.id}`);
      } else {
        const input = form.querySelector(`[name="field_${field.id}"]`);
        value = input?.value ?? '';
        if (field.type === 'number') value = parseFloat(value) || 0;
      }
      values.push({ field_id: field.id, value });
    }
  }

  await fetch(`${ACF_API}/values/bulk`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });

  showNotice('Контент сохранён');
  await renderAcfContentEditor(location);
}

function collectRepeaterValue(form, field) {
  const container = document.getElementById(`repeater_${field.id}`);
  if (!container) return [];
  const subFields = field.config?.sub_fields || [];
  const rows = container.querySelectorAll('.repeater-row');
  const result = [];

  rows.forEach((rowEl) => {
    const idx = rowEl.dataset.idx;
    const rowData = {};
    subFields.forEach(sf => {
      const inputName = `repeater_${field.id}_${idx}_${sf.name}`;
      if (sf.type === 'image') {
        rowData[sf.name] = collectImageValue(form, inputName);
      } else {
        const input = form.querySelector(`[name="${inputName}"]`);
        rowData[sf.name] = input?.value ?? '';
      }
    });
    result.push(rowData);
  });

  return result;
}

function collectImageValue(form, name) {
  const pathInput = form.querySelector(`[name="${name}_path"]`);
  const fallbackInput = form.querySelector(`[name="${name}_fallback"]`);
  return {
    path: pathInput?.value || '',
    fallback: fallbackInput?.value || pathInput?.value || ''
  };
}

// ─── Media Library ───
async function loadMedia(area) {
  setHeader('Медиатека', '<button class="button button-primary" onclick="openMediaUpload()">Загрузить</button>');
  const files = await fetch(`${MEDIA_API}/list`).then(r => r.json());

  area.innerHTML = files.length ? `
    <div class="media-grid">${files.map(f => `
      <div class="media-item" onclick="copyMediaPath('${esc(f.path)}')">
        <img src="${imgSrc(f.path)}" alt="${esc(f.name)}">
        <div class="media-name">${esc(f.name)}</div>
      </div>`).join('')}
    </div>` : '<div class="empty-state"><p>Медиатека пуста. Загрузите первое изображение.</p></div>';
}

window.copyMediaPath = function(path) {
  navigator.clipboard?.writeText(path);
  showNotice(`Путь скопирован: ${path}`, 'info');
};

window.openMediaUpload = function(callback, fieldName) {
  resetUploadModal();
  currentImageCallback = callback || null;
  currentImageFieldName = fieldName || null;
  document.getElementById('image-modal').classList.add('active');
};

function setupMediaUpload() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('image-file-input');
  const changeFileBtn = document.getElementById('change-file-btn');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains('has-preview')) dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  });

  changeFileBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pendingFile = null;
    fileInput.value = '';
    document.getElementById('drop-zone-placeholder').hidden = false;
    document.getElementById('drop-zone-preview').hidden = true;
    dropZone.classList.remove('has-preview');
    document.getElementById('upload-btn').disabled = true;
    fileInput.click();
  });

  document.getElementById('upload-btn')?.addEventListener('click', uploadImage);
}

function showUploadPreview(dataUrl, file) {
  const dropZone = document.getElementById('drop-zone');
  const placeholder = document.getElementById('drop-zone-placeholder');
  const preview = document.getElementById('drop-zone-preview');
  const img = document.getElementById('upload-preview-img');
  const status = document.getElementById('upload-status');
  const uploadBtn = document.getElementById('upload-btn');

  img.src = dataUrl;
  status.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  placeholder.hidden = true;
  preview.hidden = false;
  dropZone.classList.add('has-preview');
  uploadBtn.disabled = false;
}

function handleFileSelect(file) {
  if (!file.type.startsWith('image/')) {
    showNotice('Выберите файл изображения', 'error');
    return;
  }

  pendingFile = file;
  const reader = new FileReader();
  reader.onload = (e) => showUploadPreview(e.target.result, file);
  reader.onerror = () => showNotice('Не удалось прочитать файл', 'error');
  reader.readAsDataURL(file);
}

function applyImageToField(name, imageData) {
  const form = document.getElementById('acf-content-form') || document.getElementById('edit-form');
  if (!form) return;

  const pathInput = form.querySelector(`[name="${name}_path"]`);
  const fallbackInput = form.querySelector(`[name="${name}_fallback"]`);
  const displayInput = form.querySelector(`input[name="${name}"][type="text"]`);

  if (pathInput) pathInput.value = imageData.path;
  if (fallbackInput) fallbackInput.value = imageData.fallback;
  if (displayInput) displayInput.value = imageData.path;

  const field = form.querySelector(`[data-field-name="${name}"]`);
  if (field) {
    let preview = field.querySelector('.image-field-preview');
    if (!preview) {
      preview = document.createElement('img');
      preview.className = 'image-field-preview';
      field.insertBefore(preview, field.firstChild);
    }
    preview.src = imgSrc(imageData.path);
    preview.alt = '';

    const clearBtn = field.querySelector('.clear-image-btn');
    if (!clearBtn && imageData.path) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button button-small button-danger clear-image-btn';
      btn.textContent = '×';
      btn.onclick = () => clearImage(name);
      field.querySelector('div')?.appendChild(btn);
    }
  }
}

async function uploadImage() {
  if (!pendingFile) {
    showNotice('Сначала выберите изображение', 'error');
    return;
  }

  const btn = document.getElementById('upload-btn');
  btn.disabled = true;
  btn.textContent = 'Загрузка...';

  try {
    const dataUrl = await readFileAsDataURL(pendingFile);
    const res = await fetch(`${MEDIA_API}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, filename: pendingFile.name })
    });
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || 'Ошибка загрузки');
    }

    const imageData = { path: result.path, fallback: result.fallback };
    const fieldName = currentImageFieldName;

    if (currentImageCallback) {
      currentImageCallback(imageData);
    } else if (fieldName) {
      applyImageToField(fieldName, imageData);
    }

    document.getElementById('image-modal').classList.remove('active');
    resetUploadModal();
    showNotice('Изображение загружено' + (result.webp_supported ? ' (WebP)' : ' (оригинал)'));

    if (currentSection === 'media') loadSection('media');
  } catch (err) {
    showNotice('Ошибка загрузки: ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Загрузить';
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

// ─── Features ───
async function loadFeatures(area) {
  setHeader('Преимущества', '<button class="button button-primary" onclick="openFeatureModal()">Добавить</button>');
  const features = await fetch(`${API}/features/all`).then(r => r.json());

  area.innerHTML = `
    <table class="wp-list-table">
      <thead><tr><th>Иконка</th><th>Заголовок</th><th>Описание</th><th>Видимость</th><th class="column-actions">Действия</th></tr></thead>
      <tbody>${features.map(f => `
        <tr>
          <td>${esc(f.icon)}</td>
          <td>${esc(f.title)}</td>
          <td>${esc(f.description)}</td>
          <td>${f.is_visible ? '✓' : '✗'}</td>
          <td class="column-actions">
            <button class="button button-small" onclick="openFeatureModal(${f.id})">Изменить</button>
            <button class="button button-small button-danger" onclick="deleteItem('features', ${f.id})">Удалить</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

window.openFeatureModal = async function(id) {
  let data = {};
  if (id) {
    const features = await fetch(`${API}/features/all`).then(r => r.json());
    data = features.find(f => f.id === id) || {};
  }

  openModal(data.id ? 'Редактировать' : 'Добавить преимущество', `
    <input type="hidden" name="form_type" value="feature">
    <input type="hidden" name="id" value="${data.id || ''}">
    <table class="form-table">
      <tr><th><label>Заголовок</label></th><td><input type="text" name="title" value="${esc(data.title)}" required></td></tr>
      <tr><th><label>Описание</label></th><td><textarea name="description">${esc(data.description)}</textarea></td></tr>
      <tr><th><label>Иконка</label></th><td><input type="text" name="icon" value="${esc(data.icon)}" placeholder="delivery, return, payment, support"></td></tr>
      <tr><th><label>Видимость</label></th><td><label class="toggle-label"><input type="checkbox" name="is_visible" ${data.is_visible !== 0 && data.is_visible !== false ? 'checked' : ''}> Показывать</label></td></tr>
    </table>`);
};

// ─── Footer ───
async function loadFooter(area) {
  const footerData = await fetch(`${API}/footer`).then(r => r.json());
  area.innerHTML = Object.entries(footerData).map(([section, data]) => `
    <div class="postbox">
      <div class="postbox-header"><h2>${esc(data.title || section)}</h2></div>
      <div class="postbox-body">
        <table class="wp-list-table">
          <tbody>${data.links.map(link => `
            <tr><td>${esc(link.key)}</td><td>${esc(link.value)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`).join('');
}

// ─── Settings ───
async function loadSettings(area) {
  await loadCurrencySettings();
  const settings = await fetch(`${API}/settings`).then(r => r.json());
  const currentCode = settings.currency_code || currencySettings.code;
  const currencies = currencyList.length ? currencyList : Object.values(CURRENCIES);

  const currencyOptions = currencies.map(c => {
    const code = c.code || c;
    const label = c.label || CURRENCIES[code]?.label || code;
    return `<option value="${code}" ${code === currentCode ? 'selected' : ''}>${esc(label)}</option>`;
  }).join('');

  area.innerHTML = `
    <form id="settings-form">
      <input type="hidden" name="form_type" value="settings">
      <div class="postbox">
        <div class="postbox-header"><h2>Валюта магазина</h2></div>
        <div class="postbox-body">
          <table class="form-table">
            <tr>
              <th><label for="currency_code">Валюта</label></th>
              <td>
                <select name="currency_code" id="currency_code" required>${currencyOptions}</select>
                <p class="description">Цены товаров вводятся и отображаются в выбранной валюте на сайте и в админке.</p>
              </td>
            </tr>
            <tr>
              <th>Пример отображения</th>
              <td id="currency-preview">${formatPrice(2500000)}</td>
            </tr>
          </table>
        </div>
      </div>
      <p><button type="submit" class="button button-primary">Сохранить настройки</button></p>
    </form>
    <div class="postbox" style="margin-top:20px;">
      <div class="postbox-header"><h2>Все настройки</h2></div>
      <div class="postbox-body">
        <table class="wp-list-table">
          <thead><tr><th>Ключ</th><th>Значение</th></tr></thead>
          <tbody>${Object.entries(settings).filter(([k]) => !k.startsWith('currency_') && k !== 'currency_migrated').map(([k, v]) => `
            <tr><td>${esc(k)}</td><td>${esc(v || '—')}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('currency_code').addEventListener('change', (e) => {
    const preset = CURRENCIES[e.target.value];
    if (preset) {
      currencySettings = { ...preset };
      document.getElementById('currency-preview').textContent = formatPrice(2500000);
    }
  });

  document.getElementById('settings-form').addEventListener('submit', handleSettingsSubmit);
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  const code = document.getElementById('currency_code').value;
  const preset = CURRENCIES[code] || CURRENCIES.IDR;

  await fetch(`${API}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      settings: {
        currency_code: preset.code,
        currency_symbol: preset.symbol,
        currency_locale: preset.locale
      }
    })
  });

  await loadCurrencySettings();
  showNotice(`Валюта изменена на ${preset.label}`);
  loadSection('settings');
}

// ─── Shared helpers ───
function imageFieldHtml(name, value, isObject = false) {
  let path = '', fallback = '';
  if (typeof value === 'object' && value) {
    path = value.path || '';
    fallback = value.fallback || path;
  } else if (typeof value === 'string') {
    path = value;
    fallback = value;
  }

  const preview = path ? `<img src="${imgSrc(path)}" class="image-field-preview" alt="">` : '';

  return `<div class="image-field" data-field-name="${name}">
    ${preview}
    <div>
      <input type="hidden" name="${name}_path" value="${esc(path)}">
      <input type="hidden" name="${name}_fallback" value="${esc(fallback)}">
      <input type="text" name="${name}" value="${esc(path)}" readonly style="max-width:250px">
      <button type="button" class="button button-small" onclick="pickImage('${name}')">Выбрать</button>
      ${path ? `<button type="button" class="button button-small button-danger" onclick="clearImage('${name}')">×</button>` : ''}
    </div>
  </div>`;
}

window.pickImage = function(name) {
  openMediaUpload((imageData) => applyImageToField(name, imageData), name);
};

window.clearImage = function(name) {
  const form = document.getElementById('edit-form') || document.getElementById('acf-content-form');
  ['_path', '_fallback', ''].forEach(suffix => {
    const input = form.querySelector(`[name="${name}${suffix}"]`);
    if (input) input.value = '';
  });
  const field = form.querySelector(`[data-field-name="${name}"]`);
  const preview = field?.querySelector('.image-field-preview');
  if (preview) preview.remove();
};

function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('edit-modal').classList.add('active');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formType = form.querySelector('[name=form_type]')?.value;
  const data = Object.fromEntries(new FormData(form));

  try {
    switch (formType) {
      case 'product':
        await saveProduct(form, data);
        break;
      case 'category':
        await saveCategory(form, data);
        break;
      case 'acf_group':
        await saveAcfGroup(data);
        break;
      case 'acf_field':
        await saveAcfField(form, data);
        break;
      case 'feature':
        await saveFeature(form, data);
        break;
    }
    closeModals();
    showNotice('Сохранено');
    loadSection(currentSection);
  } catch (err) {
    showNotice('Ошибка: ' + err.message, 'error');
  }
}

async function saveProduct(form, data) {
  const image = collectImageValue(form, 'image');
  const payload = {
    name: data.name, slug: data.slug, description: data.description,
    price: parseFloat(data.price) || 0,
    original_price: data.original_price ? parseFloat(data.original_price) : null,
    category: data.category, image: image.path || '/images/products/product-1.png',
    in_stock: form.querySelector('[name=in_stock]')?.checked ?? true,
    is_featured: form.querySelector('[name=is_featured]')?.checked ?? false,
    is_new: form.querySelector('[name=is_new]')?.checked ?? false
  };
  const url = data.id ? `${API}/products/${data.id}` : `${API}/products`;
  await fetch(url, { method: data.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

async function saveCategory(form, data) {
  const image = collectImageValue(form, 'image');
  const payload = {
    name: data.name, slug: data.slug, description: data.description,
    image: image.path, sort_order: parseInt(data.sort_order) || 0
  };
  const url = data.id ? `${API}/categories/${data.id}` : `${API}/categories`;
  await fetch(url, { method: data.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

async function saveAcfGroup(data) {
  const payload = { name: data.name, slug: data.slug, description: data.description, location: data.location, sort_order: parseInt(data.sort_order) || 0 };
  const url = data.id ? `${ACF_API}/groups/${data.id}` : `${ACF_API}/groups`;
  await fetch(url, { method: data.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

async function saveAcfField(form, data) {
  const subFields = [];
  form.querySelectorAll('.sub-field-row').forEach((row, i) => {
    subFields.push({
      label: form.querySelector(`[name=sub_label_${row.dataset.idx}]`)?.value || form.querySelector(`[name=sub_label_${i}]`)?.value,
      name: form.querySelector(`[name=sub_name_${row.dataset.idx}]`)?.value || form.querySelector(`[name=sub_name_${i}]`)?.value,
      type: form.querySelector(`[name=sub_type_${row.dataset.idx}]`)?.value || form.querySelector(`[name=sub_type_${i}]`)?.value
    });
  });

  const payload = {
    group_id: parseInt(data.group_id), name: data.name, label: data.label,
    type: data.type, config: data.type === 'repeater' ? { sub_fields: subFields.filter(sf => sf.name) } : {},
    sort_order: parseInt(data.sort_order) || 0,
    required: form.querySelector('[name=required]')?.checked ?? false
  };
  const url = data.id ? `${ACF_API}/fields/${data.id}` : `${ACF_API}/fields`;
  await fetch(url, { method: data.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

async function saveFeature(form, data) {
  const payload = {
    title: data.title, description: data.description, icon: data.icon,
    is_visible: form.querySelector('[name=is_visible]')?.checked ?? true
  };
  const url = data.id ? `${API}/features/${data.id}` : `${API}/features`;
  await fetch(url, { method: data.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

window.deleteItem = async function(type, id) {
  if (!confirm('Удалить?')) return;
  await fetch(`${API}/${type}/${id}`, { method: 'DELETE' });
  showNotice('Удалено');
  loadSection(currentSection);
};

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function imgSrc(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/upload/')) return path;
  if (path.startsWith('/images/')) return path;
  return path;
}
