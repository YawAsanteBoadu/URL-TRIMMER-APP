// Authentication JavaScript for Login and Signup pages

document.addEventListener('DOMContentLoaded', function() {
    // Common elements
    const togglePassword = document.getElementById('togglePassword');
    const passwordIcon = document.getElementById('passwordIcon');
    const passwordInput = document.getElementById('password');
    
    // Login form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const rememberMe = document.getElementById('rememberMe');
    
    // Signup form elements
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms');
    const newsletter = document.getElementById('newsletter');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordStrengthText = document.getElementById('passwordStrengthText');
    
    // Error and success sections
    const errorSection = document.getElementById('errorSection');
    const successSection = document.getElementById('successSection');
    const errorMessage = document.getElementById('errorMessage');

    // Initialize event listeners
    initializeEventListeners();

    function initializeEventListeners() {
        // Password toggle functionality
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', togglePasswordVisibility);
        }

        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            
            if (emailInput) {
                emailInput.addEventListener('blur', validateEmail);
                emailInput.addEventListener('input', clearValidation);
            }
            
            if (passwordInput) {
                passwordInput.addEventListener('input', clearValidation);
            }
        }

        // Signup form
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
            
            if (fullNameInput) {
                fullNameInput.addEventListener('blur', validateName);
                fullNameInput.addEventListener('input', clearValidation);
            }
            
            if (emailInput) {
                emailInput.addEventListener('blur', validateEmail);
                emailInput.addEventListener('input', clearValidation);
            }
            
            if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                    validatePassword();
                    checkPasswordStrength();
                    clearValidation();
                });
            }
            
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', validatePasswordMatch);
                confirmPasswordInput.addEventListener('blur', validatePasswordMatch);
            }
        }
    }

    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        if (type === 'text') {
            passwordIcon.classList.remove('fa-eye');
            passwordIcon.classList.add('fa-eye-slash');
        } else {
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberMe ? rememberMe.checked : false;

        // Hide previous messages
        hideMessages();

        // Validate inputs
        if (!validateEmail() || !password) {
            showError('Please fill in all required fields.');
            return;
        }

        // Show loading state
        const loginBtn = document.getElementById('loginBtn');
        showLoadingState(loginBtn, 'Signing in...');

        try {
            // Simulate API call
            const response = await simulateLogin(email, password, remember);
            
            if (response.success) {
                showSuccess();
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError('An error occurred during login. Please try again.');
        } finally {
            hideLoadingState(loginBtn, '<i class="fas fa-sign-in-alt me-2"></i>Sign In');
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const agreeToTerms = agreeTerms.checked;
        const subscribeNewsletter = newsletter ? newsletter.checked : false;

        // Hide previous messages
        hideMessages();

        // Validate all inputs
        let isValid = true;
        
        if (!validateName()) isValid = false;
        if (!validateEmail()) isValid = false;
        if (!validatePassword()) isValid = false;
        if (!validatePasswordMatch()) isValid = false;
        if (!validateTermsAgreement()) isValid = false;

        if (!isValid) {
            showError('Please correct the errors above.');
            return;
        }

        // Show loading state
        const signupBtn = document.getElementById('signupBtn');
        showLoadingState(signupBtn, 'Creating account...');

        try {
            // Simulate API call
            const response = await simulateSignup(fullName, email, password, subscribeNewsletter);
            
            if (response.success) {
                showSuccess();
                // Clear form
                signupForm.reset();
                clearAllValidations();
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError('An error occurred during signup. Please try again.');
        } finally {
            hideLoadingState(signupBtn, '<i class="fas fa-user-plus me-2"></i>Create Account');
        }
    }

    function validateName() {
        if (!fullNameInput) return true;
        
        const name = fullNameInput.value.trim();
        const nameError = document.getElementById('nameError');
        
        fullNameInput.classList.remove('is-invalid', 'is-valid');
        
        if (!name) {
            fullNameInput.classList.add('is-invalid');
            nameError.textContent = 'Full name is required';
            return false;
        }
        
        if (name.length < 2) {
            fullNameInput.classList.add('is-invalid');
            nameError.textContent = 'Name must be at least 2 characters';
            return false;
        }
        
        fullNameInput.classList.add('is-valid');
        return true;
    }

    function validateEmail() {
        if (!emailInput) return true;
        
        const email = emailInput.value.trim();
        const emailError = document.getElementById('emailError');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        emailInput.classList.remove('is-invalid', 'is-valid');
        
        if (!email) {
            emailInput.classList.add('is-invalid');
            emailError.textContent = 'Email is required';
            return false;
        }
        
        if (!emailPattern.test(email)) {
            emailInput.classList.add('is-invalid');
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        
        emailInput.classList.add('is-valid');
        return true;
    }

    function validatePassword() {
        if (!passwordInput) return true;
        
        const password = passwordInput.value;
        const passwordError = document.getElementById('passwordError');
        
        passwordInput.classList.remove('is-invalid', 'is-valid');
        
        if (!password) {
            passwordInput.classList.add('is-invalid');
            passwordError.textContent = 'Password is required';
            return false;
        }
        
        if (password.length < 8) {
            passwordInput.classList.add('is-invalid');
            passwordError.textContent = 'Password must be at least 8 characters';
            return false;
        }
        
        // Additional password strength requirements for signup
        if (signupForm) {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                passwordInput.classList.add('is-invalid');
                passwordError.textContent = 'Password must contain uppercase, lowercase, and numbers';
                return false;
            }
        }
        
        passwordInput.classList.add('is-valid');
        return true;
    }

    function validatePasswordMatch() {
        if (!confirmPasswordInput) return true;
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        
        confirmPasswordInput.classList.remove('is-invalid', 'is-valid');
        
        if (!confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordError.textContent = 'Please confirm your password';
            return false;
        }
        
        if (password !== confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordError.textContent = 'Passwords do not match';
            return false;
        }
        
        confirmPasswordInput.classList.add('is-valid');
        return true;
    }

    function validateTermsAgreement() {
        if (!agreeTerms) return true;
        
        const termsError = document.getElementById('termsError');
        
        if (!agreeTerms.checked) {
            agreeTerms.classList.add('is-invalid');
            termsError.textContent = 'You must agree to the terms and conditions';
            return false;
        }
        
        agreeTerms.classList.remove('is-invalid');
        return true;
    }

    function checkPasswordStrength() {
        if (!passwordStrength || !passwordStrengthText) return;
        
        const password = passwordInput.value;
        let strength = 0;
        let strengthText = '';
        let strengthClass = '';
        
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 15;
        
        if (strength < 40) {
            strengthText = 'Weak';
            strengthClass = 'bg-danger';
        } else if (strength < 70) {
            strengthText = 'Medium';
            strengthClass = 'bg-warning';
        } else {
            strengthText = 'Strong';
            strengthClass = 'bg-success';
        }
        
        passwordStrength.style.width = `${strength}%`;
        passwordStrength.className = `progress-bar ${strengthClass}`;
        passwordStrengthText.textContent = `Password strength: ${strengthText}`;
    }

    function clearValidation() {
        // Remove validation classes when user starts typing
        if (event.target) {
            event.target.classList.remove('is-invalid', 'is-valid');
        }
    }

    function clearAllValidations() {
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
        
        if (passwordStrength) {
            passwordStrength.style.width = '0%';
            passwordStrength.className = 'progress-bar';
        }
        
        if (passwordStrengthText) {
            passwordStrengthText.textContent = 'Password strength';
        }
    }

    function showLoadingState(button, text) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
    }

    function hideLoadingState(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    }

    function showError(message) {
        hideMessages();
        errorMessage.textContent = message;
        errorSection.classList.remove('d-none');
        errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showSuccess() {
        hideMessages();
        successSection.classList.remove('d-none');
        successSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideMessages() {
        errorSection.classList.add('d-none');
        successSection.classList.add('d-none');
    }

    // Simulate API calls (replace with actual backend integration)
    async function simulateLogin(email, password, remember) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate different responses
        if (email === 'test@example.com' && password === 'password123') {
            return { success: true };
        }
        
        if (email === 'blocked@example.com') {
            return { 
                success: false, 
                error: 'Account has been temporarily blocked. Please contact support.' 
            };
        }
        
        return { 
            success: false, 
            error: 'Invalid email or password. Please try again.' 
        };
    }

    async function simulateSignup(fullName, email, password, newsletter) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Simulate existing email
        if (email === 'existing@example.com') {
            return { 
                success: false, 
                error: 'An account with this email already exists.' 
            };
        }
        
        return { success: true };
    }

    // Social login handlers (placeholder)
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.includes('Google') || button.textContent.includes('GitHub')) {
            button.addEventListener('click', function() {
                showToast('Social login will be implemented with backend integration', 'info');
            });
        }
    });
});