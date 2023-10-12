/***** */

async function getApi () {
    const URL = 'https://ecommercebackend.fundamentos-29.repl.co';
    try {
        const data = await fetch(URL);
        const res = await data.json();
        localStorage.setItem('products', JSON.stringify(res));
        return res;
    } catch (error) {
        console.log(error);
    }
}
async function database () {
    const db = {
        products: JSON.parse(localStorage.getItem('products')) || await getApi(),
        cart: JSON.parse(localStorage.getItem('cart')) || {},
    }
    return db;
}
function handels () {
    const btn = document.querySelector('.header__btn');
    const list = document.querySelector('.header__list');
    const cart = document.querySelector('.cart__btn');
    const modal = document.querySelector('.cart__modal');

    btn.addEventListener('click', function(){
       list.classList.toggle('active');
    });
    list.addEventListener('click', function(){
        list.classList.remove('active');
     });
    cart.addEventListener('click', ()=> {
        modal.classList.toggle('active');
    })
}
function printProducts (products) {
    const print = document.querySelector('.products');
    let html = '';
    for (const item of products) {
        //console.log(item);
        const { category, id, image, price, quantity } = item;
        html += `
        <div id="${id}" class="product">
            <figure class="product__img if${quantity}">
                <img src="${image}" alt="image product">
            </figure>
            <p class="product__description">
                <span>Categoria:</span> ${category}<br>
                <span>precio:</span> $${price} USD<br>
                <span>Cantidad:</span> ${quantity} Units<br>
            </p>
            <div class="product__buttons">
            <button class="btn__view">Ver detalle</button>
            <button class="btn__add">Agregar al carrito</button>
            </div>
        </div>
        `
    }
    print.innerHTML = html;
}
function addToCart (db) {
    const add = document.querySelector('.products');
    add.addEventListener('click', (event)=>{
        if(event.target.classList.contains('btn__add')) {
            const id= +event.target.closest('.product').id;
            const article = db.products.find(element => element.id===id);
            if(article.quantity===0) {
                return alert('Este producto se encuentra agotago');
            }
            if (article.id in db.cart) {
                if (db.cart[id].amount===db.cart[id].quantity) {
                    return alert('No tenemos más en bodega');
                }
                db.cart[article.id].amount++;
            } else {
                article.amount = 1;
                db.cart[article.id] =article;
            }
            //console.log(db.cart);
            localStorage.setItem('cart', JSON.stringify(db.cart));
            printCart(db.cart);
            printTotals(db);
        }
    });
}
function printCart (products) {
    const print = document.querySelector('.cart__products');
    let html = '';
    for (const key in products) {
        //console.log(products[key]);
        const { amount, category, id, image, price, quantity } = products[key];
        html += `
        <div id="${id}" class="cart__product">
            <figure class="cart__product__img">
                <img src="${image}" alt="image products">
            </figure>
            <div class="cart__product__container">
                <p class="cart__product__description">
                    <span>Categoria:</span> ${category}
                    <br>
                    <span>precio:</span> $${price}
                    USD<br>
                    <span>Cantidad:</span> ${quantity}
                    Units<br>
                </p>
                <div class="cart__product__buttons">
                    <ion-icon class="less" name="remove-circle-outline"></ion-icon>
                    <span>${amount}</span>
                    <ion-icon class="plus" name="add-circle-outline"></ion-icon>
                    <ion-icon class="trash" name="trash-outline"></ion-icon>
                </div>
            </div>
        </div>
        `;
    }
    print.innerHTML = html;
}
function handleCart (db) {
    const cart = document.querySelector('.cart__products');
    cart.addEventListener('click', (event)=>{
        //console.log(event.target.classList.contains('plus'));
        if(event.target.classList.contains('less')) {
            //console.log('quiero restar');
            const id = +event.target.closest('.cart__product').id;
            if (db.cart[id].amount===1) {
                return alert('Uno es la cantidad minima que puedes comprar');
            }
            db.cart[id].amount--;
        }
        if(event.target.classList.contains('plus')) {
            //console.log('quiero sumar');
            const id = +event.target.closest('.cart__product').id;
            if (db.cart[id].amount===db.cart[id].quantity) {
                return alert('No tenemos más en bodega');
            }
            db.cart[id].amount++;
        }
        if(event.target.classList.contains('trash')) {
            //console.log('quiero borrar');
            const id = +event.target.closest('.cart__product').id;
            const response = confirm('Seguro que quieres borrar este producto?');
            if (!response) {
                return;
            }
            delete db.cart[id];
        }
        localStorage.setItem('cart', JSON.stringify(db.cart));
        printCart(db.cart);
        printTotals(db)
    })
}
function printTotals(db) {
    const cartTotal = document.querySelector('.cart__totals div');

    // Verificar si el elemento existe
    if (cartTotal) {
        const cartIcon = document.querySelector('.cart__btn span');
        let cantidad = 0;
        let totales = 0;
        for (const key in db.cart) {
            const { amount, price } = db.cart[key];
            cantidad += amount;
            totales += amount * price;
        }
        let html = `
            <p><span>Cantidad:</span> ${cantidad}</p>
            <p><span>Total:</span> $${totales} USD</p>
        `;
        cartTotal.innerHTML = html;
        cartIcon.innerHTML = cantidad;
    }
}
function handleTotals (db) {
    const btnBuy = document.querySelector('.btn__buy');
        btnBuy.addEventListener('click', ()=>{
            //console.log(Object.values(db.cart).length);
            if (!Object.values(db.cart).length) {
                return alert('Debes agregar productos a tu carrito antes de hacer la compra');
            }
            const response = confirm('Estas seguro de realizar tu compra?');
            if (!response) {
                return;
            }
        for(const key in db.cart) {
            if(db.cart[key].id===db.products[key-1].id) {
                db.products[key-1].quantity -= db.cart[key].amount;
            }
        }
        db.cart = {};
        localStorage.setItem('productos', JSON.stringify(db.products));
        localStorage.setItem('cart', JSON.stringify(db.cart));
        printProducts(db.products);
        printCart(db.cart);
        printTotals(db);
        alert('Gracias por su compra!!!');
    }); 
}
function filterProducts (products) {
    const categorySelect = document.getElementById('categorySelect');

    categorySelect.addEventListener('change', function () {
        const selectedCategory = categorySelect.value;

        let filteredProducts;
        if (selectedCategory === 'todos') {
            filteredProducts = products;
        } else {
            // Aquí, dependiendo de la estructura de tus objetos 'products',
            // debes usar la propiedad correcta para comparar con 'selectedCategory'.
            // Supongamos que la propiedad es 'category'.
            filteredProducts = products.filter(element => element.category === selectedCategory);
        }

        printProducts(filteredProducts);
    });
}
function showDetails (products) {
    const readBtn = document.querySelector('.products');
    const showModal = document.querySelector('.view__modal');
    const closeModal = document.querySelector('.close__modal');
    const contentModal = document.querySelector('.content__modal');
    readBtn.addEventListener('click', (event)=>{
        if(event.target.classList.contains('btn__view')) {
            const id = +event.target.closest('.product').id;
            console.log(id);
            const article = products.find(element=>element.id===id);
            console.log(article);
            const { category, description, image, name, price, quantity } = article;
            let html = `
                <div class="modal__product">
                    <figure class="modal__product__img">
                        <img src="${image}" alt="image product">
                    </figure>
                    <p class="modal__product__short">
                        <span>Categoria:</span> ${category}<br>
                        <span>precio:</span> $${price} USD<br>
                        <span>Cantidad:</span> ${quantity} Units<br>
                    </p>
                </div>
                <p class="modal__product__long">
                    <span>Nombre:</span> ${name}<br>
                    <span>Descripción:</span> ${description}<br>
                </p>`;
            contentModal.innerHTML = html;
            showModal.classList.add('active');
        }
    });
    closeModal.addEventListener('click', ()=>{
        showModal.classList.remove('active');
    })
}
async function main () {
    const db = await database(); 
    //console.log(db.products);
    handels();
    printProducts(db.products);
    addToCart(db);
    printCart(db.cart);
    handleCart(db);
    printTotals(db);
    handleTotals(db);
    filterProducts(db.products);
    showDetails(db.products);
}
main();