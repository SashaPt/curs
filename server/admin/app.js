const API_BASE = '/api/content';
const MEDIA_BASE = '/api/media';
let currentSection = 'dashboard';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModalHandlers();
  loadSection('dashboard');
});

function setupNavigation() {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = e.target.dataset.section;
      if (section) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        e.target.classList.add('active');
        loadSection(section);
      }
    });
  });
}

function setupModalHandlers() {
  // Modal close handlers
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Close modal on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });

  // Add button
  document.getElementById('add-btn').addEventListener('click', () => {
    openEditModal(currentSection);
  });

  // Form submissions
  document.getElementById('edit-form').addEventListener('submit', handleFormSubmit);
  
  // Prevent image form default submission
  document.getElementById('image-form').addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

async function loadSection(section) {
  currentSection = section;
  const contentArea = document.getElementById('content-area');
  const addBtn = document.getElementById('add-btn');
  const pageTitle = document.getElementById('page-title');

  addBtn.style.display = 'none';
  pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);

  switch (section) {
    case 'dashboard':
      await loadDashboard(contentArea);
      break;
    case 'products':
      addBtn.style.display = 'block';
      await loadProducts(contentArea);
      break;
    case 'categories':
      addBtn.style.display = 'block';
      await loadCategories(contentArea);
      break;
    case 'homepage':
      addBtn.style.display = 'block';
      await loadHomepage(contentArea);
      break;
    case 'features':
      addBtn.style.display = 'block';
      await loadFeatures(contentArea);
      break;
    case 'footer':
      addBtn.style.display = 'block';
      await loadFooter(contentArea);
      break;
    case 'settings':
      await loadSettings(contentArea);
      break;
    default:
      contentArea.innerHTML = '<div class="empty-state"><h3>Section not found</h3></div>';
  }
}

