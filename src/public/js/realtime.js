const socket = io();

const form = document.getElementById('productForm');
const productList = document.getElementById('productList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const product = Object.fromEntries(formData.entries());
  product.price = parseFloat(product.price);
  product.stock = parseInt(product.stock);

  socket.emit('newProduct', product);
  form.reset();
});

productList.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteBtn')) {
    const id = e.target.closest('li').getAttribute('data-id');
    socket.emit('deleteProduct', parseInt(id));
  }
});

socket.on('updateProducts', (products) => {
  productList.innerHTML = '';
  products.forEach((p) => {
    productList.innerHTML += `
      <li data-id="${p.id}">
        <strong>${p.title}</strong> - $${p.price}
        <button class="deleteBtn">Eliminar</button>
      </li>
    `;
  });
});
