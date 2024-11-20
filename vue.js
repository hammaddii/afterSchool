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
            sortCriterion: {
                field: '',
                order: 'asc'
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
            validateContact(event) {
                event.target.value = event.target.value.replace(/[^0-9 +]/g, '');
                this.order.contact = event.target.value;
            },
            sort(field) {
                if (field === 'default') {
                    this.sortCriterion.field = '';
                } else if (this.sortCriterion.field === field) {
                    this.sortCriterion.order = this.sortCriterion.order === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortCriterion.field = field;
                    this.sortCriterion.order = 'asc';
                }
                this.isDropdownVisible = false;
            },
            toggleDropdown() {
                this.isDropdownVisible = !this.isDropdownVisible;
            },
            closeDropdown(event) {
                if (!this.$el.contains(event.target)) {
                    this.isDropdownVisible = false;
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
            sortedProducts() {
                let productsArray = this.products.slice(0);
                if (this.sortCriterion.field) {
                    productsArray.sort((a, b) => {
                        if (this.sortCriterion.field === 'price') {
                            return this.sortCriterion.order === 'asc' ? a.price - b.price : b.price - a.price;
                        } else if (this.sortCriterion.field === 'subject') {
                            return this.sortCriterion.order === 'asc' ? a.subject.localeCompare(b.subject) : b.subject.localeCompare(a.subject);
                        }
                    });
                }
                return productsArray;
            },
            filteredProducts() {
                let filtered = this.sortedProducts;
                if (this.searchQuery) {
                    filtered = filtered.filter(product =>
                        product.subject.toLowerCase().includes(this.searchQuery.toLowerCase())
                    );
                }
                return filtered;
            },
        },
        mounted() {
            this.products = products;
            document.addEventListener('click', this.closeDropdown);
        },
        beforeDestroy() {
            document.removeEventListener('click', this.closeDropdown);
        }
    });
});