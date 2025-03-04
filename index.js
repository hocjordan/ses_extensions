import { getContext } from "../../../extensions.js";

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

            // Register Garmin function tools
            context.registerFunctionTool({
                name: "getGarminUserSummary",
                displayName: "Get Garmin User Summary",
                description: "Get today's activity summary from Garmin Connect",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    properties: {}
                },
                action: async () => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/garmin/user-summary`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error fetching Garmin user summary: ${error.message}`;
                    }
                },
                formatMessage: () => "Fetching Garmin user summary",
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "getGarminSteps",
                displayName: "Get Garmin Steps",
                description: "Get today's step data from Garmin Connect",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    properties: {}
                },
                action: async () => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/garmin/steps`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error fetching Garmin steps data: ${error.message}`;
                    }
                },
                formatMessage: () => "Fetching Garmin steps data",
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "getGarminHeartRate",
                displayName: "Get Garmin Heart Rate",
                description: "Get today's heart rate data from Garmin Connect",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    properties: {}
                },
                action: async () => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/garmin/heart-rate`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error fetching Garmin heart rate data: ${error.message}`;
                    }
                },
                formatMessage: () => "Fetching Garmin heart rate data",
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "getGarminSleep",
                displayName: "Get Garmin Sleep",
                description: "Get today's sleep data from Garmin Connect",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    properties: {}
                },
                action: async () => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/garmin/sleep`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error fetching Garmin sleep data: ${error.message}`;
                    }
                },
                formatMessage: () => "Fetching Garmin sleep data",
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "getGarminBodyBattery",
                displayName: "Get Garmin Body Battery",
                description: "Get body battery data from Garmin Connect for a date range",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    properties: {
                        startDate: {
                            type: 'string',
                            description: 'Start date in YYYY-MM-DD format',
                            format: 'date'
                        },
                        endDate: {
                            type: 'string',
                            description: 'End date in YYYY-MM-DD format (optional)',
                            format: 'date',
                            optional: true
                        }
                    },
                    required: ['startDate']
                },
                action: async ({ startDate, endDate }) => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/garmin/body-battery`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ start_date: startDate, end_date: endDate })
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error fetching Garmin body battery data: ${error.message}`;
                    }
                },
                formatMessage: ({ startDate, endDate }) => 
                    `Fetching Garmin body battery data from ${startDate}${endDate ? ` to ${endDate}` : ''}`,
                shouldRegister: () => true
            });
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
