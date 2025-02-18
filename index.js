import { getContext } from "../../extensions.js";

// Extension initialization
console.log('[SES Extensions] Starting extension initialization...');
window.apiStatsFetcher = {
    settings: {
        apiPort: 8000,  // Default FastAPI port
        refreshInterval: 60, // in seconds
    },
};

// Register extension
jQuery(() => {
    console.log('[SES Extensions] jQuery ready, getting context...');
    try {
        const context = getContext();
        console.log('[SES Extensions] Context obtained:', context);
        
        // Register function tool if supported
        if (context.isToolCallingSupported()) {
            console.log('Function tools are supported');
            console.log('[SES Extensions] Attempting to register function tool...');
            context.registerFunctionTool({
                name: "readKpmLogs",
                displayName: "Read KPM Logs",
                description: "Read the contents of the KPM logs file (~/.kpm_log.csv). Use this when you need to access keyboard activity statistics.",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    properties: {
                        maxLines: {
                            type: 'integer',
                            description: 'Maximum number of lines to read from the end of the file. If not provided, returns all lines.',
                            optional: true
                        }
                    }
                },
                action: async ({ maxLines }) => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        console.log('Debug - maxLines:', maxLines, 'port:', port);
                        const requestBody = { max_lines: maxLines };
                        console.log('Debug - request body:', JSON.stringify(requestBody));
                        const response = await fetch(`http://localhost:${port}/read-logs`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestBody)
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.text();
                        return data;
                    } catch (error) {
                        return `Error reading KPM logs: ${error.message}`;
                    }
                },
                formatMessage: ({ maxLines }) => {
                    return `Reading KPM logs${maxLines ? ` (last ${maxLines} lines)` : ''}`;
                },
                shouldRegister: () => {
                    return true;
                }
            });
            console.log('[SES Extensions] Function tool registration completed');
        }
        
        // Add settings UI
        console.log('[SES Extensions] Adding settings UI...');
        const settingsHtml = `
            <div class="api-stats-settings">
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>API Stats Fetcher</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                    </div>
                    <div class="inline-drawer-content">
                        <div class="api-stats-fetcher-settings">
                            <label for="api_port">API Port:</label>
                            <input type="number" id="api_port" class="text_pole" value="${window.apiStatsFetcher.settings.apiPort}">
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
            window.apiStatsFetcher.settings.apiPort = parseInt($('#api_port').val());
            window.apiStatsFetcher.settings.refreshInterval = parseInt($('#refresh_interval').val());
            console.log('API Stats Fetcher settings saved:', window.apiStatsFetcher.settings);
        }
        
        // Load settings
        const loadSettings = () => {
            const settings = localStorage.getItem('apiStatsFetcher_settings');
            if (settings) {
                window.apiStatsFetcher.settings = JSON.parse(settings);
                $('#api_port').val(window.apiStatsFetcher.settings.apiPort);
                $('#refresh_interval').val(window.apiStatsFetcher.settings.refreshInterval);
            }
        }
        
        // Persist settings to localStorage
        function persistSettings() {
            localStorage.setItem('apiStatsFetcher_settings', JSON.stringify(window.apiStatsFetcher.settings));
        }
        
        // Setup event listeners
        $('#api_port, #refresh_interval').on('change', () => {
            saveSettings();
            persistSettings();
        });
        
        // Initial settings load
        loadSettings();
    } catch (error) {
        console.error('[SES Extensions] Error during initialization:', error);
        throw error;
    }
});
