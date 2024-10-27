document.addEventListener('DOMContentLoaded', function() {
    new Vue({
        el: '#app',
        data: {
            sitename: 'After School Club',
            showProduct: true,
            products: products,
            cart: [],
            order: {
                firstName: '',
            },
        },
        methods: {
            addToCart(product) {
                const existingItem = this.cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.count += 1;
                } else {
                    this.cart.push({
                        id: product.id,
                        subject: product.subject,
                        count: 1,
                        price: product.price,
                    });
                }
            },
            showCheckout() {
                if (this.cart.length === 0) {
                    alert("Your cart is empty.");
                    return;
                }
                this.showProduct = false;
            },
            submitForm() {
                alert("Order Submitted!");
            },
            canAddToCart(product) {
                return product.availableSpace > 0;
            },
        },
        computed: {
            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },
            filteredProducts() {
                return this.products;
            },
        },
    });
});