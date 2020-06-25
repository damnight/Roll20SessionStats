/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/load_stats.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);

function listenForClicks() {
    document.addEventListener('click', (e) => {  
        document.getElementById('show_session_stats').innerHTML = 'ghgj';
    });
}