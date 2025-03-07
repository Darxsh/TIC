// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the form elements
    const joinForm = document.querySelector('.join-form');
    
    if (!joinForm) return; // Exit if no form found
    
    // Handle form submission
    joinForm.addEventListener('submit', async function(event) {
        // Prevent the default form submission
        event.preventDefault();
        
        // Get form values
        const formData = {};
        
        // Get all form inputs
        const inputs = joinForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else if (input.name) {
                formData[input.name] = input.value.trim();
            }
        });
        
        // Clear any previous error states
        inputs.forEach(input => {
            input.classList.remove('invalid');
            const errorSpan = input.parentElement.querySelector('.error-message');
            if (errorSpan) {
                errorSpan.remove();
            }
        });
        
        // Validate required fields
        const requiredFields = joinForm.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalidField = null;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                markFieldAsInvalid(field, 'This field is required');
                if (!firstInvalidField) firstInvalidField = field;
            }
        });
        
        if (!isValid) {
            showNotification('Please fill all required fields marked with *', 'error');
            firstInvalidField.focus();
            return false;
        }

        // Validate reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            showNotification('Please complete the reCAPTCHA verification', 'error');
            return false;
        }
        
        // Submit form
        await submitJoinForm(formData);
    });
    
    // Function to mark a field as invalid
    function markFieldAsInvalid(field, message) {
        field.classList.add('invalid');
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        field.parentElement.appendChild(errorSpan);
    }
    
    // Function to submit join form data
    async function submitJoinForm(formData) {
        try {
            showNotification('Processing your application...', 'info');
            
            const response = await fetch('/api/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (data.field) {
                    // Mark the specific field as invalid
                    const field = joinForm.querySelector(`[name="${data.field}"]`);
                    if (field) {
                        markFieldAsInvalid(field, data.message);
                        field.focus();
                    }
                }
                throw new Error(data.message || 'Submission failed');
            }
            
            // Reset form and show success
            joinForm.reset();
            grecaptcha.reset(); // Reset reCAPTCHA
            
            // Show success message
            showNotification(data.message || 'Application submitted successfully! Please check your email.', 'success');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Submission error:', error);
            showNotification(error.message || 'Submission failed. Please try again.', 'error');
        }
    }
    
    // Function to show notifications
    function showNotification(message, type) {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
});