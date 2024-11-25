document.addEventListener('DOMContentLoaded', function() {
    new Vue({
        el: '#app',
        data: {
            sitename: 'After School Club',
            showProduct: true,
            products: [],
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
                field: 'default', // Default sorting by 'default'
                order: 'asc' // Always ascending by default
            },
            searchQuery: '',
            isDropdownVisible: false,
        },
        methods: {
            fetchProducts() {
                fetch('https://afterschoolbackend-bldm.onrender.com/collection/clubs')
                    .then(response => response.json())
                    .then(data => {
                        this.products = data;
                        this.sortProducts();
                    })
                    .catch(error => {
                        console.error("Error fetching products:", error);
                    });
            },

            // Add to cart functionality
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

            // Show checkout view
            showCheckout() {
                if (this.cart.length === 0) {
                    alert("Your cart is empty. Please add items before checking out.");
                    return;
                }
                this.showProduct = !this.showProduct;
            },

            // Submit order form
            submitForm() {
                if (this.order.firstName && this.order.lastName && this.order.address && this.order.paymentMethod) {
                    alert("Order Submitted!");
                    this.cart = [];
                    this.order = {
                        firstName: '',
                        lastName: '',
                        address: '',
                        contact: '',
                        email: '',
                        paymentMethod: 'Cash',
                        cardNumber: '',
                    };
                    this.showProduct = true;
                } else {
                    alert("Please fill in all fields");
                }
            },

            // Check if a product can be added to cart
            canAddToCart(product) {
                return product.availableSpace > 0;
            },

            // Increase quantity of a product in the cart
            increaseQuantity(item) {
                const product = this.products.find(p => p.id === item.id);
                if (product && product.availableSpace > 0) {
                    item.count += 1;
                    product.availableSpace -= 1;
                }
            },

            // Decrease quantity of a product in the cart
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

            // Remove an item from the cart
            removeFromCart(item) {
                this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    product.availableSpace += item.count;
                }

                if (this.cart.length === 0) {
                    window.location.href = '/';
                }
            },

            // Validate contact number input
            validateContact() {
                const contactInput = this.order.contact;
                this.order.contact = contactInput.replace(/[^0-9+]/g, '');
            },

            // Handle sorting option change (dropdown)
            sortField(criterion) {
                this.sortCriterion.field = criterion;
                this.sortCriterion.order = 'asc';
                this.sortProducts();

                this.isDropdownVisible = false;
            },

            // Sort products based on the selected criterion
            sortProducts() {
                // Ensure the list is sorted based on the field and order
                if (this.sortCriterion.field === 'subject') {
                    this.products.sort((a, b) => a.subject.localeCompare(b.subject));
                } else if (this.sortCriterion.field === 'price') {
                    this.products.sort((a, b) => a.price - b.price);
                } else if (this.sortCriterion.field === 'location') {
                    this.products.sort((a, b) => a.location.localeCompare(b.location));
                } else if (this.sortCriterion.field === 'availability') {
                    this.products.sort((a, b) => a.availableSpace - b.availableSpace);
                } else if (this.sortCriterion.field === 'default') {
                    this.products.sort((a, b) => a.id - b.id);
                }

                // Apply the order (ascending or descending)
                if (this.sortCriterion.order === 'desc') {
                    this.products.reverse(); // Reverse for descending order
                }
            },

            // Toggle sorting dropdown visibility
            toggleDropdown() {
                this.isDropdownVisible = !this.isDropdownVisible;
            }
        },

        computed: {
            filteredProducts() {
                let filtered = this.products.filter(product => {
                    const query = this.searchQuery.toLowerCase();

                    const matchesSubject = product.subject.toLowerCase().includes(query);
                    const matchesLocation = product.location.toLowerCase().includes(query);
                    const matchesAvailableSpace = product.availableSpace.toString().includes(query);
                    const matchesPrice = product.price.toString().includes(query);

                    return matchesSubject || matchesLocation || matchesAvailableSpace || matchesPrice;
                });

                return filtered;
            },

            totalCartValue() {
                return this.cart.reduce((total, item) => total + item.price * item.count, 0);
            },

            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },

            isOrderFormComplete() {
                return this.order.firstName && this.order.lastName && this.order.address && this.order.contact && this.order.email && this.order.paymentMethod;
            },
        },

        mounted() {
            this.fetchProducts();
        }
    });
});