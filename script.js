const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartCounter = document.getElementById('cart-count');
const addressInput = document.getElementById('address');
const addressWarning = document.getElementById('address-warning');

let cart = [];

// Abrir o modal do carrinho
cartBtn.addEventListener('click', () => {
    updateCart();
    cartModal.classList.remove('hidden');
    cartModal.classList.add('flex');

});

// Fechar o modal do carrinho
cartModal.addEventListener('click',(e) => {
    if (e.target === cartModal || e.target === closeModalBtn) {
        cartModal.classList.add('hidden');
        cartModal.classList.remove('flex');
    }
});


menu.addEventListener('click',(e) =>{
    let parentButton = e.target.closest('.add-to-cart-btn');

    if (parentButton){
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price'));

        addToCart(name, price);
    }
});

// Funcao para adicionar item ao carrinho
function addToCart(name, price){
    const existingItem = cart.find(item => item.name === name)
    if (existingItem){
        existingItem.quantity += 1;
    } else{
        cart.push({ name, price, quantity:1 });
    }
    updateCart();
}

// Atualizar o carrinho
function updateCart(){
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('flex', 'justify-between', 'flex-col', 'mb-4');
        
        cartItemElement.innerHTML = `
        <div class="flex justify-between items-center">
        <div>
        <p class="font-bold">${item.name}</p>
        <p class="font-medium">Qtd: ${item.quantity}</p>
        <p class="font-medium mt-2">R$ ${(item.price*item.quantity).toFixed(2)}</p>
        </div>
        
        
        <button data-name="${item.name}" class="remove-from-cart-btn hover:scale-105 ease-in-out duration-75 hover:cursor-pointer">Remover</button>
        
        </div>
        `
        
        total += item.price * item.quantity;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    cartTotal.textContent = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    cartCounter.innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Funcao para remover o item do carrinho
cartItemsContainer.addEventListener('click',(e) => {
    if (e.target.classList.contains('remove-from-cart-btn')){
        const name = e.target.getAttribute('data-name');

        removeItemCart(name);
    }
});

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1){
        const item = cart[index];
        if(item.quantity > 1){
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
    }
}

addressInput.addEventListener('input',(e) =>{
    let inputValue = e.target.value;
    if (inputValue !== ""){
        addressInput.classList.remove('border-red-500');
        addressWarning.classList.add('hidden');
    }
});

// Finalizar pedido
checkoutBtn.addEventListener('click', () => {

    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "O restaurante está fechado!", 
            duration: 2000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
    }).showToast();
        return;
    }

    if (cart.length === 0) return;

    if(addressInput.value === ""){
        addressWarning.classList.remove('hidden');
        addressWarning.classList.add('border-red-500');
        return;
    }

    // Enviar o pedido para api whatsapp
    const cartItems = cart.map((item)=>{
        return `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const message = encodeURIComponent(`Olá, gostaria de fazer um pedido:\n\n${cartItems}\n\nTotal: ${cartTotal.textContent}\n\nEndereço: ${addressInput.value}`);
    const phoneNumber = '939453458'; // Substitua pelo número de telefone do restaurante
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`,'_blank');

    cart =[]; // Limpar o carrinho
    updateCart(); // Atualizar a exibição do carrinho

}); 

// Verificar hora e manipular horario de funcionamento do restaurante
function checkRestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    return hora >= 12 && hora < 22;
    //true = aberto
    //false = fechado
}

const spanItem = document.getElementById('date-span');
const isOpen = checkRestaurantOpen();
if (isOpen){
    spanItem.classList.add('text-green-600');
    spanItem.classList.remove('bg-red-500');
}else {
    spanItem.classList.add('bg-red-500');
    spanItem.classList.remove('bg-green-600');
}