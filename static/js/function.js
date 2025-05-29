/**
 * Main application functionality
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize general UI components
    initializeUI();
    
    // Initialize pagination system if available
    if (typeof initializePagination === 'function') {
        initializePagination();
        console.log('Pagination system initialized');
    }

    // Set up event listeners
    setupEventListeners();
    
    // Ensure daily offer section shows exactly 2 items
    limitDailyOfferItems();
});

/**
 * Limit the number of daily offer items visible on initial page load to exactly 2
 */
function limitDailyOfferItems() {
    const dailyOfferContainer = document.querySelector('.daily-offer-grid');
    if (dailyOfferContainer) {
        const items = dailyOfferContainer.querySelectorAll('.daily-offer-item');
        
        // Hide all items beyond the first 2
        if (items.length > 2) {
            for (let i = 2; i < items.length; i++) {
                items[i].style.display = 'none';
            }
        }
        
        // Ensure the pagination starts with the correct active page
        const pagination = document.querySelector('[data-section="daily-offer"]');
        if (pagination) {
            const pageLinks = pagination.querySelectorAll('.page-link');
            // Activate the first page link if it exists
            if (pageLinks.length > 0) {
                const firstPageItem = pageLinks[0].closest('.page-item');
                if (firstPageItem) {
                    firstPageItem.classList.add('active');
                }
            }
        }
    }
}

/**
 * Initialize UI components
 */
function initializeUI() {
    // Initialize any UI components like sliders, accordions, etc.
    initializeSliders();
    initializeScrollToTop();
}

/**
 * Initialize sliders
 */
function initializeSliders() {
    // Check if Owl Carousel is available
    if (typeof $.fn.owlCarousel !== 'undefined') {
        // Primary slider
        if ($('#hero-slider').length) {
            $('#hero-slider').owlCarousel({
                items: 1,
                autoplay: true,
                autoplayTimeout: 8000,
                loop: true,
                nav: true,
                dots: false,
                navText: ['<i class="fas fa-angle-left"></i>', '<i class="fas fa-angle-right"></i>'],
                responsive: {
                    0: { items: 1 }
                }
            });
        }
    }
}

/**
 * Initialize scroll-to-top functionality
 */
function initializeScrollToTop() {
    // Check if scrollUp is available
    if (typeof $.scrollUp !== 'undefined') {
        $.scrollUp({
            scrollName: 'scrollUp',
            scrollDistance: 300,
            scrollFrom: 'top',
            scrollSpeed: 300,
            easingType: 'linear',
            animation: 'fade',
            animationSpeed: 200,
            scrollTrigger: false,
            scrollTarget: false,
            scrollText: '<i class="fas fa-arrow-up"></i>',
            scrollTitle: 'Scroll to top',
            scrollImg: false,
            activeOverlay: false,
            zIndex: 2147483647
        });
    }
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    // Pagination click events are handled by the pagination system
    
    // Add other event listeners here
    
    // Form submission handlers
    document.querySelectorAll('form.ajax-form').forEach(form => {
        form.addEventListener('submit', handleAjaxForm);
    });
}

/**
 * Handle AJAX form submissions
 * @param {Event} e - The submit event
 */
