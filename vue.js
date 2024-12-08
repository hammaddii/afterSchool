document.addEventListener('DOMContentLoaded', function () {
    new Vue({
        el: '#app',
        data: {
            sitename: 'After School Club',
            showProduct: true, // Controls whether the product list is shown or not
            products: [], // Holds the list of products
            cart: [], // Holds the products added to the cart
            searchQuery: '', // Stores the search query for filtering products
            order: {
                firstName: '',
                lastName: '',
                address: '',
                contact: '',
                email: '',
                paymentMethod: 'Cash', // Default payment method
                cardNumber: '', // Card number, relevant if payment is via card
            },
            sortCriterion: {
                field: 'default', // Default sorting criterion
                order: 'asc', // Sorting order (ascending)
            },
            isDropdownVisible: false, // Controls visibility of the sorting dropdown
        },
        methods: {
            // Fetch products from the backend based on search query
            fetchProducts(query = '') {
                const url = `https://afterschoolbackend-bldm.onrender.com/collection/clubs/search?query=${encodeURIComponent(query)}`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this.products = data; // Store the fetched products
                        this.sortProducts(); // Sort the products after fetching
                    })
                    .catch(error => {
                        console.error("Error fetching products:", error); // Error handling for fetch
                    });
            },

            // Triggered when a user performs a search
            searchClubs() {
                this.fetchProducts(this.searchQuery); // Fetch products based on the search query
            },

            // Reset the cart and show the product list again
            goHome() {
                this.cart = [];
                this.showProduct = true;
            },

            // Add a product to the cart, increase quantity if already in cart
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
                product.availableSpace -= 1; // Decrease available space in the product
            },

            // Toggle between the product list and checkout view
            showCheckout() {
                if (this.cart.length === 0) {
                    alert("Your cart is empty. Please add items before checking out.");
                    return;
                }
                this.showProduct = !this.showProduct; // Toggle the product list visibility
            },

            // Submit the order after validation
            submitForm() {
                // Check if required fields are filled
                if (!this.order.firstName || !this.order.lastName || !this.order.contact || !this.order.email) {
                    alert("Please fill in all required fields.");
                    return;
                }

                // Validate name fields (first name and last name)
                const nameRegex = /^[a-zA-Z\s]+$/;
                if (!nameRegex.test(this.order.firstName) || !nameRegex.test(this.order.lastName)) {
                    alert("First and Last Name must contain only letters.");
                    return;
                }

                // Check if payment method is 'Card' and card number is provided
                if (this.order.paymentMethod === 'Card' && !this.order.cardNumber) {
                    alert("Please enter your card details.");
                    return;
                }

                // Proceed to submit the order if everything is valid
                const orderData = {
                    name: `${this.order.firstName} ${this.order.lastName}`,
                    phoneNumber: this.order.contact,
                    clubs: this.cart.map(item => ({
                        clubId: item.id,
                        spaces: item.count,
                    })),
                };

                // Send the order data to the backend via POST request
                fetch('https://afterschoolbackend-bldm.onrender.com/collection/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData), // Order data as the request body
                })
                    .then(response => response.json())
                    .then(data => {
                        alert("Order submitted successfully!"); // Success message
                        this.cart = []; // Clear the cart after successful submission
                        this.order = { // Reset the order form
                            firstName: '',
                            lastName: '',
                            address: '',
                            contact: '',
                            email: '',
                            paymentMethod: 'Cash',
                            cardNumber: '',
                        };
                        this.showProduct = true; // Go back to the product list view
                    })
                    .catch(error => {
                        console.error("Error submitting order:", error); // Error handling for order submission
                        alert("There was an error submitting your order. Please try again.");
                    });
            },

            // Check if product can be added to the cart based on availability
            canAddToCart(product) {
                return product.availableSpace > 0;
            },

            // Increase the quantity of an item in the cart
            increaseQuantity(item) {
                const product = this.products.find(p => p.id === item.id);
                if (product && product.availableSpace > 0) {
                    item.count += 1;
                    product.availableSpace -= 1; // Decrease available space
                }
            },

            // Decrease the quantity of an item in the cart or remove it
            decreaseQuantity(item) {
                if (item.count > 1) {
                    item.count -= 1;
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        product.availableSpace += 1; // Increase available space
                    }
                } else {
                    this.removeFromCart(item); // Remove the item from the cart if quantity is 1
                }
            },

            // Remove an item from the cart and update product availability
            removeFromCart(item) {
                this.cart = this.cart.filter(cartItem => cartItem.id !== item.id); // Remove item from cart
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    product.availableSpace += item.count; // Add the removed item's quantity back to the available space
                }

                // If the cart is empty, show the product list again
                if (this.cart.length === 0) {
                    this.showProduct = true;
                }
            },

            // Validate and format the contact input (allow only numbers and '+')
            validateContact() {
                const contactInput = this.order.contact;
                this.order.contact = contactInput.replace(/[^0-9+]/g, ''); // Remove non-numeric characters
            },

            // Validate name fields to allow only letters and spaces
            validateName(field) {
                const nameRegex = /^[a-zA-Z\s]*$/;
                const value = this.order[field];
                this.order[field] = value.replace(/[^a-zA-Z\s]/g, ''); // Remove non-letter characters
            },

            // Handle sorting by different fields (subject, price, location, etc.)
            sortField(criterion) {
                this.sortCriterion.field = criterion; // Set the sorting criterion
                this.sortCriterion.order = 'asc'; // Default order is ascending
                this.sortProducts(); // Apply sorting
                this.isDropdownVisible = false; // Hide the dropdown after selection
            },

            // Sort the products based on the selected criterion
            sortProducts() {
                if (this.sortCriterion.field === 'subject') {
                    this.products.sort((a, b) => a.subject.localeCompare(b.subject)); // Sort by subject
                } else if (this.sortCriterion.field === 'price') {
                    this.products.sort((a, b) => a.price - b.price); // Sort by price
                } else if (this.sortCriterion.field === 'location') {
                    this.products.sort((a, b) => a.location.localeCompare(b.location)); // Sort by location
                } else if (this.sortCriterion.field === 'availability') {
                    this.products.sort((a, b) => a.availableSpace - b.availableSpace); // Sort by available space
                } else if (this.sortCriterion.field === 'default') {
                    this.products.sort((a, b) => a.id - b.id); // Default sort by product ID
                }

                // Reverse the array if the sorting order is descending
                if (this.sortCriterion.order === 'desc') {
                    this.products.reverse();
                }
            },

            // Toggle visibility of the sorting dropdown
            toggleDropdown() {
                this.isDropdownVisible = !this.isDropdownVisible;
            },
        },
        computed: {
            // Calculate total value of items in the cart
            totalCartValue() {
                return this.cart.reduce((total, item) => total + item.price * item.count, 0);
            },

            // Calculate total number of items in the cart
            totalCartItemCount() {
                return this.cart.reduce((total, item) => total + item.count, 0);
            },

            // Check if the order form is complete (all required fields filled)
            isOrderFormComplete() {
                return (
                    this.order.firstName &&
                    this.order.lastName &&
                    this.order.address &&
                    this.order.contact &&
                    this.order.email &&
                    this.order.paymentMethod
                );
            },
        },
        mounted() {
            this.fetchProducts(); // Fetch products when the page is loaded
        },
    });
});