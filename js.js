const input = document.getElementById('file-input');
const galeria = document.getElementById('galeria');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const deleteBtn = document.getElementById('delete-btn');
const closeBtn = document.querySelector('.close-btn');

let db = null;
let currentKey = null;
let currentImg = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GaleriaDB', 1);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains('imagenes')) {
        database.createObjectStore('imagenes', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve();
    };

    request.onerror = reject;
  });
}

function cargarImagenes() {
  const tx = db.transaction('imagenes', 'readonly');
  const store = tx.objectStore('imagenes');
  const request = store.getAll();

  request.onsuccess = () => {
    galeria.innerHTML = '';

    request.result.forEach(item => {
      if (!item || !item.src || item.id === undefined) return;
      crearImagen(item.src, item.id);
    });
  };
}

function guardarImagen(src) {
  if (!src) return;

  const tx = db.transaction('imagenes', 'readwrite');
  const store = tx.objectStore('imagenes');
  store.add({ src });
}

function eliminarImagen(id) {
  if (typeof id !== 'number') return;

  const tx = db.transaction('imagenes', 'readwrite');
  const store = tx.objectStore('imagenes');
  store.delete(id);
}

function crearImagen(src, id) {
  if (!src || typeof id !== 'number') return;

  const img = document.createElement('img');
  img.src = src;
  img.dataset.id = id;

  img.addEventListener('click', () => {
    modal.classList.add('active');
    modalImg.src = src;
    currentKey = id;
    currentImg = img;
  });

  galeria.appendChild(img);
}

input.addEventListener('change', () => {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const src = e.target.result;
    if (!src) return;

    const tx = db.transaction('imagenes', 'readwrite');
    const store = tx.objectStore('imagenes');
    const req = store.add({ src });

    req.onsuccess = (event) => {
      const id = event.target.result;
      crearImagen(src, id);
    };
  };

  reader.readAsDataURL(file);
  input.value = '';
});

deleteBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (typeof currentKey !== 'number') return;

  eliminarImagen(currentKey);

  if (currentImg) currentImg.remove();

modal.classList.remove('active');
  modalImg.src = '';
  currentKey = null;
  currentImg = null;
});

closeBtn.addEventListener('click', () => {
modal.classList.remove('active');
  modalImg.src = '';
  currentKey = null;
  currentImg = null;
});

initDB().then(cargarImagenes);
