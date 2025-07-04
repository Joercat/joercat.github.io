document.addEventListener('DOMContentLoaded', function() {
  const greetingElement = document.getElementById("a");

  if (greetingElement) {
    let today = new Date();
    let hourNow = today.getHours();
    let greetingText;

    if (hourNow > 18) {
        greetingText = 'Good evening!';
    } else if (hourNow > 12) {
        greetingText = 'Good afternoon!';
    } else { // Covers hourNow > 0 and the default case for early morning
        greetingText = 'Good morning!';
    }

    // Create a new heading element for the greeting
    const greetingHeading = document.createElement('h3');
    greetingHeading.classList.add('welcome-text'); // Apply consistent styling
    greetingHeading.textContent = greetingText;

    // Append the new greeting to the 'a' div
    greetingElement.appendChild(greetingHeading);
  }
});
