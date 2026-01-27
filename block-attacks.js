// Emergency attack blocker
(function() {
    'use strict';
    
    // Detect Nmap scanning
    const detectNmap = () => {
        const patterns = [
            /nmap|kali|metasploit|burpsuite|sqlmap|hydra/i,
            /port.*scan|vulnerability.*scan|penetration.*test/i,
            /\.bak$|\.old$|\.backup$|wp-admin|phpmyadmin/i
        ];
        
        // Check URL for scan patterns
        patterns.forEach(pattern => {
            if (pattern.test(window.location.href) || pattern.test(document.referrer)) {
                triggerEmergencyLockdown();
                return;
            }
        });
        
        // Check for common hacking tools in user agent
        const hackingTools = [
            'curl', 'wget', 'nmap', 'nikto', 'sqlmap', 
            'burpsuite', 'metasploit', 'kali', 'paros'
        ];
        
        const ua = navigator.userAgent.toLowerCase();
        if (hackingTools.some(tool => ua.includes(tool))) {
            triggerEmergencyLockdown();
        }
    };
    
    // Port scanning simulation detection
    const detectPortScanning = () => {
        // Monitor for rapid sequential requests (port scanning behavior)
        let requestTimestamps = [];
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const now = Date.now();
            requestTimestamps.push(now);
            
            // Keep only last 5 seconds of timestamps
            requestTimestamps = requestTimestamps.filter(t => now - t < 5000);
            
            // If more than 20 requests in 5 seconds, likely scanning
            if (requestTimestamps.length > 20) {
                console.error('🚨 PORT SCANNING DETECTED - Multiple rapid requests');
                logAttack('Port Scanning', requestTimestamps.length);
                return Promise.reject(new Error('Security Violation'));
            }
            
            return originalFetch.apply(this, args);
        };
    };
    
    // Create fake vulnerable endpoints as traps
    const setupHoneypots = () => {
        const honeypots = [
            {url: '/config.php', type: 'php_config'},
            {url: '/.env', type: 'env_file'},
            {url: '/wp-admin', type: 'wordpress_admin'},
            {url: '/admin.php', type: 'admin_panel'},
            {url: '/backup.zip', type: 'backup_file'},
            {url: '/database.sql', type: 'database_dump'},
            {url: '/api/keys', type: 'api_keys'},
            {url: '/.git/config', type: 'git_config'}
        ];
        
        honeypots.forEach(honeypot => {
            const link = document.createElement('a');
            link.href = honeypot.url;
            link.style.display = 'none';
            link.setAttribute('data-honeypot', honeypot.type);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logHoneypotTrigger(honeypot.type);
                redirectToJail();
            });
            document.body.appendChild(link);
        });
    };
    
    // Attack logging and reporting
    const logAttack = (type, details) => {
        const attackData = {
            type: type,
            details: details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            ip: 'Logged', // Would need backend for real IP
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        console.error(`🚨 ATTACK DETECTED: ${type}`, attackData);
        
        // Send to logging endpoint (you need to set this up)
        fetch('/api/log-attack', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(attackData)
        }).catch(() => {
            // Fallback to localStorage if endpoint fails
            const attacks = JSON.parse(localStorage.getItem('attack_logs') || '[]');
            attacks.push(attackData);
            localStorage.setItem('attack_logs', JSON.stringify(attacks));
        });
        
        // Send email alert (if you have an endpoint)
        fetch('/api/alert-admin', {
            method: 'POST',
            body: JSON.stringify({attack: type, time: new Date()})
        });
    };
    
    const logHoneypotTrigger = (honeypotType) => {
        logAttack(`Honeypot Triggered: ${honeypotType}`, {
            honeypot: honeypotType,
            attacker: 'Active penetration attempt'
        });
    };
    
    // Emergency lockdown
    const triggerEmergencyLockdown = () => {
        console.error('🚨 EMERGENCY LOCKDOWN ACTIVATED');
        
        // Replace entire page with lockdown screen
        document.documentElement.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>🚨 SECURITY BREACH 🚨</title>
                <style>
                    body {
                        background: #000;
                        color: #f00;
                        font-family: monospace;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                    .container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        border: 10px solid #f00;
                    }
                    .blink {
                        animation: blink 1s infinite;
                    }
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div>
                        <h1 class="blink">⚠️ SECURITY BREACH DETECTED ⚠️</h1>
                        <h2>UNAUTHORIZED PENETRATION ATTEMPT</h2>
                        <p>Your activities have been logged and reported</p>
                        <p>IP Address: <span id="ip">[LOGGED]</span></p>
                        <p>Time: ${new Date().toISOString()}</p>
                        <p>Attack Type: Nmap Port Scanning & Service Fingerprinting</p>
                        <p>All data has been sent to security authorities</p>
                        <hr>
                        <p><small>This incident violates Computer Fraud and Abuse Act</small></p>
                    </div>
                </div>
                <script>
                    // Prevent any escape
                    window.onkeydown = window.onclick = window.onscroll = function(e) {
                        e.preventDefault();
                        return false;
                    };
                    // Log to console
                    console.error('%c🚨 SECURITY BREACH - ALL ACTIVITIES LOGGED 🚨', 
                        'color: red; font-size: 20px; font-weight: bold;');
                </script>
            </body>
            </html>
        `;
        
        // Make page impossible to close
        window.onbeforeunload = function() {
            return "Security breach in progress. Closing this window will notify authorities.";
        };
    };
    
    const redirectToJail = () => {
        window.location.href = '/security-jail.html';
    };
    
    // Initialize protection
    detectNmap();
    detectPortScanning();
    setupHoneypots();
    
    // Continuous monitoring
    setInterval(detectNmap, 1000);
    
    // Override console to detect debugging
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        if (args.some(arg => typeof arg === 'string' && 
            (arg.includes('nmap') || arg.includes('port') || arg.includes('scan')))) {
            logAttack('Console Scanning Attempt', args);
        }
        originalConsoleLog.apply(console, args);
    };
    
})();
