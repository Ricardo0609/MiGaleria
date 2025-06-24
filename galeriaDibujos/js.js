const input = document.getElementById('file-input');
const galeria = document.getElementById('galeria');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const deleteBtn = document.getElementById('delete-btn');
const closeBtn = document.querySelector('.close-btn');
let currentKey = null;

let db;
const request = indexedDB.open('GaleriaDB', 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore('imagenes', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = e => {
  db = e.target.result;
  cargarImagenes();
};

function cargarImagenes() {
  const tx = db.transaction('imagenes', 'readonly');
  const store = tx.objectStore('imagenes');
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    getAll.result.forEach(({ id, src }) => crearImagen(src, id));
  };
}

input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result;
      if (!src) return; // validación extra
      const tx = db.transaction('imagenes', 'readwrite');
      const store = tx.objectStore('imagenes');
      const add = store.add({ src });
  
      add.onsuccess = () => crearImagen(src, add.result);
    };
    reader.readAsDataURL(file);
  });
  
  function crearImagen(src, id) {
    if (!src) return; // evitar error si src es undefined
    const img = document.createElement('img');
    img.src = src;
    img.dataset.id = id;
    img.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modalImg.src = src;
      currentKey = Number(id);
    });
    galeria.appendChild(img);
  }
  
 

  
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modalImg.src = '';
});

deleteBtn.addEventListener('click', () => {
    if (typeof currentKey === 'number' && !isNaN(currentKey)) {
      const tx = db.transaction('imagenes', 'readwrite');
      const store = tx.objectStore('imagenes');
      const del = store.delete(currentKey);
  
      del.onsuccess = () => {
        galeria.innerHTML = '';
        cargarImagenes();
        modal.classList.add('hidden');
        modalImg.src = '';
        currentKey = null;
      };
    }
  });
  
