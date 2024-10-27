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
                lastName: '',
                address: '',
                contact: '',
                email: '',
                paymentMethod: 'Cash',
                cardNumber: '',
            },
            isDropdownVisible: false,
            searchQuery: '',
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
                        image: product.image,
                    });
                }
                product.availableSpace -= 1;
            },
            showCheckout() {
                if (this.cart.length === 0) {
                    alert("Your cart is empty. Please add items before checking out.");
                    return;
                }
                this.showProduct = !this.showProduct;
            },
            submitForm() {
                if (this.order.firstName && this.order.lastName && this.order.address && this.order.paymentMethod) {
                    alert("Order Submitted!");
                } else {
                    alert("Please fill in all fields");
                }
            },
            canAddToCart(product) {
                return product.availableSpace > 0;
            },
            increaseQuantity(item) {
                const product = this.products.find(p => p.id === item.id);
                if (product && product.availableSpace > 0) {
                    item.count += 1;
                    product.availableSpace -= 1;
                }
            },
            decreaseQuantity(item) {
                if (item.count > 1) {
                    item.count -= 1;
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        product.availableSpace += 1;
                    }
                } else {
                    this.removeFromCart(item);
                }
            },
            removeFromCart(item) {
                const index = this.cart.indexOf(item);
                if (index > -1) {
                    this.cart.splice(index, 1);
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        product.availableSpace += item.count;
                    }
                }
            },
        },
        computed: {
            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },
            totalCartValue() {
                return Math.round(this.cart.reduce((total, item) => total + (item.price * item.count), 0));
            },
        },
        mounted() {
            this.products = products;
        }
    });
});