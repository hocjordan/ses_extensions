import { getContext } from "../../extensions.js";

// Extension initialization
window.apiStatsFetcher = {
    settings: {
        apiEndpoint: '',
        refreshInterval: 60, // in seconds
    },
};

// Register extension
jQuery(() => {
    const context = getContext();
    
    // Add settings UI
    const settingsHtml = `
        <div class="api-stats-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>API Stats Fetcher</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div class="api-stats-fetcher-settings">
                        <label for="api_endpoint">API Endpoint:</label>
                        <input type="text" id="api_endpoint" class="text_pole" value="${window.apiStatsFetcher.settings.apiEndpoint}">
                        <label for="refresh_interval">Refresh Interval (seconds):</label>
                        <input type="number" id="refresh_interval" class="text_pole" value="${window.apiStatsFetcher.settings.refreshInterval}">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings').append(settingsHtml);
    
    // Save settings
    function saveSettings() {
        window.apiStatsFetcher.settings.apiEndpoint = $('#api_endpoint').val();
        window.apiStatsFetcher.settings.refreshInterval = parseInt($('#refresh_interval').val());
        console.log('API Stats Fetcher settings saved:', window.apiStatsFetcher.settings);
    }
    
    // Load settings
    const loadSettings = () => {
        const settings = localStorage.getItem('apiStatsFetcher_settings');
        if (settings) {
            window.apiStatsFetcher.settings = JSON.parse(settings);
            $('#api_endpoint').val(window.apiStatsFetcher.settings.apiEndpoint);
            $('#refresh_interval').val(window.apiStatsFetcher.settings.refreshInterval);
        }
    }
    
    // Save settings to localStorage
    const persistSettings = () => {
        localStorage.setItem('apiStatsFetcher_settings', JSON.stringify(window.apiStatsFetcher.settings));
    }
    
    // Fetch stats from API
    async function fetchStats() {
        try {
            const response = await fetch(window.apiStatsFetcher.settings.apiEndpoint);
            const data = await response.json();
            
            // Create or update stats display
            let statsDiv = $('#api-stats-display');
            if (statsDiv.length === 0) {
                statsDiv = $('<div id="api-stats-display" class="api-stats-display"></div>');
                $('#send_form').before(statsDiv);
            }
            
            // Display the stats
            statsDiv.html(`
                <div class="api-stats-content">
                    <h4>API Stats</h4>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `);
        } catch (error) {
            console.error('Error fetching API stats:', error);
        }
    }
    
    // Setup event listeners
    $('#api_endpoint, #refresh_interval').on('change', () => {
        saveSettings();
        persistSettings();
    });
    
    // Initial load
    loadSettings();
    
    // Setup refresh interval
    let refreshInterval;
    
    function updateRefreshInterval() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        if (window.apiStatsFetcher.settings.apiEndpoint) {
            refreshInterval = setInterval(fetchStats, window.apiStatsFetcher.settings.refreshInterval * 1000);
            fetchStats(); // Initial fetch
        }
    }
    
    // Watch for settings changes
    const observer = new MutationObserver(() => {
        updateRefreshInterval();
    });
    
    observer.observe($('#api_endpoint')[0], {
        attributes: true,
        childList: true,
        characterData: true
    });
    
    // Initial refresh interval setup
    updateRefreshInterval();
});
