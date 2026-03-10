// ============================================================
// BLUEJAY SCHOOL MANAGEMENT SYSTEM - Supabase Configuration
// ============================================================

window.SUPABASE_URL = 'https://ktbidygpciwsqfycutve.supabase.co';
window.SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YmlkeWdwY2l3c3FmeWN1dHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTU2MTQsImV4cCI6MjA4NzY5MTYxNH0.ZJh8jmWtOeNSRsi5ZMy9UzwQghzISoJy3ETDKUWT1-s';
window.SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YmlkeWdwY2l3c3FmeWN1dHZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExNTYxNCwiZXhwIjoyMDg3NjkxNjE0fQ.EIqosb9iO0efxWtdrxNlU2nP1yo8WvkeWMyJqakIP7g';

// ============================================================
// PWA Configuration
// ============================================================
if ('serviceWorker' in navigator) {
    let swPath = './sw.js';
    let manifestPath = './manifest.json';

    // Resolve paths relative to config.js location
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
        if (s.src && s.src.includes('config.js')) {
            const configUrl = new URL(s.src);
            let configDir = configUrl.pathname.substring(0, configUrl.pathname.lastIndexOf('/') + 1);
            // For local file:// testing, this trick might just give the path
            if (configUrl.protocol === 'file:') {
                configDir = s.getAttribute('src').replace('config.js', '');
            }
            swPath = configDir + 'sw.js';
            manifestPath = configDir + 'manifest.json';
            break;
        }
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register(swPath).then(reg => {
            console.log('PWA Service Worker registered with scope: ', reg.scope);
        }).catch(err => {
            console.log('PWA Service Worker registration failed: ', err);
        });
    });

    // Inject manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestPath;
    document.head.appendChild(link);
}
