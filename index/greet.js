document.addEventListener('DOMContentLoaded', function() {
  const greetingElement = document.getElementById("a");

  if (greetingElement) {
    let today = new Date();
    let hourNow = today.getHours();
    let greetingText;
    let greetingEmoji;

    if (hourNow >= 18) {
      greetingText = 'Good evening!';
      greetingEmoji = '🌙';
    } else if (hourNow >= 12) {
      greetingText = 'Good afternoon!';
      greetingEmoji = '☀️';
    } else if (hourNow >= 5) {
      greetingText = 'Good morning!';
      greetingEmoji = '🌅';
    } else {
      greetingText = 'Hello, night owl!';
      greetingEmoji = '🦉';
    }

    // Create a new heading element for the greeting
    const greetingHeading = document.createElement('h3');
    greetingHeading.classList.add('welcome-text');
    greetingHeading.style.fontSize = '32px';
    greetingHeading.style.marginTop = '20px';
    greetingHeading.style.opacity = '0';
    greetingHeading.style.transform = 'translateY(20px)';
    greetingHeading.innerHTML = `${greetingEmoji} ${greetingText}`;

    // Append the new greeting to the 'a' div
    greetingElement.appendChild(greetingHeading);

    // Animate in
    setTimeout(() => {
      greetingHeading.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      greetingHeading.style.opacity = '1';
      greetingHeading.style.transform = 'translateY(0)';
    }, 500);
  }
});
