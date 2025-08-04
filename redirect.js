// Redirect page JavaScript for URL Trimmer

document.addEventListener('DOMContentLoaded', function() {
    // Page sections
    const loadingSection = document.getElementById('loadingSection');
    const passwordSection = document.getElementById('passwordSection');
    const errorSection = document.getElementById('errorSection');
    const successSection = document.getElementById('successSection');
    const linkInfoSection = document.getElementById('linkInfoSection');
    
    // Form elements
    const passwordForm = document.getElementById('passwordForm');
    const linkPasswordInput = document.getElementById('linkPassword');
    const toggleLinkPassword = document.getElementById('toggleLinkPassword');
    const linkPasswordIcon = document.getElementById('linkPasswordIcon');
    const submitPasswordBtn = document.getElementById('submitPassword');
    
    // Error elements
    const passwordErrorSection = document.getElementById('passwordErrorSection');
    const passwordErrorMessage = document.getElementById('passwordErrorMessage');
    
    // Progress elements
    const progressBar = document.getElementById('progressBar');
    const manualRedirectLink = document.getElementById('manualRedirectLink');
    
    // Get the short code from URL
    const shortCode = getShortCodeFromUrl();
    
    // Initialize redirect process
    initializeRedirect();

    function initializeRedirect() {
        // Password toggle functionality
        if (toggleLinkPassword && linkPasswordInput) {
            toggleLinkPassword.addEventListener('click', togglePasswordVisibility);
        }

        // Password form submission
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordSubmission);
        }

        // Start redirect process
        if (shortCode) {
            processRedirect(shortCode);
        } else {
            showError('Invalid or missing link code');
        }
    }

    function getShortCodeFromUrl() {
        // Extract short code from URL path
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1] || null;
    }

    async function processRedirect(code) {
        try {
            // Show loading state with progress animation
            showLoadingWithProgress();
            
            // Simulate API call to get link information
            const linkData = await getLinkData(code);
            
            if (!linkData.exists) {
                showError('Link not found or expired');
                return;
            }

            // Update link info if available
            if (linkData.platform || linkData.clicks || linkData.created) {
                updateLinkInfo(linkData);
            }

            // Check if password protected
            if (linkData.passwordProtected) {
                showPasswordPrompt();
                return;
            }

            // Check if expired
            if (linkData.expired) {
                showError('This link has expired');
                return;
            }

            // Proceed with redirect
            await performRedirect(linkData.originalUrl);
            
        } catch (error) {
            console.error('Redirect error:', error);
            showError('An error occurred while processing the link');
        }
    }

    function showLoadingWithProgress() {
        hideAllSections();
        loadingSection.classList.remove('d-none');
        
        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
    }

    function showPasswordPrompt() {
        hideAllSections();
        passwordSection.classList.remove('d-none');
        
        // Focus on password input
        setTimeout(() => {
            linkPasswordInput.focus();
        }, 100);
    }

    function showError(message) {
        hideAllSections();
        errorSection.classList.remove('d-none');
        
        // Update error message if needed
        const errorText = errorSection.querySelector('p');
        if (errorText && message !== 'Link not found or expired') {
            errorText.textContent = message;
        }
    }

    function showSuccess(redirectUrl) {
        hideAllSections();
        successSection.classList.remove('d-none');
        
        // Set manual redirect link
        if (manualRedirectLink) {
            manualRedirectLink.href = redirectUrl;
        }
    }

    function hideAllSections() {
        [loadingSection, passwordSection, errorSection, successSection].forEach(section => {
            if (section) section.classList.add('d-none');
        });
        
        // Hide password error
        if (passwordErrorSection) {
            passwordErrorSection.classList.add('d-none');
        }
    }

    function updateLinkInfo(linkData) {
        if (!linkInfoSection) return;
        
        // Update platform icon and text
        const platformIcon = linkInfoSection.querySelector('i');
        const platformText = linkInfoSection.querySelector('span');
        const clickCount = document.getElementById('clickCount');
        
        if (linkData.platform && platformIcon && platformText) {
            const platformMap = {
                'twitter': { icon: 'fab fa-twitter text-primary', text: 'Twitter' },
                'facebook': { icon: 'fab fa-facebook text-primary', text: 'Facebook' },
                'instagram': { icon: 'fab fa-instagram text-primary', text: 'Instagram' },
                'linkedin': { icon: 'fab fa-linkedin text-primary', text: 'LinkedIn' },
                'github': { icon: 'fab fa-github text-dark', text: 'GitHub' },
                'default': { icon: 'fas fa-link text-primary', text: 'Web' }
            };
            
            const platform = platformMap[linkData.platform] || platformMap.default;
            platformIcon.className = platform.icon + ' me-2';
            platformText.textContent = `Shared from ${platform.text}`;
        }
        
        if (clickCount && linkData.clicks !== undefined) {
            clickCount.textContent = linkData.clicks;
        }
        
        // Show link info
        linkInfoSection.classList.remove('d-none');
    }

    function togglePasswordVisibility() {
        const type = linkPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        linkPasswordInput.setAttribute('type', type);
        
        // Toggle icon
        if (type === 'text') {
            linkPasswordIcon.classList.remove('fa-eye');
            linkPasswordIcon.classList.add('fa-eye-slash');
        } else {
            linkPasswordIcon.classList.remove('fa-eye-slash');
            linkPasswordIcon.classList.add('fa-eye');
        }
    }

    async function handlePasswordSubmission(e) {
        e.preventDefault();
        
        const password = linkPasswordInput.value;
        
        if (!password) {
            showPasswordError('Please enter the password');
            return;
        }

        // Show loading state
        showLoadingState(submitPasswordBtn, 'Verifying...');
        hidePasswordError();

        try {
            // Simulate password verification
            const result = await verifyPassword(shortCode, password);
            
            if (result.success) {
                // Get link data and redirect
                const linkData = await getLinkData(shortCode, password);
                await performRedirect(linkData.originalUrl);
            } else {
                showPasswordError(result.error || 'Incorrect password. Please try again.');
            }
        } catch (error) {
            showPasswordError('An error occurred while verifying the password.');
        } finally {
            hideLoadingState(submitPasswordBtn, '<i class="fas fa-unlock me-2"></i>Access Link');
        }
    }

    function showPasswordError(message) {
        passwordErrorMessage.textContent = message;
        passwordErrorSection.classList.remove('d-none');
        linkPasswordInput.classList.add('is-invalid');
    }

    function hidePasswordError() {
        passwordErrorSection.classList.add('d-none');
        linkPasswordInput.classList.remove('is-invalid');
    }

    async function performRedirect(url) {
        // Ensure URL has protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Show success state
        showSuccess(url);
        
        // Complete progress bar
        progressBar.style.width = '100%';
        
        // Record click (simulate API call)
        recordClick(shortCode);
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = url;
        }, 2000);
    }

    function showLoadingState(button, text) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
    }

    function hideLoadingState(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    }

    // Simulate API calls (replace with actual backend integration)
    async function getLinkData(code, password = null) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate different link scenarios
        const linkDatabase = {
            'abc123': {
                exists: true,
                originalUrl: 'https://example.com/very-long-url-that-needs-shortening',
                passwordProtected: true,
                correctPassword: 'secret123',
                expired: false,
                platform: 'twitter',
                clicks: 142,
                created: '2 days ago'
            },
            'xyz789': {
                exists: true,
                originalUrl: 'https://github.com/user/repository',
                passwordProtected: false,
                expired: false,
                platform: 'github',
                clicks: 89,
                created: '1 week ago'
            },
            'expired': {
                exists: true,
                expired: true
            }
        };
        
        const linkData = linkDatabase[code];
        
        if (!linkData) {
            return { exists: false };
        }
        
        // If password protected and password provided, verify it
        if (linkData.passwordProtected && password) {
            if (password === linkData.correctPassword) {
                return { ...linkData, passwordProtected: false };
            } else {
                return { exists: false };
            }
        }
        
        return linkData;
    }

    async function verifyPassword(code, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get link data to check password
        const linkData = await getLinkData(code);
        
        if (linkData.exists && linkData.correctPassword === password) {
            return { success: true };
        }
        
        return { 
            success: false, 
            error: 'Incorrect password. Please try again.' 
        };
    }

    async function recordClick(code) {
        try {
            // Simulate API call to record click
            await fetch(`/api/links/${code}/click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer
                })
            });
        } catch (error) {
            console.error('Failed to record click:', error);
        }
    }

    // Handle browser back button
    window.addEventListener('popstate', function() {
        // If user goes back, redirect to homepage
        window.location.href = '/';
    });

    // Prevent right-click context menu on sensitive elements
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.card')) {
            e.preventDefault();
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC key to go back to homepage
        if (e.key === 'Escape') {
            window.location.href = '/';
        }
        
        // Enter key in password field
        if (e.key === 'Enter' && e.target === linkPasswordInput) {
            e.preventDefault();
            passwordForm.dispatchEvent(new Event('submit'));
        }
    });
});