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
                    this.generatePDFReceipt();
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
            generatePDFReceipt() {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const imgData = 'data:image/png;base64,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';
                doc.addImage(imgData, 'JPEG', 25, 20, 20, 20);
                doc.setFontSize(18);
                doc.text("After School Club Receipt", 65, 30, { align: "left" });
                doc.setFontSize(12);
                doc.text(`First Name: ${this.order.firstName}`, 20, 60);
                doc.text(`Last Name: ${this.order.lastName}`, 20, 70);
                doc.text(`Address: ${this.order.address}`, 20, 80);
                doc.text(`Contact: ${this.order.contact}`, 20, 90);
                doc.text(`Email: ${this.order.email}`, 20, 100);
                doc.text("Ordered Subjects:", 20, 120);

                let yPosition = 130;
                this.cart.forEach(item => {
                    doc.text(`- ${item.subject} x${item.count} (${item.count * item.price} AED)`, 20, yPosition);
                    yPosition += 10;
                });

                doc.text(`Total Value: ${this.totalCartValue} AED`, 20, yPosition + 10);
                doc.text(`Payment Method: ${this.order.paymentMethod}`, 20, yPosition + 20);
                doc.save("Booking Receipt.pdf");

                this.cart = [];
                this.showProduct = true;
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