document.addEventListener('DOMContentLoaded', function () {
    new Vue({
        el: '#app',
        data: {
            sitename: 'After School Club',
            showProduct: true,
            products: [],
            cart: [],
            searchQuery: '',
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
                field: 'default',
                order: 'asc',
            },
            isDropdownVisible: false,
        },
        methods: {
            // Fetch products from the API and initialize sorting
            fetchProducts(query = '') {
                const url = `https://afterschoolbackend-bldm.onrender.com/collection/clubs/search?query=${encodeURIComponent(query)}`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this.products = data;
                        this.sortProducts(); // Sort products after fetching
                    })
                    .catch(error => {
                        console.error("Error fetching products:", error);
                    });
            },

            searchClubs() {
                this.fetchProducts(this.searchQuery); 
            },

            goHome() {
                this.cart = [];
                this.showProduct = true;
            },

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
                if (!this.order.firstName || !this.order.contact) {
                    alert("Please fill in all required fields.");
                    return;
                }

                const nameRegex = /^[a-zA-Z\s]+$/; // Letters and spaces only
                if (!nameRegex.test(this.order.firstName) || !nameRegex.test(this.order.lastName)) {
                    alert("First and Last Name must contain only letters.");
                    return;
                }

                if (!this.order.contact) {
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
                this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    product.availableSpace += item.count;
                }

                if (this.cart.length === 0) {
                    this.showProduct = true;
                }
            },

            validateContact() {
                const contactInput = this.order.contact;
                this.order.contact = contactInput.replace(/[^0-9+]/g, '');
            },

            validateName(field) {
                const nameRegex = /^[a-zA-Z\s]*$/;
                const value = this.order[field];
                if (!nameRegex.test(value)) {
                    // Remove invalid characters
                    this.order[field] = value.replace(/[^a-zA-Z\s]/g, '');
                }
            },

            sortField(criterion) {
                this.sortCriterion.field = criterion;
                this.sortCriterion.order = 'asc';
                this.sortProducts();
                this.isDropdownVisible = false;
            },

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

            toggleDropdown() {
                this.isDropdownVisible = !this.isDropdownVisible;
            },

            // Call the fetchProducts method whenever search query changes
            searchClubs() {
                this.fetchProducts(this.searchQuery); // Pass search query to backend API
            },
        },
        computed: {
            totalCartValue() {
                return this.cart.reduce((total, item) => total + item.price * item.count, 0);
            },

            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },

            isOrderFormComplete() {
                return this.order.firstName.trim() && this.order.lastName.trim() && this.order.address.trim() && this.order.contact.trim() && this.order.email.trim() && this.order.paymentMethod && (this.order.paymentMethod !== 'Card' || this.order.cardNumber.trim()) && this.order.firstName.trim() !== '' && this.order.lastName.trim() !== '' && this.order.address.trim() !== '' && this.order.contact.trim() !== '' && this.order.email.trim() !== '';
            }
        },
        mounted() {
            this.fetchProducts(); // Fetch all products initially
        }
    });
});