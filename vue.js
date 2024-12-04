document.addEventListener('DOMContentLoaded', function () {
    new Vue({
        el: '#app', // Mount Vue instance to the DOM element with id 'app'
        data: {
            sitename: 'After School Club',
            showProduct: true, // Toggle between product view and checkout view
            products: [], // Store fetched product list
            cart: [], // Shopping cart array
            order: {
                firstName: '',
                lastName: '',
                address: '',
                contact: '',
                email: '',
                paymentMethod: 'Cash', // Default payment method
                cardNumber: '', // For card payment method
            },
            sortCriterion: {
                field: 'default', // Default sorting criterion
                order: 'asc', // Default sorting order
            },
            isDropdownVisible: false, // Toggle dropdown menu visibility
        },
        methods: {
            // Fetch products from the API and initialize sorting
            fetchProducts() {
                fetch('https://afterschoolbackend-bldm.onrender.com/collection/clubs')
                    .then(response => response.json())
                    .then(data => {
                        this.products = data;
                        this.sortProducts(); // Sort products after fetching
                    })
                    .catch(error => {
                        console.error("Error fetching products:", error);
                    });
            },

            // Reset the cart and return to the product view
            goHome() {
                this.cart = [];
                this.showProduct = true;
            },

            // Add a product to the cart or increment its count
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
                product.availableSpace -= 1; // Reduce availability
            },

            // Switch between product and checkout views
            showCheckout() {
                if (this.cart.length === 0) {
                    alert("Your cart is empty. Please add items before checking out.");
                    return;
                }
                this.showProduct = !this.showProduct;
            },

            // Submit the order and reset the cart
            submitForm() {
                if (!this.order.firstName || !this.order.contact) {
                    alert("Please fill in all required fields.");
                    return;
                }

                if (this.order.paymentMethod === 'Card' && !this.order.cardNumber) {
                    alert("Please enter your card details.");
                    return;
                }

                const orderData = {
                    name: `${this.order.firstName} ${this.order.lastName}`,
                    phoneNumber: this.order.contact,
                    clubs: this.cart.map(item => ({
                        clubId: item.id,
                        spaces: item.count,
                    })),
                };

                fetch('https://afterschoolbackend-bldm.onrender.com/collection/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                })
                    .then(response => response.json())
                    .then(data => {
                        alert("Order submitted successfully!");
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
                    })
                    .catch(error => {
                        console.error("Error submitting order:", error);
                        alert("There was an error submitting your order. Please try again.");
                    });
            },

            // Validate card number
            validateCardNumber() {
                const cardNumber = this.order.cardNumber;
                if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
                    alert("Please enter a valid 16-digit card number.");
                    return false;
                }
                return true;
            },

            // Check if a product can be added to the cart
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

            // Remove an item from the cart and restore availability
            removeFromCart(item) {
                this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    product.availableSpace += item.count;
                }

                if (this.cart.length === 0) {
                    this.showProduct = true;
                }
            },

            // Validate contact input to allow only numbers and +
            validateContact() {
                const contactInput = this.order.contact;
                this.order.contact = contactInput.replace(/[^0-9+]/g, '');
            },

            // Set sorting field and reset order to ascending
            sortField(criterion) {
                this.sortCriterion.field = criterion;
                this.sortCriterion.order = 'asc';
                this.sortProducts();
                this.isDropdownVisible = false; // Hide dropdown
            },

            // Sort products based on field and order
            sortProducts() {
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

                if (this.sortCriterion.order === 'desc') {
                    this.products.reverse();
                }
            },

            // Toggle sorting dropdown visibility
            toggleDropdown() {
                this.isDropdownVisible = !this.isDropdownVisible;
            }
        },
        computed: {
            // Calculate total cart value
            totalCartValue() {
                return this.cart.reduce((total, item) => total + item.price * item.count, 0);
            },

            // Count total items in the cart
            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },

            // Check if order form is complete
            isOrderFormComplete() {
                return (
                    this.order.firstName && this.order.lastName && this.order.address && this.order.contact && this.order.email && this.order.paymentMethod
                );
            }
        },
        mounted() {
            this.fetchProducts(); // Fetch product data on component mount
        }
    });
});