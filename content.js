function injectAnalyzeChannelButton() {
    if (document.getElementById('analyze-channel-btn')) return;

    console.log('[YTC Analyzer] Trying to inject analyze button (channel)...');

    let target = document.querySelector('ytd-about-channel-renderer');
    if (!target) {
        target = document.querySelector('ytd-c4-tabbed-header-renderer');
    }

    if (!target) {
        console.log('[YTC Analyzer] Target not found yet (channel page).');
        return;
    }

    console.log('[YTC Analyzer] Injecting channel button into:', target.tagName);

    const btn = document.createElement('button');
    btn.id = 'analyze-channel-btn';
    btn.innerText = 'Analyze Channel';
    btn.style.cssText = `
        padding: 8px 16px;
        background-color: #FF0000;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin: 8px;
    `;
    btn.addEventListener('click', extractChannelData);
    target.prepend(btn);
}

function injectAnalyzeVideoButton() {
    if (document.getElementById('analyze-video-btn')) return;

    console.log('[YTC Analyzer] Trying to inject analyze button (video)...');

    const target = document.querySelector('ytd-watch-metadata');
    if (!target) {
        console.log('[YTC Analyzer] Target not found yet (video page).');
        return;
    }

    console.log('[YTC Analyzer] Injecting video button into:', target.tagName);

    const btn = document.createElement('button');
    btn.id = 'analyze-video-btn';
    btn.innerText = 'Analyze Video';
    btn.style.cssText = `
        padding: 8px 16px;
        background-color: #FF8800;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin: 8px;
    `;
    btn.addEventListener('click', extractVideoData);
    target.prepend(btn);
}

async function extractChannelData() {
    console.log('[YTC Analyzer] Extracting channel data...');
    const aboutSection = document.querySelector('ytd-about-channel-renderer');

    const safeText = (element) => element ? element.innerText.trim() : 'Not found';

    const data = {
        channelName: document.querySelector('ytd-engagement-panel-title-header-renderer #title-text')?.innerText.trim() || 'Not found',
        description: safeText(aboutSection?.querySelector('#description-container')),
        websiteUrl: window.location.href,
        country: findRowText(aboutSection, 'Country'),
        joinedDate: findRowText(aboutSection, 'Joined'),
        subscriberCount: findRowText(aboutSection, 'subscribers'),
        totalVideos: findRowText(aboutSection, 'videos'),
        totalViews: findRowText(aboutSection, 'views'),
        email: aboutSection?.querySelector('yt-button-renderer button span')?.innerText.includes('View email address') ? 'Available (click to unlock)' : 'Not found'
    };

    console.log('[YTC Analyzer] Data extracted (channel):', data);

    if (data.description === 'Not found' || data.description.length < 10) {
        data.description += ' (Tip: If this looks empty, try clicking "...more" and re-run.)';
    }

    showDataModal(data, 'Channel Info');
}

async function extractVideoData() {
    console.log('[YTC Analyzer] Extracting video data...');
    const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
    const channelEl = document.querySelector('#text-container a');

    const data = {
        videoTitle: titleEl ? titleEl.innerText.trim() : 'Not found',
        channelName: channelEl ? channelEl.innerText.trim() : 'Not found',
        channelLink: channelEl ? 'https://www.youtube.com' + channelEl.getAttribute('href') : 'Not found',
        videoUrl: window.location.href
    };

    console.log('[YTC Analyzer] Data extracted (video):', data);

    showVideoModal(data);
}

function findRowText(section, keyword) {
    if (!section) return 'Not found';
    const rows = section.querySelectorAll('table tr');
    for (const row of rows) {
        if (row.innerText.toLowerCase().includes(keyword.toLowerCase())) {
            return row.innerText.trim();
        }
    }
    return 'Not found';
}

function showDataModal(data, title = 'Channel Info') {
    let existing = document.getElementById('analyze-popup');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'analyze-popup';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #333;
        padding: 20px;
        z-index: 99999;
        max-width: 500px;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;

    modal.innerHTML = `
        <h2>${title}</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <button id="copy-btn">Copy to Clipboard</button>
        <button id="download-btn">Download JSON</button>
        <button id="close-btn">Close</button>
    `;

    document.body.appendChild(modal);

    document.getElementById('copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        alert('Copied to clipboard!');
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        modal.remove();
    });
}

function showVideoModal(data) {
    let existing = document.getElementById('analyze-popup');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'analyze-popup';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #333;
        padding: 20px;
        z-index: 99999;
        max-width: 500px;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;

    const downloadUrl = 'https://downsub.com/?url=' + encodeURIComponent(data.videoUrl);

    modal.innerHTML = `
        <h2>Video Info</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <button id="copy-btn">Copy to Clipboard</button>
        <button id="download-btn">Download JSON</button>
        <a href="${downloadUrl}" target="_blank">
            <button id="download-subtitles-btn">Download Subtitles</button>
        </a>
        <button id="close-btn">Close</button>
    `;

    document.body.appendChild(modal);

    document.getElementById('copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        alert('Copied to clipboard!');
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video-data.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        modal.remove();
    });
}

// Observer to inject both types of buttons depending on page
const observer = new MutationObserver(() => {
    if (window.location.href.includes('/watch')) {
        injectAnalyzeVideoButton();
    } else {
        injectAnalyzeChannelButton();
    }
});
observer.observe(document.body, {childList: true, subtree: true});