function handleAjaxForm(e) {
    e.preventDefault();
    const form = e.target;
    const url = form.getAttribute('action');
    const method = form.getAttribute('method') || 'POST';
    const formData = new FormData(form);
    
    // Create loading indicator
    const submitBtn = form.querySelector('[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Make AJAX request
    fetch(url, {
        method: method,
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        // Handle response
        if (data.status === 'success') {
            // Show success message
            if (typeof alertify !== 'undefined') {
                alertify.success(data.message || 'Operation completed successfully');
            } else {
                alert(data.message || 'Operation completed successfully');
            }
            
            // Redirect if needed
            if (data.redirect) {
                window.location.href = data.redirect;
            }
            
            // Reset form if needed
            if (data.reset_form) {
                form.reset();
            }
        } else {
            // Show error message
            if (typeof alertify !== 'undefined') {
                alertify.error(data.message || 'An error occurred');
            } else {
                alert(data.message || 'An error occurred');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        
        // Show error message
        if (typeof alertify !== 'undefined') {
            alertify.error('An error occurred. Please try again.');
        } else {
            alert('An error occurred. Please try again.');
        }
    });
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.appFunctions = {
        initializeUI,
        initializeSliders,
        initializeScrollToTop,
        setupEventListeners,
        handleAjaxForm
    };
}

// Function to check if an item is in the cart
function isItemInCart(productId) {
    // Assuming you have a cart array that holds product IDs
    var cartItems = JSON.parse(localStorage.getItem('cartItems')) || []; // Example using local storage
    return cartItems.includes(productId); // Check if the productId is in the cart
}

function handleAddToCart(productId, productQty) {
    // Check if the item is already in the cart
    if (isItemInCart(productId)) {
        // Display a message if the item is already in the cart
        alertify.error('Product already in cart');
        return; // Do not proceed with adding to cart if the item is already in the cart
    }

    $.ajax({
        type: 'POST',
        url: '/cart/add/' + productId + '/', // Construct the URL dynamically
        data: {
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
            product_id: productId,
            product_qty: productQty, // Use the validated quantity
            action: 'post'
        },
        success: function (json) {
            // Update the cart quantity displayed on the page
            document.getElementById('cart_quantity').textContent = json.qty; // Update cart quantity
            // Display success message
            alertify.success(json.message);
            // Display alert message
            var alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success text-center';
            alertDiv.role = 'alert';
            alertDiv.textContent = 'Product added to cart successfully!';
            var alertContainer = document.getElementById('alert-container');
            if (alertContainer) {
                alertContainer.appendChild(alertDiv); // Append to a specific container if it exists
            }
            // Update button text
            $('#addCart').text('Product added to cart');
            // Update the quantity input field
            $('#qty_input').val(productQty);
            // Update the cart length displayed on the page
            $('#cart_length').text(json.qty); // Assuming you have an element with id 'cart_length' to display the cart length
        },
        error: function (xhr, errmsg, err) {
            console.error(xhr.responseText); // Log the full response for debugging
        }
    });
}

$(document).on('click', '#addCart', function (e) {
    e.preventDefault();

    var productId = $(this).data('product-id'); // Correctly access the data attribute
    console.log("Product ID:", productId); // Debugging line to check the product ID

    // Get the quantity value and ensure it's a valid number
    var productQty = $('#qty_input').val(); // Use .val() to get the input value
    if (!productQty || isNaN(productQty) || productQty <= 0) {
        productQty = 1; // Default to 1 if the input is invalid
    } else {
        productQty = parseInt(productQty); // Convert to integer
    }

    handleAddToCart(productId, productQty);
});

function addToCart(button) {
    var productId = $(button).data('product-id'); // Correctly access the data attribute
    console.log("Product ID:", productId); // Debugging line to check the product ID

    // Get the quantity value and ensure it's a valid number
    var productQty = $('#qty_input').val(); // Use .val() to get the input value
    if (!productQty || isNaN(productQty) || productQty <= 0) {
        productQty = 1; // Default to 1 if the input is invalid
    } else {
        productQty = parseInt(productQty); // Convert to integer
    }

    handleAddToCart(productId, productQty);
}

// Assuming you have a function to handle the AJAX request
function deleteProduct(productId) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value; // Get CSRF token from the DOM

    fetch('/cart/delete/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken // Include CSRF token in the headers
        },
        body: JSON.stringify({ product_id: productId }) // Send product ID as JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.product) {
            console.log(`Product ${data.product} deleted successfully.`);
            // Optionally, update the UI to reflect the deletion
        } else {
            console.error('Error deleting product:', data.error);
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateCartQuantity(productId, productQty) {
    $.ajax({
        type: 'POST',
        url: '/cart/update/',
        data: {
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
            product_id: productId,
            product_qty: productQty
        },
        success: function (json) {
            alertify.success('Product quantity updated successfully');
        },
        error: function (xhr, errmsg, err) {
            console.error(xhr.responseText);
        }
    });
}

$(document).on('change', '#qty_input', function () {
    var productId = $(this).data('product-id');
    var productQty = $(this).val();
    if (!productQty || isNaN(productQty) || productQty <= 0) {
        productQty = 1;
    } else {
        productQty = parseInt(productQty);
    }
    updateCartQuantity(productId, productQty);
});


