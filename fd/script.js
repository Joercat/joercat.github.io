document.getElementById('removeButton').addEventListener('click', function() {
    alert('Attempting to remove GoGuardian extension...');
    
    // Note: The following code is a placeholder and will not actually remove the extension
    // because browser extensions cannot be removed via script due to security reasons.
    
    // Example of a possible action
    console.log('This is where the extension removal code would go.');

    // Attempt to simulate extension removal
    try {
        // Example pseudo-code, will not execute
        chrome.management.uninstall('chrome-extension://haldlgldplgnggkjaafhelgiaglafanh/manifest.json', function() {
            alert('GoGuardian extension removed.');
        });
    } catch (error) {
        console.error('Error removing extension:', error);
        alert('Failed to remove the GoGuardian extension. Manual removal is required.');
    }
});
