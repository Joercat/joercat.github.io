
document.addEventListener('DOMContentLoaded', function() {

    // Active Link Highlight
    const currentPath = window.location.href.split('#')[0].split('?')[0];
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    navLinks.forEach(link => {
        const linkHref = link.href.split('#')[0].split('?')[0];
        if (linkHref === currentPath) {
            link.classList.add('active-link');
        }
    });

    // Subtle Hover Effect for Main Buttons
    const actionButtons = document.querySelectorAll('.action-section button');

    actionButtons.forEach(button => {
        button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });

    // Welcome Text Entrance Animation
    const welcomeText = document.querySelector('.welcome-text');
    if (welcomeText) {
        welcomeText.style.opacity = '0';
        welcomeText.style.transform = 'translateX(-20px)';
        welcomeText.style.transition = 'opacity 1s ease-out, transform 1s ease-out';

        setTimeout(() => {
            welcomeText.style.opacity = '1';
            welcomeText.style.transform = 'translateX(0)';
        }, 300);
    }

    // Note Text Pulsate (Subtle, to half visibility)
    const noteText = document.querySelector('.note-text');
    if (noteText) {
        let opacity = 1;
        let direction = -0.01; // Controls the change in opacity
        const minOpacity = 0.5; // Minimum visibility (50%)
        const maxOpacity = 1;   // Maximum visibility (100%)

        setInterval(() => {
            opacity += direction;

            if (opacity <= minOpacity) {
                opacity = minOpacity; // Cap at minOpacity
                direction *= -1; // Reverse direction
            } else if (opacity >= maxOpacity) {
                opacity = maxOpacity; // Cap at maxOpacity
                direction *= -1; // Reverse direction
            }
            noteText.style.opacity = opacity;
        }, 50); // Speed of pulsation (lower number = faster)
    }

});
