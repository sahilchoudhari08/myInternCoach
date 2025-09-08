// DOM Elements - will be initialized when DOM is loaded
let internshipsList, emptyState, exportCsvBtn, settingsButton, settingsModal, closeSettings, exportData, clearData;
let dashboardTab, applicationsTab, analyticsTab, dashboardContent, applicationsContent, analyticsContent;

// Dashboard form elements
const dashboardInternshipForm = document.getElementById('dashboardInternshipForm');
const dashboardCompany = document.getElementById('dashboardCompany');
const dashboardRole = document.getElementById('dashboardRole');
const dashboardPlatform = document.getElementById('dashboardPlatform');
const dashboardLocation = document.getElementById('dashboardLocation');
const dashboardStatus = document.getElementById('dashboardStatus');
const dashboardDeadline = document.getElementById('dashboardDeadline');
const dashboardNotes = document.getElementById('dashboardNotes');

// API endpoints
const API_URL = '/api/internships';

// Analytics functions
let timelineChart = null;
let platformSuccessChart = null;
let lastUpdate = 0;
const UPDATE_THROTTLE = 1000; // Only update charts every second

// Dark/Light mode toggle logic
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeIconPath = document.getElementById('themeIconPath');

// These event listeners are now handled in initializeEventListeners()

// Tab functionality
function switchTab(tabName) {
    // Remove active class from all tabs and content
    [dashboardTab, applicationsTab, analyticsTab].forEach(tab => {
        tab.classList.remove('active');
    });
    [dashboardContent, applicationsContent, analyticsContent].forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });

    // Add active class to selected tab and show content
    switch(tabName) {
        case 'dashboard':
            dashboardTab.classList.add('active');
            dashboardContent.classList.add('active');
            dashboardContent.classList.remove('hidden');
            break;
        case 'applications':
            applicationsTab.classList.add('active');
            applicationsContent.classList.add('active');
            applicationsContent.classList.remove('hidden');
            break;
        case 'analytics':
            analyticsTab.classList.add('active');
            analyticsContent.classList.add('active');
            analyticsContent.classList.remove('hidden');
            break;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    internshipsList = document.getElementById('internshipsList');
    emptyState = document.getElementById('emptyState');
    exportCsvBtn = document.getElementById('exportCsv');
    settingsButton = document.getElementById('settingsButton');
    settingsModal = document.getElementById('settingsModal');
    closeSettings = document.getElementById('closeSettings');
    exportData = document.getElementById('exportData');
    clearData = document.getElementById('clearData');
    
    // Initialize tab elements
    dashboardTab = document.getElementById('dashboardTab');
    applicationsTab = document.getElementById('applicationsTab');
    analyticsTab = document.getElementById('analyticsTab');
    dashboardContent = document.getElementById('dashboardContent');
    applicationsContent = document.getElementById('applicationsContent');
    analyticsContent = document.getElementById('analyticsContent');
    
    // Check if elements exist
    if (!dashboardTab || !applicationsTab || !analyticsTab || !dashboardContent || !applicationsContent || !analyticsContent) {
        console.error('One or more tab elements not found');
        return;
    }
    
    // Set up tab event listeners
    dashboardTab.addEventListener('click', () => {
        switchTab('dashboard');
    });
    
    applicationsTab.addEventListener('click', () => {
        switchTab('applications');
    });
    
    analyticsTab.addEventListener('click', () => {
        switchTab('analytics');
    });
    
    // Initialize other event listeners
    initializeEventListeners();
    
    // Load initial data
    fetchInternships();
    checkDataBackup();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Dashboard form submission
    const dashboardForm = document.getElementById('dashboardInternshipForm');
    if (dashboardForm) {
        dashboardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                company: document.getElementById('dashboardCompany').value,
                role: document.getElementById('dashboardRole').value,
                platform: document.getElementById('dashboardPlatform').value,
                location: document.getElementById('dashboardLocation').value,
                status: document.getElementById('dashboardStatus').value,
                deadline: document.getElementById('dashboardDeadline').value,
                notes: document.getElementById('dashboardNotes').value
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Clear form
                    dashboardForm.reset();
                    
                    // Refresh data
                    fetchInternships();
                    
                    // Show success message
                    showNotification('Application added successfully!', 'success');
                } else {
                    throw new Error('Failed to add application');
                }
            } catch (error) {
                console.error('Error adding application:', error);
                showNotification('Failed to add application', 'error');
            }
        });
    }
    
    // Other event listeners...
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            settingsModal.classList.add('flex');
        });
    }
    
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            settingsModal.classList.remove('flex');
        });
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    // Close modal when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
                settingsModal.classList.remove('flex');
            }
        });
    }
    
    // Export all data handler
    if (exportData) {
        exportData.addEventListener('click', () => {
            exportToCSV();
        });
    }
    
    // Export JSON handler
    const exportJSON = document.getElementById('exportJSON');
    if (exportJSON) {
        exportJSON.addEventListener('click', () => {
            exportToJSON();
        });
    }
    
    // Import JSON handler
    const importJSON = document.getElementById('importJSON');
    if (importJSON) {
        importJSON.addEventListener('click', () => {
            importFromJSON();
        });
    }
    
    // Clear all data handler
    if (clearData) {
        clearData.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                try {
                    const response = await fetch(API_URL, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        fetchInternships();

                        // 🔥 FIX: manually clear UI in case it's not reactive yet
                        if (internshipsList) {
                            internshipsList.innerHTML = '';
                        }
                        if (emptyState) {
                            emptyState.classList.remove('hidden');
                        }
                    } else {
                        console.error('Failed to clear data:', await response.text());
                    }
                } catch (error) {
                    console.error('Error clearing data:', error);
                }
            }
        });
    }
    
    // Add event listener for applications form
    const applicationsForm = document.getElementById('applicationsForm');
    if (applicationsForm) {
        applicationsForm.addEventListener('submit', addInternship);
    }
    
    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterInternships(searchTerm);
        });
    }
    
    // Goal settings functionality
    // Open settings when clicking Edit goal
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('#openGoalSettings') : null;
        if (!btn) return;
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
        const weeklyGoalInput = document.getElementById('weeklyGoalInput');
        if (weeklyGoalInput) {
            weeklyGoalInput.value = localStorage.getItem('weeklyGoal') || '5';
        }
    });

    // Save weekly goal
    const saveWeeklyGoal = document.getElementById('saveWeeklyGoal');
    const weeklyGoalInput = document.getElementById('weeklyGoalInput');
    if (saveWeeklyGoal && weeklyGoalInput) {
        saveWeeklyGoal.addEventListener('click', () => {
            const val = Math.max(1, parseInt(weeklyGoalInput.value || '5', 10));
            localStorage.setItem('weeklyGoal', String(val));
            showNotification('Weekly goal saved', 'success');
            settingsModal.classList.add('hidden');
            settingsModal.classList.remove('flex');
            // Refresh data to reflect new goal
            fetchInternships();
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    notification.className += ` ${bgColor} text-white`;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function setTheme(mode) {
    if (mode === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        themeIconPath.setAttribute('d', 'M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M12 7a5 5 0 000 10a5 5 0 000-10z'); // Sun
        themeToggle.setAttribute('aria-checked', 'false');
        themeToggle.classList.remove('bg-indigo-600');
        themeToggle.classList.add('bg-slate-700');
        themeIcon.classList.remove('translate-x-5');
        themeIcon.classList.add('translate-x-0');
    } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        themeIconPath.setAttribute('d', 'M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z'); // Moon
        themeToggle.setAttribute('aria-checked', 'true');
        themeToggle.classList.remove('bg-slate-700');
        themeToggle.classList.add('bg-indigo-600');
        themeIcon.classList.remove('translate-x-0');
        themeIcon.classList.add('translate-x-5');
    }
    localStorage.setItem('theme', mode);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

// On load, set theme from localStorage or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

function updateAnalytics(internships) {
    const now = Date.now();
    if (now - lastUpdate < UPDATE_THROTTLE) {
        return; // Skip update if too soon
    }
    lastUpdate = now;

    // Update stats immediately
    updateStats(internships);
    updateDashboardStats(internships);
    
    // Debounce chart updates
    requestAnimationFrame(() => {
        updateCharts(internships);
    });
}
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    d.setHours(0,0,0,0);
    return new Date(d.setDate(diff));
}

function updateDashboardStats(internships) {
    const total = internships.length;
    const interviews = internships.filter(i => i.status === 'Interview').length;
    const offers = internships.filter(i => i.status === 'Offer').length;

    const weekStart = getWeekStart();
    const thisWeek = internships.filter(i => new Date(i.createdAt || i.deadline) >= weekStart).length;

    const dashTotal = document.getElementById('dashTotal');
    const dashThisWeek = document.getElementById('dashThisWeek');
    const weeklyGoalProgress = document.getElementById('weeklyGoalProgress');
    const weeklyGoalText = document.getElementById('weeklyGoalText');

    if (dashTotal) dashTotal.textContent = total;
    if (dashThisWeek) dashThisWeek.textContent = thisWeek;
    // Cards removed: Interviews and Offers

    const goal = parseInt(localStorage.getItem('weeklyGoal') || '5', 10);
    const pct = goal > 0 ? Math.min(100, Math.round((thisWeek / goal) * 100)) : 0;
    if (weeklyGoalProgress) weeklyGoalProgress.style.width = `${pct}%`;
    if (weeklyGoalText) weeklyGoalText.textContent = `${thisWeek} / ${goal} applications this week`;
}


function updateStats(internships) {
    const total = internships.length;
    const applied = internships.filter(i => i.status === 'Applied').length;
    const interviews = internships.filter(i => i.status === 'Interview').length;
    const offers = internships.filter(i => i.status === 'Offer').length;
    
    // Calculate rates
    const interviewRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : 0;
    const offerRate = total > 0 ? ((offers / total) * 100).toFixed(1) : 0;
    
    // Calculate average response time (time between application and status change)
    const responseTimes = internships
        .filter(i => i.status !== 'Applied')
        .map(i => {
            const appliedDate = new Date(i.deadline);
            const statusChangeDate = new Date();
            return Math.floor((statusChangeDate - appliedDate) / (1000 * 60 * 60 * 24));
        });
    
    const avgResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) 
        : 0;

    // Update DOM
    document.getElementById('totalApplications').textContent = total;
    document.getElementById('interviewRate').textContent = `${interviewRate}%`;
    document.getElementById('offerRate').textContent = `${offerRate}%`;
    document.getElementById('avgResponseTime').textContent = `${avgResponseTime} days`;
    
    // Update progress bars
    if (total > 0) {
        document.getElementById('appliedCount').textContent = applied;
        document.getElementById('interviewCount').textContent = interviews;
        document.getElementById('offerCount').textContent = offers;
        
        document.getElementById('appliedProgress').style.width = `${(applied / total) * 100}%`;
        document.getElementById('interviewProgress').style.width = `${(interviews / total) * 100}%`;
        document.getElementById('offerProgress').style.width = `${(offers / total) * 100}%`;
    }
    
    // Update additional statistics
    updateAdditionalStats(internships);
}

// Update additional statistics and insights
function updateAdditionalStats(internships) {
    if (internships.length === 0) return;
    
    // Calculate additional metrics
    const totalDays = internships.reduce((sum, i) => {
        const daysSince = Math.floor((Date.now() - new Date(i.deadline).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysSince;
    }, 0);
    
    const avgDaysSince = Math.round(totalDays / internships.length);
    const oldestApplication = Math.max(...internships.map(i => new Date(i.deadline).getTime()));
    const newestApplication = Math.min(...internships.map(i => new Date(i.deadline).getTime()));
    
    // Additional stats section removed as requested
}

function updateCharts(internships) {
    if (!document.getElementById('statusChart') && !document.getElementById('timelineChart') && !document.getElementById('platformList')) {
        return; // Don't update if charts aren't in view
    }

    if (document.getElementById('statusChart')) {
        updateStatusChart(internships);
    }
    if (document.getElementById('timelineChart')) {
        updateTimelineChart(internships);
    }
    if (document.getElementById('platformList')) {
        updatePlatformList(internships);
    }
    updatePlatformSuccessList(internships);
}

// Helper to get theme-based chart colors
function getChartColors() {
    const isLight = document.body.classList.contains('light');
    return {
        axis: isLight ? '#1e293b' : '#e2e8f0',
        grid: isLight ? 'rgba(30,41,59,0.08)' : 'rgba(255,255,255,0.1)',
        legend: isLight ? '#1e293b' : '#e2e8f0',
        tooltipBg: isLight ? '#1e293b' : 'rgba(30,41,59,0.9)',
        tooltipTitle: isLight ? '#f8fafc' : '#e2e8f0',
        tooltipBody: isLight ? '#f8fafc' : '#e2e8f0',
        tooltipBorder: isLight ? 'rgba(30,41,59,0.15)' : 'rgba(255,255,255,0.1)'
    };
}

function updateStatusChart(internships) {
    const statusCounts = {
        Applied: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0
    };
    internships.forEach(i => statusCounts[i.status]++);
    const ctx = document.getElementById('statusChart').getContext('2d');
    const chartColors = getChartColors();
    const localChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: 'rgba(30, 41, 59, 0.8)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: { duration: 500 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: chartColors.legend,
                        font: { family: 'Inter' },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    titleColor: chartColors.tooltipTitle,
                    bodyColor: chartColors.tooltipBody,
                    borderColor: chartColors.tooltipBorder,
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

function updateTimelineChart(internships) {
    const dateCounts = {};
    internships.forEach(i => {
        const date = new Date(i.deadline);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    const monthCounts = {};
    internships.forEach(i => {
        const date = new Date(i.deadline);
        const monthStr = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthCounts[monthStr] = (monthCounts[monthStr] || 0) + 1;
    });
    const ctx = document.getElementById('timelineChart').getContext('2d');
    if (timelineChart) timelineChart.destroy();
    const chartColors = getChartColors();
    timelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dateCounts),
            datasets: [{
                label: 'Applications per Day',
                data: Object.values(dateCounts),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 24,
                maxBarThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: { duration: 500 },
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    titleColor: chartColors.tooltipTitle,
                    bodyColor: chartColors.tooltipBody,
                    borderColor: chartColors.tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: function(context) { return `Date: ${context[0].label}`; },
                        label: function(context) { return `Applications: ${context.parsed.y}`; }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: chartColors.grid },
                    ticks: { color: chartColors.axis, precision: 0 },
                    title: { display: true, text: 'Applications per Day', color: chartColors.axis }
                },
                x: {
                    grid: { color: chartColors.grid },
                    ticks: { color: chartColors.axis, maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });

    // Add monthly summary directly beneath the timeline chart
    let summaryDiv = document.getElementById('monthlySummary');
    if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.id = 'monthlySummary';
        summaryDiv.className = 'mt-6 text-lg text-slate-200';
        const timelineChartCanvas = document.getElementById('timelineChart');
        timelineChartCanvas.parentNode.insertBefore(summaryDiv, timelineChartCanvas.nextSibling);
    }
    summaryDiv.style.padding = '1rem 1.5rem';
    summaryDiv.style.margin = '0.5rem 0 0.5rem 0';
    summaryDiv.style.borderRadius = '0.75rem';
    summaryDiv.innerHTML = '<strong>Applications per Month:</strong><br>' +
        Object.entries(monthCounts)
            .map(([month, count]) => `${month}: <span class="font-bold">${count}</span> application${count === 1 ? '' : 's'}`)
            .join('<br>');
}

function updatePlatformList(internships) {
    const allPlatforms = ['LinkedIn', 'Handshake', 'Indeed', 'Company Site', 'Email', 'Other'];
    const platformCounts = {};
    internships.forEach(i => {
        const platform = i.platform || 'Other';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });
    
    const listDiv = document.getElementById('platformList');
    listDiv.innerHTML = '';
    
    allPlatforms.forEach(platform => {
        const count = platformCounts[platform] || 0;
        const color = {
            'LinkedIn': 'text-indigo-400',
            'Handshake': 'text-amber-400',
            'Indeed': 'text-emerald-400',
            'Company Site': 'text-blue-400',
            'Email': 'text-purple-400',
            'Other': 'text-red-400'
        }[platform] || 'text-slate-300';
        
        listDiv.innerHTML += `<div class="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700/50">
            <span class="font-medium ${color}">${platform}</span>
            <span class="font-semibold text-slate-200">${count} application${count === 1 ? '' : 's'}</span>
        </div>`;
    });
}

function updatePlatformSuccessList(internships) {
    const allPlatforms = ['LinkedIn', 'Handshake', 'Indeed', 'Company Site', 'Email', 'Other'];
    const platformCounts = {};
    const offerCounts = {};
    internships.forEach(i => {
        const platform = i.platform || 'Other';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        if (i.status === 'Offer') {
            offerCounts[platform] = (offerCounts[platform] || 0) + 1;
        }
    });
    const listDiv = document.getElementById('platformSuccessList');
    listDiv.innerHTML = '';
    allPlatforms.forEach(platform => {
        const rate = platformCounts[platform] ? ((offerCounts[platform] || 0) / platformCounts[platform] * 100).toFixed(1) : 0;
        const color = {
            'LinkedIn': 'text-indigo-400',
            'Handshake': 'text-amber-400',
            'Indeed': 'text-emerald-400',
            'Company Site': 'text-blue-400',
            'Email': 'text-purple-400',
            'Other': 'text-red-400'
        }[platform] || 'text-slate-300';
        listDiv.innerHTML += `<div class="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700/50">
            <span class="font-medium ${color}">${platform}</span>
            <span class="font-semibold text-slate-200">${rate}%</span>
        </div>`;
    });
}

// Helper function to get consistent colors for statuses
// Removed unused status color helper

// Fetch all internships
async function fetchInternships() {
    try {
        // Show loading state
        const internshipsList = document.getElementById('internshipsList');
        if (internshipsList) {
            internshipsList.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div><p class="mt-2 text-slate-400">Loading applications...</p></div>';
        }
        
        const response = await fetch(API_URL);
        const internships = await response.json();
        
        // Update UI first
        displayInternships(internships);
        
        // Then update analytics with a slight delay
        setTimeout(() => {
            updateAnalytics(internships);
        }, 100);
    } catch (error) {
        console.error('Error fetching internships:', error);
        showNotification('Failed to load applications', 'error');
    }
}

// Display internships in the UI
function displayInternships(internships) {
    if (internships.length === 0) {
        emptyState.classList.remove('hidden');
        internshipsList.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');
    internshipsList.innerHTML = '';

    // Sort internships by deadline
    internships.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // Create main cards section as a responsive grid that fills each row with fixed-size cards
    const cardsSection = document.createElement('div');
    cardsSection.className = 'grid gap-6';
    cardsSection.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    internships.forEach(internship => {
        const card = createInternshipCard(internship);
        // Remove any width/max-width classes from the card
        card.classList.remove('w-full', 'max-w-md', 'mx-auto');
        cardsSection.appendChild(card);
    });
    internshipsList.appendChild(cardsSection);

    // Removed "Applications by Status" categories per request

    // Update recent applications in dashboard
    updateRecentApplications(internships);
}

// Update recent applications in dashboard
function updateRecentApplications(internships) {
    const recentApplicationsContainer = document.getElementById('recentApplications');
    if (!recentApplicationsContainer) return;

    // Sort applications by most recent first
    const sorted = [...internships]
        .sort((a, b) => new Date(b.createdAt || b.deadline) - new Date(a.createdAt || a.deadline));

    if (sorted.length === 0) {
        recentApplicationsContainer.innerHTML = '<p class="text-slate-400 text-sm">No applications yet</p>';
        return;
    }

    const topTwo = sorted.slice(0, 2);
    const rest = sorted.slice(2);

    const renderItem = (internship) => `
        <div class="recent-application-item">
            <div class="flex justify-between items-start mb-2">
                <div class="font-medium text-slate-200">${internship.company}</div>
                <span class="status-badge status-${internship.status.toLowerCase()} text-xs">
                    ${internship.status}
                </span>
            </div>
            <div class="text-sm text-slate-400">${internship.role}</div>
            <div class="text-xs text-slate-500 mt-1">
                Applied: ${new Date(internship.deadline).toLocaleDateString()}
            </div>
        </div>`;

    let html = topTwo.map(renderItem).join('');
    if (rest.length > 0) {
        html += `
            <button id="recentToggle" class="text-xs text-indigo-400 hover:text-indigo-300 mt-2">Show more</button>
            <div id="recentRest" class="hidden mt-2">
                ${rest.map(renderItem).join('')}
            </div>
        `;
    }

    recentApplicationsContainer.innerHTML = html;

    const toggleBtn = document.getElementById('recentToggle');
    const restDiv = document.getElementById('recentRest');
    if (toggleBtn && restDiv) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = restDiv.classList.contains('hidden');
            if (isHidden) {
                restDiv.classList.remove('hidden');
                toggleBtn.textContent = 'Show less';
            } else {
                restDiv.classList.add('hidden');
                toggleBtn.textContent = 'Show more';
            }
        });
    }
}

// Create an internship card element
function createInternshipCard(internship) {
    const card = document.createElement('div');
    card.className = 'internship-card bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-700/50';
    
    const appliedDate = new Date(internship.deadline);
    const daysSinceApplied = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24));
    
    card.innerHTML = `
        <div class="flex flex-wrap justify-between items-start gap-y-2 mb-4">
            <div>
                <h3 class="text-xl font-semibold text-slate-200 mb-1 company-name">${internship.company}</h3>
                <p class="text-slate-400 role-title">${internship.role}</p>
                <p class="text-xs text-slate-500 mt-1">Platform: <span class="font-semibold">${internship.platform || 'N/A'}</span></p>
                <p class="text-xs text-slate-500 mt-1">Location: <span class="font-semibold location-text">${internship.location || 'N/A'}</span></p>
            </div>
            <span class="status-badge status-${internship.status.toLowerCase()}">${internship.status}</span>
        </div>
        <div class="space-y-3">
            <div class="flex items-center text-sm text-slate-400">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>
                    Applied ${daysSinceApplied} days ago
                </span>
            </div>
            ${internship.notes ? `
                <div class="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                    <p class="whitespace-pre-wrap">${internship.notes}</p>
                </div>
            ` : ''}
        </div>
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
            <select class="status-select text-sm rounded-lg border-slate-700" data-id="${internship.id}">
                <option value="Applied" ${internship.status === 'Applied' ? 'selected' : ''}>Applied</option>
                <option value="Interview" ${internship.status === 'Interview' ? 'selected' : ''}>Interview</option>
                <option value="Offer" ${internship.status === 'Offer' ? 'selected' : ''}>Offer</option>
                <option value="Rejected" ${internship.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
            <button class="delete-btn text-sm text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg" data-id="${internship.id}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;

    // Add event listeners
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteInternship(internship.id));

    const statusSelect = card.querySelector('.status-select');
    statusSelect.addEventListener('change', (e) => updateStatus(internship.id, e.target.value));

    // Add entrance animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50);

    return card;
}

// Validate internship data
function validateInternship(internship) {
    const errors = [];
    
    if (!internship.company || internship.company.trim().length < 2) {
        errors.push('Company name must be at least 2 characters long');
    }
    
    if (!internship.role || internship.role.trim().length < 2) {
        errors.push('Role title must be at least 2 characters long');
    }
    
    if (!internship.location || internship.location.trim().length < 2) {
        errors.push('Location must be at least 2 characters long');
    }
    
    if (!internship.deadline) {
        errors.push('Application date is required');
    } else if (new Date(internship.deadline) > new Date()) {
        errors.push('Application date cannot be in the future');
    }
    
    if (internship.notes && internship.notes.trim().length > 500) {
        errors.push('Notes cannot exceed 500 characters');
    }
    
    return errors;
}

// Add new internship
async function addInternship(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const internship = {
        company: formData.get('company').trim(),
        role: formData.get('role').trim(),
        platform: formData.get('platform'),
        location: formData.get('location').trim(),
        status: formData.get('status'),
        deadline: formData.get('deadline'),
        notes: formData.get('notes').trim()
    };

    // Validate data
    const validationErrors = validateInternship(internship);
    if (validationErrors.length > 0) {
        validationErrors.forEach(error => showNotification(error, 'error'));
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(internship)
        });

        if (response.ok) {
            event.target.reset();
            fetchInternships();
            showNotification('Application added successfully!', 'success');
        } else {
            showNotification('Failed to add application', 'error');
        }
    } catch (error) {
        console.error('Error adding internship:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Delete internship
async function deleteInternship(id) {
    if (!confirm('Are you sure you want to delete this internship?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchInternships();
        }
    } catch (error) {
        console.error('Error deleting internship:', error);
    }
}

// Update internship status
async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            fetchInternships();
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Export to CSV
function exportToCSV() {
    fetch(API_URL)
        .then(response => response.json())
        .then(internships => {
            const headers = ['Company', 'Role', 'Platform', 'Location', 'Status', 'Deadline', 'Notes', 'Created At'];
            const csvContent = [
                headers.join(','),
                ...internships.map(i => [
                    i.company,
                    i.role,
                    i.platform,
                    i.location,
                    i.status,
                    i.deadline,
                    i.notes,
                    i.createdAt || new Date().toISOString()
                ].map(field => `"${field || ''}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `internships_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            localStorage.setItem('lastBackup', new Date().toISOString());
            showNotification('Data exported successfully!', 'success');
        })
        .catch(error => {
            console.error('Error exporting to CSV:', error);
            showNotification('Failed to export data', 'error');
        });
}

