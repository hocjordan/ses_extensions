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
                    description: 'Read the contents of the KPM logs file',
                    properties: {
                        maxLines: {
                            type: 'integer',
                            description: 'Maximum number of lines to read from the end of the file. Returns all lines if not specified.',
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
                    description: 'No parameters required - returns today\'s activity summary',
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
                    description: 'Get today\'s step data from Garmin Connect',
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
                    description: 'No parameters required - returns today\'s heart rate data',
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
                description: "Get today's sleep data from Garmin Connect (filtered to remove detailed metrics)",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    description: 'No parameters required - returns today\'s sleep data',
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
                description: "Get body battery data for a date range from Garmin Connect",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    description: 'Get body battery data for a date range from Garmin Connect',
                    properties: {
                        startDate: {
                            type: 'string',
                            description: 'Start date in YYYY-MM-DD format',
                            pattern: '^\d{4}-\d{2}-\d{2}$'
                        },
                        endDate: {
                            type: 'string',
                            description: 'End date in YYYY-MM-DD format (optional)',
                            pattern: '^\d{4}-\d{2}-\d{2}$',
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

            context.registerFunctionTool({
                name: "getGarminHeartRateRange",
                displayName: "Get Garmin Heart Rate Range",
                description: "Get heart rate data for a date range from Garmin Connect",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    description: 'Get heart rate data for a date range from Garmin Connect',
                    properties: {
                        startDate: {
                            type: 'string',
                            description: 'Start date in YYYY-MM-DD format',
                            pattern: '^\d{4}-\d{2}-\d{2}$'
                        },
                        endDate: {
                            type: 'string',
                            description: 'End date in YYYY-MM-DD format (optional)',
                            pattern: '^\d{4}-\d{2}-\d{2}$',
                            optional: true
                        }
                    },
                    required: ['startDate']
                },
                action: async ({ startDate, endDate }) => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/garmin/heart-rate-within-date-range`, {
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
                        return `Error fetching Garmin heart rate range data: ${error.message}`;
                    }
                },
                formatMessage: ({ startDate, endDate }) => {
                    return `Fetching Garmin heart rate data from ${startDate}${endDate ? ` to ${endDate}` : ''}`;
                },
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "listDatabaseFiles",
                displayName: "List Database Files",
                description: "List all files in the database directory so that you can find out what to access",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    description: 'List all files in the database directory recursively',
                    properties: {}
                },
                action: async () => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/database/get-index`, {
                            method: 'GET',
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
                        return `Error listing database files: ${error.message}`;
                    }
                },
                formatMessage: () => "Listing database files",
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "readDatabaseFile",
                displayName: "Read Database File",
                description: "Read a file from the database directory. Use the 'list database files' function to get a list of available files.",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    description: 'Read contents of a specific database file. Use the "list database files" function to get a list of available files.',
                    properties: {
                        filename: {
                            type: 'string',
                            description: 'Name of the file to read (must be within the database directory)'
                        }
                    },
                    required: ['filename']
                },
                action: async ({ filename }) => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/database/read-file`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filename })
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.text();
                        return data;
                    } catch (error) {
                        return `Error reading database file: ${error.message}`;
                    }
                },
                formatMessage: ({ filename }) => `Reading database file: ${filename}`,
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "createDatabaseFile",
                displayName: "Create Database File",
                description: "Create a new file in the database directory. Can only create files within existing directories.",
                parameters: {
                    $schema: 'http://json-schema.org/draft-04/schema#',
                    type: 'object',
                    description: 'Create a new file in the database directory. Parent directory must exist.',
                    properties: {
                        filename: {
                            type: 'string',
                            description: 'Name for the new file (must be within the database and parent directory must exist)'
                        },
                        content: {
                            type: 'string',
                            description: 'Content to write to the file'
                        }
                    },
                    required: ['filename', 'content']
                },
                action: async ({ filename, content }) => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/database/create-file`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filename, content })
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error creating database file: ${error.message}`;
                    }
                },
                formatMessage: ({ filename }) => `Creating database file: ${filename}`,
                shouldRegister: () => true
            });

            context.registerFunctionTool({
                name: "patchDatabaseFile",
                displayName: "Patch Database File",
                description: "Apply patches to a file using Google's diff-match-patch library.",
                parameters: {
                    $schema: "https://json-schema.org/draft/2020-12/schema",
                    type: "object",
                    description: 'Apply patches to a file using Google\'s diff-match-patch library',
                    properties: {
                        filename: {
                            type: "string",
                            description: "Name of the database file to patch (e.g. 'data.txt')"
                        },
                        diffContent: {
                            type: 'array',
                            description: 'Array of diff tuples in format [[-1, "text to remove"], [1, "text to add"], [0, "unchanged text"]] where -1 indicates removal, 1 indicates addition, and 0 indicates unchanged text',
                            items: {
                                type: 'array',
                                prefixItems: [
                                    { type: 'integer', enum: [-1, 0, 1] },
                                    { type: 'string' }
                                ],
                                items: false,
                                minItems: 2,
                                maxItems: 2
                            }
                        },
                        dryRun: {
                            type: 'boolean',
                            description: 'If true, shows what changes would be made without applying them',
                            default: false
                        }
                    },
                    required: ['filename', 'diffContent']
                },
                action: async ({ filename, diffContent, dryRun = false }) => {
                    try {
                        const port = window.apiStatsFetcher.settings.apiPort;
                        const response = await fetch(`http://localhost:${port}/database/patch-file`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ filename, diff_content: diffContent, dry_run: dryRun })
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        return `Error patching database file: ${error.message}`;
                    }
                },
                formatMessage: ({ filename, dryRun }) => `${dryRun ? 'Dry run: ' : ''}Patching database file: ${filename}`,
                shouldRegister: () => true
            });

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
        }
        } catch (error) {
            console.error('[SES Extensions] Error during initialization:', error);
            throw error;
        }
    });
