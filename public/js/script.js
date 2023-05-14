
document.addEventListener('DOMContentLoaded', function () {
    const cart = document.querySelector('.cart');
    const finalTotal = document.querySelector('.FinalTotal');

    function updateLocalStorage() {
        const products = [];
        cart.querySelectorAll('tbody > tr:not(.voucher)').forEach(row => {
            const id = row.querySelector('.imgproduct').getAttribute('data-id');
            const image = row.querySelector('.imgproduct img').getAttribute('src');
            const name = row.querySelector('.imgproduct span').textContent;
            const price = parseFloat(row.querySelector('.price').textContent);
            const quantity = parseInt(row.querySelector('.quantity span').textContent);

            products.push({
                id: id,
                image: image,
                name: name,
                price: price,
                quantity: quantity
            });
        });
        localStorage.setItem('cart', JSON.stringify(products));
    }

    function updateTotalPrice() {
        let totalAmount = 0;
        cart.querySelectorAll('tbody > tr:not(.voucher)').forEach(row => {
            const unitPrice = parseFloat(row.querySelector('.price').textContent);
            const quantity = parseInt(row.querySelector('.quantity span').textContent);
            const totalPrice = unitPrice * quantity;
            row.querySelector('.total-price').textContent = `$${totalPrice.toFixed(2)}`;
            totalAmount += totalPrice;
        });
        finalTotal.textContent = `Total amount due for the order: $${totalAmount.toFixed(2)}`;
        updateLocalStorage();
    }

    function removeCartItem(button) {
        const row = button.closest('tr');
        row.remove();
        updateTotalPrice();
    }

    function updateQuantity(button, action) {
        const row = button.closest('tr');
        const quantitySpan = row.querySelector('.quantity span');
        let quantity = parseInt(quantitySpan.textContent);

        if (action === 'increase') {
            quantity++;
        } else if (action === 'decrease' && quantity > 1) {
            quantity--;
        }

        quantitySpan.textContent = quantity;
        updateTotalPrice();
        updateLocalStorage();
    }

    function initCart() {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

        cartItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td class="imgproduct" data-id="${item.id}" >
            <img src="${item.image}" alt="product image">
            <span>${item.name}</span>
          </td>
          <td class="price">${item.price}</td>
          <td class="quantity">
            <button class="subtract-button">-</button>
            <span>${item.quantity}</span>
            <button class="add-button">+</button>
          </td>
          <td class="total-price"></td>
          <td class="btndel"><button class="remove-button"><i class="fa fa-trash"></i></button></td>
        `;

            cart.querySelector('tbody').appendChild(row);
        });

        updateTotalPrice();
    }

    cart.addEventListener('click', function (event) {
        const button = event.target;
        if (button.classList.contains('remove-button')) {
            removeCartItem(button);
        } else if (button.classList.contains('subtract-button')) {
            updateQuantity(button, 'decrease');
        } else if (button.classList.contains('add-button')) {
            updateQuantity(button, 'increase');
        }
    });

    initCart();
});


document.addEventListener('DOMContentLoaded', function () {
    const plusButton = document.querySelector('.add-button');
    const minusButton = document.querySelector('.subtract-button');
    const quantityInput = document.querySelector('.quantity-input');
    const addToCartButton = document.querySelector('.add-to-cart-button');
    const productId = document.querySelector('.details').getAttribute('data-product-id');
    const productName = document.querySelector('.product-name').textContent;
    const price = parseFloat(document.querySelector('.priceP').innerHTML);

    plusButton.addEventListener('click', function () {
        increaseQuantity();
    });

    minusButton.addEventListener('click', function () {
        decreaseQuantity();
    });

    addToCartButton.addEventListener('click', function () {
        addToCart();
    });

    function increaseQuantity() {
        let quantity = parseInt(quantityInput.value);
        quantityInput.value = quantity + 1;
    }

    function decreaseQuantity() {
        let quantity = parseInt(quantityInput.value);
        if (quantity > 1) {
            quantityInput.value = quantity - 1;
        }
    }

    function addToCart() {
        const quantity = parseInt(quantityInput.value);
        const product = {
            id: productId,
            image: document.querySelector('.left-column img').getAttribute('src'),
            name: productName,
            quantity: quantity,
            price: price,
        };

        let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingProductIndex !== -1) {
            cartItems[existingProductIndex].quantity += quantity;
        } else {
            cartItems.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cartItems));

        console.log('Thêm sản phẩm vào giỏ hàng:');
        console.log(product);

        // Update the cart displayed on the page
        const cart = document.querySelector('.cart');
        const row = document.createElement('tr');
        row.innerHTML = `
        <td class="imgproduct" data-id="${product.id}" style="width:40%">
          <img src="${product.image}" alt="product image">
          <span>${product.name}</span>
        </td>
        <td class="price">$${product.price.toFixed(2)}</td>
        <td>
          <button class="subtract-button">-</button>
          <span>${product.quantity}</span>
          <button class="add-button">+</button>
        </td>
        <td>Total Price</td>
        <td class="btndel"><button class="remove-button"><i class="fa fa-trash"></i></button></td>
      `;

        cart.querySelector('tbody').appendChild(row);

        updateTotalPrice();
    }

});

