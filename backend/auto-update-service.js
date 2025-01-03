const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');


function setupAutoUpdate(app) {
    console.log('[CRON-SETUP] Auto-update service initialized');
    
    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinutes = minutes <= 30 ? 30 : 60;
    const nextRun = new Date(now.setMinutes(nextMinutes, 0, 0));
    console.log(`[CRON-SCHEDULE] Next update at: ${nextRun.toLocaleString()}`);
    
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        const runTime = new Date();
        console.log(`\n[CRON-UPDATE-START] ==================`);
        console.log(`[CRON-UPDATE] Running at: ${runTime.toLocaleString()}`);
        
        runPythonUpdate()
            .then(output => {
                console.log('[CRON-UPDATE-RESULT]', JSON.stringify(output));
                const nextRun = new Date(runTime.getTime() + 30 * 60000);
                console.log(`[CRON-SCHEDULE] Next update at: ${nextRun.toLocaleString()}`);
                console.log(`[CRON-UPDATE-END] ==================\n`);
            })
            .catch(error => {
                console.error('[CRON-UPDATE-ERROR]', error.message);
                const nextRun = new Date(runTime.getTime() + 30 * 60000);
                console.log(`[CRON-SCHEDULE] Next update at: ${nextRun.toLocaleString()}`);
                console.log(`[CRON-UPDATE-END] ==================\n`);
            });
    });
}

function runPythonUpdate() {
    return new Promise((resolve, reject) => {
        console.log(`\n=== Auto-Update Check: ${new Date().toISOString()} ===`);
        
        const pythonScript = path.join(__dirname, 'update_sketches.py');
        console.log('Running Python script:', pythonScript);
        
        const python = spawn('python', [pythonScript]);
        
        let dataString = '';
        
        python.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Python output:', output);
            dataString += output;
        });
        
        python.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });
        
        python.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}`));
                return;
            }
            
            try {
                // Try to parse the last line as JSON
                const lines = dataString.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const result = JSON.parse(lastLine);
                resolve(result);
            } catch (e) {
                resolve({ 
                    success: true, 
                    output: dataString,
                    message: 'Update check completed'
                });
            }
        });
        
        python.on('error', (error) => {
            console.error('Failed to start Python process:', error);
            reject(error);
        });
    });
}

module.exports = { setupAutoUpdate, runPythonUpdate };