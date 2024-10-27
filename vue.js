document.addEventListener('DOMContentLoaded', function() {
    new Vue({
        el: '#app',
        data: {
            sitename: 'Online Course Registration',
            products: [
                { id: 1, subject: 'Mathematics', price: 200, availableSpace: 5, image: 'math.jpg' },
                { id: 2, subject: 'Science', price: 250, availableSpace: 3, image: 'science.jpg' },
                { id: 3, subject: 'History', price: 150, availableSpace: 4, image: 'history.jpg' }
            ],
            cart: [],
            order: {
                firstName: '',
                lastName: '',
                address: '',
                contact: '',
                email: '',
                paymentMethod: 'Cash',
                cardNumber: ''
            },
            showProduct: true,
            feedbackMessage: '',
            feedbackType: ''
        },
        computed: {
            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },
            totalCartValue() {
                return this.cart.reduce((total, item) => total + (item.price * item.count), 0);
            }
        },
        methods: {
            addToCart(product) {
                const found = this.cart.find(item => item.id === product.id);
                if (found) {
                    found.count++;
                } else {
                    this.cart.push({...product, count: 1 });
                }
                product.availableSpace--;
            },
            canAddToCart(product) {
                return product.availableSpace > 0;
            },
            showCheckout() {
                this.showProduct = false;
            },
            submitForm() {
                if (this.validateForm()) {
                    this.feedbackMessage = 'Order submitted successfully!';
                    this.feedbackType = 'success';
                    this.clearCart();
                } else {
                    this.feedbackMessage = 'Please fill in all required fields correctly.';
                    this.feedbackType = 'error';
                }
            },
            validateForm() {
                return this.order.firstName && this.order.lastName && this.order.address;
            },
            increaseQuantity(item) {
                item.count++;
            },
            decreaseQuantity(item) {
                if (item.count > 1) {
                    item.count--;
                }
            },
            removeFromCart(item) {
                this.cart = this.cart.filter(i => i.id !== item.id);
            },
            clearCart() {
                this.cart.forEach(item => {
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        product.availableSpace += item.count;
                    }
                });
                this.cart = [];
                this.order = {
                    firstName: '',
                    lastName: '',
                    address: '',
                    contact: '',
                    email: '',
                    paymentMethod: 'Cash',
                    cardNumber: ''
                };
                this.showProduct = true;
            }
        }
    });
});