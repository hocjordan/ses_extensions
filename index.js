import { getContext } from "../../extensions.js";
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

// Extension initialization
window.apiStatsFetcher = {
    settings: {
        refreshInterval: 60, // in seconds
    },
};

// Register extension
jQuery(() => {
    const context = getContext();
    
    // Register function tool if supported
    if (context.isToolCallingSupported()) {
        context.registerFunctionTool({
            name: "readKpmLogs",
            displayName: "Read KPM Logs",
            description: "Read the contents of the KPM logs file (~/.kpm_logs.csv). Use this when you need to access keyboard activity statistics.",
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
                    const homedir = os.homedir();
                    const logPath = path.join(homedir, '.kpm_log.csv');
                    
                    const content = await fs.readFile(logPath, 'utf8');
                    const lines = content.split('\n').filter(line => line.trim());
                    
                    if (maxLines && maxLines > 0) {
                        return lines.slice(-maxLines).join('\n');
                    }
                    return content;
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
    }
    
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
        window.apiStatsFetcher.settings.refreshInterval = parseInt($('#refresh_interval').val());
        console.log('API Stats Fetcher settings saved:', window.apiStatsFetcher.settings);
    }
    
    // Load settings
    const loadSettings = () => {
        const settings = localStorage.getItem('apiStatsFetcher_settings');
        if (settings) {
            window.apiStatsFetcher.settings = JSON.parse(settings);
            $('#refresh_interval').val(window.apiStatsFetcher.settings.refreshInterval);
        }
    }
    
    // Save settings to localStorage
    const persistSettings = () => {
        localStorage.setItem('apiStatsFetcher_settings', JSON.stringify(window.apiStatsFetcher.settings));
    }
    
    // Setup event listeners
    $('#refresh_interval').on('change', () => {
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
        refreshInterval = setInterval(fetchStats, window.apiStatsFetcher.settings.refreshInterval * 1000);
        fetchStats(); // Initial fetch
    }
    
    // Initial refresh interval setup
    updateRefreshInterval();
});