// Export to JSON
function exportToJSON() {
    fetch(API_URL)
        .then(response => response.json())
        .then(internships => {
            const dataStr = JSON.stringify(internships, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `internships_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            localStorage.setItem('lastBackup', new Date().toISOString());
            showNotification('Data exported successfully!', 'success');
        })
        .catch(error => {
            console.error('Error exporting to JSON:', error);
            showNotification('Failed to export data', 'error');
        });
}

// Import data from JSON
function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (Array.isArray(data)) {
                        // Clear existing data first
                        await fetch(API_URL, { method: 'DELETE' });
                        
                        // Import new data
                        for (const internship of data) {
                            await fetch(API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(internship)
                            });
                        }
                        
                        fetchInternships();
                        showNotification('Data imported successfully!', 'success');
                    } else {
                        showNotification('Invalid file format', 'error');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    showNotification('Failed to import data', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Event Listeners are now handled in initializeEventListeners()

// Search functionality is now handled in initializeEventListeners()

// Re-render charts on theme change
function rerenderChartsOnThemeChange() {
    fetchInternships(); // This will call updateCharts with the new theme
}

// Filter internships based on search term (primarily by company name)
function filterInternships(searchTerm) {
    const cards = document.querySelectorAll('.internship-card');
    cards.forEach(card => {
        const company = card.querySelector('.company-name')?.textContent.toLowerCase() || '';
        const role = card.querySelector('.role-title')?.textContent.toLowerCase() || '';
        const location = card.querySelector('.location-text')?.textContent.toLowerCase() || '';
        
        // Primary search: company name (most important)
        // Secondary search: role and location as fallback
        if (company.includes(searchTerm) || role.includes(searchTerm) || location.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Ctrl/Cmd + N to add new application
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        switchTab('dashboard');
    }
    
    // Ctrl/Cmd + S to open settings
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        if (!settingsModal.classList.contains('hidden')) {
            settingsModal.classList.add('hidden');
            settingsModal.classList.remove('flex');
        }
    }
});

// Check if user has data and show backup reminder
function checkDataBackup() {
    fetch(API_URL)
        .then(response => response.json())
        .then(internships => {
            if (internships.length > 0) {
                const lastBackup = localStorage.getItem('lastBackup');
                const daysSinceBackup = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)) : 7;
                
                if (daysSinceBackup >= 7) {
                    showNotification('Consider backing up your data! Use the settings to export.', 'info');
                }
            }
        })
        .catch(error => console.error('Error checking backup status:', error));
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function to get time ago
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

// Utility function to generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initial load is now handled in DOMContentLoaded event
