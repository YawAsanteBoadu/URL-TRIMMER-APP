// Main JavaScript for URL Trimmer Homepage

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const shortenForm = document.getElementById('shortenForm');
    const longUrlInput = document.getElementById('longUrl');
    const customAliasInput = document.getElementById('customAlias');
    const shortenBtn = document.getElementById('shortenBtn');
    const copyBtn = document.getElementById('copyBtn');
    const shortUrlInput = document.getElementById('shortUrl');
    
    // Result and error sections
    const resultSection = document.getElementById('resultSection');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');

    // Form submission handler
    if (shortenForm) {
        shortenForm.addEventListener('submit', handleShortenUrl);
    }

    // Copy button handler
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }

    // Real-time URL validation
    if (longUrlInput) {
        longUrlInput.addEventListener('input', validateUrl);
        longUrlInput.addEventListener('blur', validateUrl);
    }

    // Custom alias validation
    if (customAliasInput) {
        customAliasInput.addEventListener('input', validateAlias);
    }

    async function handleShortenUrl(e) {
        e.preventDefault();
        
        const longUrl = longUrlInput.value.trim();
        const customAlias = customAliasInput.value.trim();

        // Hide previous results/errors
        hideResultsAndErrors();

        // Validate inputs
        if (!validateUrl()) {
            return;
        }

        if (customAlias && !validateAlias()) {
            return;
        }

        // Show loading state
        showLoadingState();

        try {
            // Simulate API call (replace with actual API endpoint)
            const response = await simulateApiCall(longUrl, customAlias);
            
            if (response.success) {
                showSuccess(response.shortUrl);
            } else {
                showError(response.error);
            }
        } catch (error) {
            showError('An error occurred while shortening the URL. Please try again.');
        }
    }

    function validateUrl() {
        const url = longUrlInput.value.trim();
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        
        longUrlInput.classList.remove('is-invalid', 'is-valid');
        
        if (!url) {
            return false;
        }

        if (!urlPattern.test(url) && !url.startsWith('http://') && !url.startsWith('https://')) {
            longUrlInput.classList.add('is-invalid');
            document.getElementById('urlError').textContent = 'Please enter a valid URL';
            return false;
        }

        // Check for blacklisted domains (example)
        const blacklistedDomains = ['malicious.com', 'spam.net', 'phishing.org'];
        const domain = extractDomain(url);
        
        if (blacklistedDomains.includes(domain)) {
            longUrlInput.classList.add('is-invalid');
            document.getElementById('urlError').textContent = 'This domain is not allowed';
            return false;
        }

        longUrlInput.classList.add('is-valid');
        return true;
    }

    function validateAlias() {
        const alias = customAliasInput.value.trim();
        const aliasPattern = /^[a-zA-Z0-9-_]+$/;
        
        customAliasInput.classList.remove('is-invalid', 'is-valid');
        
        if (!alias) {
            return true; // Optional field
        }

        if (alias.length < 3) {
            customAliasInput.classList.add('is-invalid');
            return false;
        }

        if (!aliasPattern.test(alias)) {
            customAliasInput.classList.add('is-invalid');
            return false;
        }

        customAliasInput.classList.add('is-valid');
        return true;
    }

    function extractDomain(url) {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return '';
        }
    }

    function showLoadingState() {
        shortenBtn.disabled = true;
        shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Shortening...';
        shortenBtn.classList.add('loading');
    }

    function hideLoadingState() {
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = '<i class="fas fa-scissors me-2"></i>Shorten URL';
        shortenBtn.classList.remove('loading');
    }

    function showSuccess(shortUrl) {
        hideLoadingState();
        hideResultsAndErrors();
        
        shortUrlInput.value = shortUrl;
        resultSection.classList.remove('d-none');
        resultSection.classList.add('fade-in-up');
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showError(message) {
        hideLoadingState();
        hideResultsAndErrors();
        
        errorMessage.textContent = message;
        errorSection.classList.remove('d-none');
        errorSection.classList.add('fade-in-up');
    }

    function hideResultsAndErrors() {
        resultSection.classList.add('d-none');
        errorSection.classList.add('d-none');
        resultSection.classList.remove('fade-in-up');
        errorSection.classList.remove('fade-in-up');
    }

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(shortUrlInput.value);
            
            // Show success feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copy-success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.classList.remove('copy-success');
            }, 2000);
            
        } catch (err) {
            // Fallback for older browsers
            shortUrlInput.select();
            document.execCommand('copy');
            
            // Show feedback
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }
    }

    // Simulate API call (replace with actual backend integration)
    async function simulateApiCall(longUrl, customAlias) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate different responses
        const random = Math.random();
        
        if (random < 0.1) {
            // 10% chance of error
            return {
                success: false,
                error: 'Custom alias already exists. Please choose a different one.'
            };
        }
        
        // Generate short URL
        const alias = customAlias || generateRandomAlias();
        const shortUrl = `https://short.ly/${alias}`;
        
        return {
            success: true,
            shortUrl: shortUrl
        };
    }

    function generateRandomAlias() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation classes on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
});

// Global function for copying text (used in other pages)
window.copyToClipboard = async function(text) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Show toast notification
        showToast('Copied to clipboard!', 'success');
        
    } catch (err) {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showToast('Copied to clipboard!', 'success');
    }
};

// Toast notification function
window.showToast = function(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to toast container or create one
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
};