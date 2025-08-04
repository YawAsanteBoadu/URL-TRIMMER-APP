// Dashboard JavaScript for URL Trimmer

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const createLinkForm = document.getElementById('createLinkForm');
    const createLinkBtn = document.getElementById('createLinkBtn');
    const searchLinks = document.getElementById('searchLinks');
    const refreshLinks = document.getElementById('refreshLinks');
    
    // Modal elements
    const createLinkModal = document.getElementById('createLinkModal');
    const analyticsModal = document.getElementById('analyticsModal');
    
    // Platform selection
    const platformButtons = document.querySelectorAll('.platform-btn');
    let selectedPlatform = 'default';

    // Initialize dashboard
    initializeDashboard();

    function initializeDashboard() {
        // Create link form
        if (createLinkForm) {
            createLinkForm.addEventListener('submit', handleCreateLink);
        }

        if (createLinkBtn) {
            createLinkBtn.addEventListener('click', handleCreateLink);
        }

        // Search functionality
        if (searchLinks) {
            searchLinks.addEventListener('input', handleSearch);
        }

        // Refresh links
        if (refreshLinks) {
            refreshLinks.addEventListener('click', refreshLinksList);
        }

        // Platform selection
        platformButtons.forEach(button => {
            button.addEventListener('click', function() {
                selectPlatform(this.dataset.platform);
                updatePlatformButtons(this);
            });
        });

        // Auto-detect platform from URL
        const longUrlInput = document.getElementById('longUrl');
        if (longUrlInput) {
            longUrlInput.addEventListener('input', autoDetectPlatform);
        }

        // Load initial data
        loadDashboardData();
    }

    async function handleCreateLink(e) {
        e.preventDefault();
        
        const formData = {
            longUrl: document.getElementById('longUrl').value.trim(),
            customAlias: document.getElementById('customAlias').value.trim(),
            expirationDate: document.getElementById('expirationDate').value,
            password: document.getElementById('password').value,
            platformReference: document.getElementById('platformReference').value.trim(),
            platform: selectedPlatform
        };

        // Validate form
        if (!validateCreateLinkForm(formData)) {
            return;
        }

        // Show loading state
        showLoadingState(createLinkBtn, 'Creating...');

        try {
            // Simulate API call
            const response = await simulateCreateLink(formData);
            
            if (response.success) {
                // Hide modal
                const modal = bootstrap.Modal.getInstance(createLinkModal);
                modal.hide();
                
                // Show success message
                showToast('Link created successfully!', 'success');
                
                // Reset form
                createLinkForm.reset();
                resetPlatformSelection();
                
                // Refresh links list
                await refreshLinksList();
                
            } else {
                showToast(response.error, 'danger');
            }
        } catch (error) {
            showToast('An error occurred while creating the link.', 'danger');
        } finally {
            hideLoadingState(createLinkBtn, '<i class="fas fa-plus me-2"></i>Create Link');
        }
    }

    function validateCreateLinkForm(data) {
        let isValid = true;
        
        // Validate URL
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        const urlInput = document.getElementById('longUrl');
        const urlError = document.getElementById('urlError');
        
        if (!data.longUrl) {
            showFieldError(urlInput, urlError, 'URL is required');
            isValid = false;
        } else if (!urlPattern.test(data.longUrl)) {
            showFieldError(urlInput, urlError, 'Please enter a valid URL');
            isValid = false;
        } else {
            clearFieldError(urlInput);
        }

        // Validate custom alias if provided
        if (data.customAlias) {
            const aliasPattern = /^[a-zA-Z0-9-_]+$/;
            const aliasInput = document.getElementById('customAlias');
            
            if (data.customAlias.length < 3) {
                showFieldError(aliasInput, null, 'Alias must be at least 3 characters');
                isValid = false;
            } else if (!aliasPattern.test(data.customAlias)) {
                showFieldError(aliasInput, null, 'Alias can only contain letters, numbers, dashes, and underscores');
                isValid = false;
            } else {
                clearFieldError(aliasInput);
            }
        }

        return isValid;
    }

    function showFieldError(input, errorElement, message) {
        input.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearFieldError(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }

    function selectPlatform(platform) {
        selectedPlatform = platform;
    }

    function updatePlatformButtons(selectedButton) {
        platformButtons.forEach(btn => btn.classList.remove('active'));
        selectedButton.classList.add('active');
    }

    function resetPlatformSelection() {
        selectedPlatform = 'default';
        platformButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.platform === 'default') {
                btn.classList.add('active');
            }
        });
    }

    function autoDetectPlatform() {
        const url = this.value.toLowerCase();
        let detectedPlatform = 'default';
        
        if (url.includes('twitter.com') || url.includes('t.co')) {
            detectedPlatform = 'twitter';
        } else if (url.includes('facebook.com') || url.includes('fb.com')) {
            detectedPlatform = 'facebook';
        } else if (url.includes('instagram.com')) {
            detectedPlatform = 'instagram';
        } else if (url.includes('linkedin.com')) {
            detectedPlatform = 'linkedin';
        } else if (url.includes('github.com')) {
            detectedPlatform = 'github';
        }
        
        // Update platform selection
        const platformButton = document.querySelector(`[data-platform="${detectedPlatform}"]`);
        if (platformButton) {
            selectPlatform(detectedPlatform);
            updatePlatformButtons(platformButton);
        }
    }

    function handleSearch() {
        const searchTerm = this.value.toLowerCase();
        const tableRows = document.querySelectorAll('#linksTable tbody tr');
        
        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    async function refreshLinksList() {
        const refreshIcon = refreshLinks.querySelector('i');
        refreshIcon.classList.add('fa-spin');
        
        try {
            // Simulate API call to refresh data
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update the table with new data
            await loadLinksData();
            
            showToast('Links refreshed successfully!', 'success');
        } catch (error) {
            showToast('Failed to refresh links.', 'danger');
        } finally {
            refreshIcon.classList.remove('fa-spin');
        }
    }

    async function loadDashboardData() {
        try {
            // Load stats
            await loadStatsData();
            
            // Load links
            await loadLinksData();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async function loadStatsData() {
        // Simulate loading stats from API
        const stats = {
            totalLinks: 24,
            totalClicks: 1247,
            avgClicks: 52,
            thisWeek: 7
        };
        
        // Update stats cards with animation
        animateNumber(document.querySelector('.stats-card:nth-child(1) .stats-number'), stats.totalLinks);
        animateNumber(document.querySelector('.stats-card:nth-child(2) .stats-number'), stats.totalClicks);
        animateNumber(document.querySelector('.stats-card:nth-child(3) .stats-number'), stats.avgClicks);
        animateNumber(document.querySelector('.stats-card:nth-child(4) .stats-number'), stats.thisWeek);
    }

    async function loadLinksData() {
        // This would typically fetch from an API
        // For now, the sample data is already in the HTML
        console.log('Links data loaded');
    }

    function animateNumber(element, targetNumber) {
        if (!element) return;
        
        const startNumber = 0;
        const duration = 2000;
        const startTime = Date.now();
        
        function updateNumber() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
            element.textContent = currentNumber.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        updateNumber();
    }

    function showLoadingState(button, text) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
    }

    function hideLoadingState(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    }

    // Simulate API call for creating link
    async function simulateCreateLink(data) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate different responses
        const random = Math.random();
        
        if (random < 0.1 && data.customAlias) {
            return {
                success: false,
                error: 'Custom alias already exists. Please choose a different one.'
            };
        }
        
        return {
            success: true,
            shortUrl: `https://short.ly/${data.customAlias || generateRandomAlias()}`,
            clicks: 0,
            created: new Date().toISOString()
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
});

// Global functions for table actions
window.showAnalytics = function(linkId) {
    // Load analytics data for the specific link
    loadAnalyticsData(linkId);
    
    // Show analytics modal
    const analyticsModal = new bootstrap.Modal(document.getElementById('analyticsModal'));
    analyticsModal.show();
};

window.editLink = function(linkId) {
    // This would typically load the link data and populate the edit form
    showToast('Edit functionality will be implemented with backend integration', 'info');
};

window.deleteLink = function(linkId) {
    if (confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
        // Simulate deletion
        showToast('Link deleted successfully!', 'success');
        
        // Remove row from table (in real app, this would refresh from API)
        const row = event.target.closest('tr');
        if (row) {
            row.remove();
        }
    }
};

async function loadAnalyticsData(linkId) {
    // Simulate loading analytics data
    const analyticsData = {
        totalClicks: 142,
        todayClicks: 7,
        remainingDays: 2,
        recentActivity: [
            {
                location: 'United States',
                device: 'Chrome on Windows',
                time: '2 hours ago'
            },
            {
                location: 'Canada',
                device: 'Safari on iPhone',
                time: '5 hours ago'
            }
        ]
    };
    
    // Update modal content
    // This would be implemented based on the actual analytics modal structure
    console.log('Analytics data loaded for link:', linkId, analyticsData);
}

// Toast notification function (if not already defined)
if (typeof window.showToast === 'undefined') {
    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'danger' ? 'exclamation-triangle' : 'info'}-circle me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    };
}