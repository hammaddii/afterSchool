// Wait until the DOM content is fully loaded before initializing Vue
document.addEventListener('DOMContentLoaded', function () {
    new Vue({
        el: '#app', // The root Vue instance binds to the element with the ID 'app'
        data: {
            sitename: 'After School Club', // Title of the application
            showProduct: true, // Boolean to toggle between the product list and checkout view
            products: [], // Array to store the list of products fetched from the backend
            cart: [], // Array to hold items added to the shopping cart
            searchQuery: '', // String to store the user's search input
            order: {
                // Object to capture user's order details
                firstName: '',
                lastName: '',
                address: '',
                contact: '',
                email: '',
                paymentMethod: 'Cash', // Default payment method
                cardNumber: '',
            },
            sortCriterion: {
                field: 'default', // Field to sort by (default sorting initially)
                order: 'asc', // Sorting order (ascending initially)
            },
            isDropdownVisible: false, // Boolean to toggle sorting dropdown visibility
        },
        methods: {
            // Fetch products from the backend, optionally filtering with a query
            fetchProducts(query = '') {
                const url = `https://afterschoolbackend-bldm.onrender.com/collection/clubs/search?query=${encodeURIComponent(query)}`;
                fetch(url)
                    .then(response => response.json()) // Parse JSON response
                    .then(data => {
                        this.products = data; // Store fetched products
                        this.sortProducts(); // Automatically sort products after fetching
                    })
                    .catch(error => {
                        console.error("Error fetching products:", error); // Log errors
                    });
            },

            // Trigger product fetching based on the current search query
            searchClubs() {
                this.fetchProducts(this.searchQuery);
            },

            // Clear the cart and show the product list
            goHome() {
                this.cart = [];
                this.showProduct = true;
            },

            // Add a product to the shopping cart
            addToCart(product) {
                const existingItem = this.cart.find(item => item.id === product.id); // Check if product is already in the cart
                if (existingItem) {
                    existingItem.count += 1; // Increment the quantity if already in the cart
                } else {
                    this.cart.push({
                        id: product.id,
                        subject: product.subject,
                        count: 1, // Initialize quantity to 1
                        price: product.price,
                        image: product.image,
                    });
                }
                product.availableSpace -= 1; // Decrease available space for the product
            },

            // Toggle the view to the checkout page if the cart is not empty
            showCheckout() {
                if (this.cart.length === 0) {
                    alert("Your cart is empty. Please add items before checking out.");
                    return;
                }
                this.showProduct = !this.showProduct;
            },

            // Validate and submit the order form
            submitForm() {
                // Ensure all required fields are filled
                if (!this.order.firstName || !this.order.lastName || !this.order.contact || !this.order.email) {
                    alert("Please fill in all required fields.");
                    return;
                }
            
                // Validate that the first and last name contain only letters and spaces
                const nameRegex = /^[a-zA-Z\s]+$/;
                if (!nameRegex.test(this.order.firstName) || !nameRegex.test(this.order.lastName)) {
                    alert("First and Last Name must contain only letters.");
                    return;
                }
            
                // If the payment method is "Card", ensure the card number is filled
                if (this.order.paymentMethod === 'Card' && !this.order.cardNumber) {
                    alert("Please enter your card details.");
                    return;
                }
            
                // If all checks pass, proceed with form submission
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

            // Check if a product can be added to the cart
            canAddToCart(product) {
                return product.availableSpace > 0;
            },

            // Increase the quantity of an item in the cart
            increaseQuantity(item) {
                const product = this.products.find(p => p.id === item.id); // Find the corresponding product
                if (product && product.availableSpace > 0) {
                    item.count += 1; // Increment quantity
                    product.availableSpace -= 1; // Decrement available space
                }
            },

            // Decrease the quantity of an item or remove it from the cart
            decreaseQuantity(item) {
                if (item.count > 1) {
                    item.count -= 1; // Decrease quantity
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        product.availableSpace += 1; // Restore available space
                    }
                } else {
                    this.removeFromCart(item); // Remove the item if quantity is 1
                }
            },

            // Remove an item from the cart and restore its available space
            removeFromCart(item) {
                this.cart = this.cart.filter(cartItem => cartItem.id !== item.id); // Remove item
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    product.availableSpace += item.count; // Restore spaces
                }

                // Show product list if the cart is empty
                if (this.cart.length === 0) {
                    this.showProduct = true;
                }
            },

            // Validate contact number to allow only digits and the '+' character
            validateContact() {
                const contactInput = this.order.contact;
                this.order.contact = contactInput.replace(/[^0-9+]/g, ''); // Remove invalid characters
            },

            // Validate name fields to allow only letters and spaces
            validateName(field) {
                const nameRegex = /^[a-zA-Z\s]*$/; // Regex for letters and spaces
                const value = this.order[field];
                this.order[field] = value.replace(/[^a-zA-Z\s]/g, ''); // Remove invalid characters
            },

            // Set the sorting field and order, then sort products
            sortField(criterion) {
                this.sortCriterion.field = criterion;
                this.sortCriterion.order = 'asc'; // Reset to ascending order
                this.sortProducts();
                this.isDropdownVisible = false; // Hide dropdown after selection
            },

            // Sort products based on the selected criterion and order
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

                // Reverse the order for descending
                if (this.sortCriterion.order === 'desc') {
                    this.products.reverse();
                }
            },

            // Toggle the visibility of the sorting dropdown
            toggleDropdown() {
                this.isDropdownVisible = !this.isDropdownVisible;
            },
        },
        computed: {
            // Calculate the total cart value
            totalCartValue() {
                return this.cart.reduce((total, item) => total + item.price * item.count, 0);
            },

            // Calculate the total number of items in the cart
            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },

            // Check if the order form is complete
            isOrderFormComplete() {
                return this.order.firstName && this.order.lastName && this.order.contact && this.order.email;
                
            },
        },
        mounted() {
            this.fetchProducts(); // Fetch all products initially on page load
        },
    });
});