async function loadDashboard(contentArea) {
  const [products, categories, features] = await Promise.all([
    fetch(`${API_BASE}/products`).then(r => r.json()),
    fetch(`${API_BASE}/categories`).then(r => r.json()),
    fetch(`${API_BASE}/features`).then(r => r.json())
  ]);

  contentArea.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Products</h3>
        <div class="value">${products.length}</div>
      </div>
      <div class="stat-card">
        <h3>Categories</h3>
        <div class="value">${categories.length}</div>
      </div>
      <div class="stat-card">
        <h3>Features</h3>
        <div class="value">${features.length}</div>
      </div>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${products.slice(0, 5).map(p => `
            <tr>
              <td>${p.name}</td>
              <td>$${p.price}</td>
              <td>${p.category}</td>
              <td>
                ${p.is_featured ? '<span class="badge badge-success">Featured</span>' : ''}
                ${p.is_new ? '<span class="badge badge-warning">New</span>' : ''}
                ${!p.is_featured && !p.is_new ? '<span class="badge badge-secondary">Regular</span>' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadProducts(contentArea) {
  const products = await fetch(`${API_BASE}/products`).then(r => r.json());

  contentArea.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td><img src="${p.image}" alt="${p.name}" class="image-preview"></td>
              <td>${p.name}</td>
              <td>$${p.price}</td>
              <td>${p.category}</td>
              <td>
                ${p.is_featured ? '<span class="badge badge-success">Featured</span>' : ''}
                ${p.is_new ? '<span class="badge badge-warning">New</span>' : ''}
                ${!p.in_stock ? '<span class="badge badge-secondary">Out of Stock</span>' : ''}
              </td>
              <td class="actions">
                <button class="btn btn-secondary btn-sm" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('products', ${p.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadCategories(contentArea) {
  const categories = await fetch(`${API_BASE}/categories`).then(r => r.json());

  contentArea.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${categories.map(c => `
            <tr>
              <td>${c.image ? `<img src="${c.image}" alt="${c.name}" class="image-preview">` : '-'}</td>
              <td>${c.name}</td>
              <td>${c.slug}</td>
              <td class="actions">
                <button class="btn btn-secondary btn-sm" onclick="editCategory(${c.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('categories', ${c.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadHomepage(contentArea) {
  const sections = await fetch(`${API_BASE}/homepage/all`).then(r => r.json());

  contentArea.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Title</th>
            <th>Image</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sections.map(s => `
            <tr>
              <td>${s.section}</td>
              <td>${s.title || '-'}</td>
              <td>${s.image ? `<img src="${s.image}" alt="" class="image-preview">` : '-'}</td>
              <td>${s.is_visible ? '✓' : '✗'}</td>
              <td class="actions">
                <button class="btn btn-secondary btn-sm" onclick="editHomepageSection(${s.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('homepage', ${s.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadFeatures(contentArea) {
  const features = await fetch(`${API_BASE}/features/all`).then(r => r.json());

  contentArea.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Title</th>
            <th>Description</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${features.map(f => `
            <tr>
              <td>${f.icon}</td>
              <td>${f.title}</td>
              <td>${f.description}</td>
              <td>${f.is_visible ? '✓' : '✗'}</td>
              <td class="actions">
                <button class="btn btn-secondary btn-sm" onclick="editFeature(${f.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('features', ${f.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadFooter(contentArea) {
  const footerData = await fetch(`${API_BASE}/footer`).then(r => r.json());

  contentArea.innerHTML = Object.entries(footerData).map(([section, data]) => `
    <div class="data-table" style="margin-bottom: 20px;">
      <div style="padding: 15px; background: #f5f6fa; border-bottom: 1px solid #ecf0f1;">
        <h3>${data.title || section}</h3>
      </div>
      <table>
        <tbody>
          ${data.links.map(link => `
            <tr>
              <td>${link.key}</td>
              <td>${link.value}</td>
              <td class="actions">
                <button class="btn btn-secondary btn-sm" onclick="alert('Edit feature coming soon')">Edit</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

async function loadSettings(contentArea) {
  const settings = await fetch(`${API_BASE}/settings`).then(r => r.json());

  contentArea.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Setting</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(settings).map(([key, value]) => `
            <tr>
              <td>${key}</td>
              <td>${value || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Edit/Delete functions
async function editProduct(id) {
  const product = await fetch(`${API_BASE}/products/id/${id}`).then(r => r.json());
  openEditModal('products', product);
}

async function editCategory(id) {
  const category = await fetch(`${API_BASE}/categories/${id}`).then(r => r.json());
  openEditModal('categories', category);
}

async function editHomepageSection(id) {
  const sections = await fetch(`${API_BASE}/homepage/all`).then(r => r.json());
  const section = sections.find(s => s.id === id);
  openEditModal('homepage', section);
}

async function editFeature(id) {
  const features = await fetch(`${API_BASE}/features/all`).then(r => r.json());
  const feature = features.find(f => f.id === id);
  openEditModal('features', feature);
}

function openEditModal(type, data = {}) {
  const modal = document.getElementById('edit-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  
  title.textContent = data.id ? `Edit ${type.slice(0, -1)}` : `Add New ${type.slice(0, -1)}`;
  
  let html = `<input type="hidden" name="id" value="${data.id || ''}">`;
  
  switch (type) {
    case 'products':
      html += `
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" value="${data.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Slug</label>
          <input type="text" name="slug" value="${data.slug || ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description">${data.description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Price</label>
            <input type="number" name="price" value="${data.price || 0}" step="0.01" required>
          </div>
          <div class="form-group">
            <label>Original Price</label>
            <input type="number" name="original_price" value="${data.original_price || ''}" step="0.01">
          </div>
        </div>
        <div class="form-group">
          <label>Category</label>
          <select name="category" required>
            <option value="living" ${data.category === 'living' ? 'selected' : ''}>Living Room</option>
            <option value="dining" ${data.category === 'dining' ? 'selected' : ''}>Dining Room</option>
            <option value="bedroom" ${data.category === 'bedroom' ? 'selected' : ''}>Bedroom</option>
          </select>
        </div>
        <div class="form-group">
          <label>Image</label>
          <div class="image-input-group">
            <input type="text" name="image" value="${data.image || '/images/products/product-1.png'}">
            <button type="button" class="btn btn-secondary btn-sm" onclick="openImagePicker(this, 'image')">Select</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="toggle-switch">
              <input type="checkbox" name="is_featured" ${data.is_featured ? 'checked' : ''}>
              <span class="toggle"></span>
              Featured
            </label>
          </div>
          <div class="form-group">
            <label class="toggle-switch">
              <input type="checkbox" name="is_new" ${data.is_new ? 'checked' : ''}>
              <span class="toggle"></span>
              New Arrival
            </label>
          </div>
          <div class="form-group">
            <label class="toggle-switch">
              <input type="checkbox" name="in_stock" ${data.in_stock !== false ? 'checked' : ''}>
              <span class="toggle"></span>
              In Stock
            </label>
          </div>
        </div>
      `;
      break;
      
    case 'categories':
      html += `
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" value="${data.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Slug</label>
          <input type="text" name="slug" value="${data.slug || ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description">${data.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Image</label>
          <div class="image-input-group">
            <input type="text" name="image" value="${data.image || ''}">
            <button type="button" class="btn btn-secondary btn-sm" onclick="openImagePicker(this, 'image')">Select</button>
          </div>
        </div>
      `;
      break;
      
    case 'homepage':
      html += `
        <div class="form-group">
          <label>Section ID</label>
          <input type="text" name="section" value="${data.section || ''}" ${data.id ? 'readonly' : ''} required>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input type="text" name="title" value="${data.title || ''}">
        </div>
        <div class="form-group">
          <label>Subtitle</label>
          <input type="text" name="subtitle" value="${data.subtitle || ''}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description">${data.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Image</label>
          <div class="image-input-group">
            <input type="text" name="image" value="${data.image || ''}">
            <button type="button" class="btn btn-secondary btn-sm" onclick="openImagePicker(this, 'image')">Select</button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Link URL</label>
            <input type="text" name="link" value="${data.link || ''}">
          </div>
          <div class="form-group">
            <label>Link Text</label>
            <input type="text" name="link_text" value="${data.link_text || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="toggle-switch">
            <input type="checkbox" name="is_visible" ${data.is_visible !== false ? 'checked' : ''}>
            <span class="toggle"></span>
            Visible
          </label>
        </div>
      `;
      break;
      
    case 'features':
      html += `
        <div class="form-group">
          <label>Title</label>
          <input type="text" name="title" value="${data.title || ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description">${data.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Icon Name</label>
          <input type="text" name="icon" value="${data.icon || ''}" placeholder="delivery, return, payment, support">
        </div>
        <div class="form-group">
          <label class="toggle-switch">
            <input type="checkbox" name="is_visible" ${data.is_visible !== false ? 'checked' : ''}>
            <span class="toggle"></span>
            Visible
          </label>
        </div>
      `;
      break;
  }
  
  body.innerHTML = html;
  modal.classList.add('active');
}

let currentImageField = null;

function openImagePicker(button, fieldName) {
  const modal = document.getElementById('image-modal');
  currentImageField = fieldName;
  document.getElementById('image-folder').value = 'products';
  
  // Reset file input
  const existingInput = modal.querySelector('input[type="file"]');
  if (existingInput) existingInput.remove();
  
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.name = 'image';
  fileInput.accept = 'image/*';
  fileInput.required = true;
  fileInput.className = 'form-group';
  fileInput.id = 'image-file-input';
  
  const label = modal.querySelector('label');
  label.textContent = 'Select File';
  
  // Remove old container if exists
  const oldContainer = modal.querySelector('.image-input-container');
  if (oldContainer) oldContainer.remove();
  
  const container = document.createElement('div');
  container.className = 'image-input-container';
  container.appendChild(fileInput);
  label.parentNode.insertBefore(container, label.nextSibling);
  
  modal.classList.add('active');
}

// Handle upload button click instead of form submit
document.addEventListener('DOMContentLoaded', () => {
  // Add click handler for upload button
  const imageModal = document.getElementById('image-modal');
  const uploadBtn = imageModal.querySelector('button[type="submit"]');
  
  uploadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('image-file-input');
    const file = fileInput?.files[0];
    const folder = document.getElementById('image-folder').value;
    
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      
      try {
        const response = await fetch(`${MEDIA_BASE}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder, image: base64Data })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Update the form field
          const input = document.querySelector('#edit-form input[name="' + currentImageField + '"]');
          input.value = result.path;
          closeModal();
        } else {
          alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        alert('Upload failed: ' + error.message);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file');
    };
    
    reader.readAsDataURL(file);
  });
});

async function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  const id = data.id;
  
  // Convert checkboxes to proper values
  ['is_featured', 'is_new', 'in_stock', 'is_visible'].forEach(key => {
    if (e.target.querySelector(`input[name="${key}"]`)) {
      data[key] = e.target.querySelector(`input[name="${key}"]`).checked;
    }
  });
  
  const url = id ? `${API_BASE}/${currentSection}/${id}` : `${API_BASE}/${currentSection}`;
  const method = id ? 'PUT' : 'POST';
  
  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  closeModal();
  loadSection(currentSection);
}

async function deleteItem(type, id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  
  await fetch(`${API_BASE}/${type}/${id}`, { method: 'DELETE' });
  loadSection(currentSection);
}

// Make functions globally available
window.editProduct = editProduct;
window.editCategory = editCategory;
window.editHomepageSection = editHomepageSection;
window.editFeature = editFeature;
window.deleteItem = deleteItem;
window.openEditModal = openEditModal;
window.openImagePicker = openImagePicker;