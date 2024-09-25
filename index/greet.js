  document.getElementById("a");
  let today = new Date();
  let hourNow = today.getHours();
  let greeting;

  if (hourNow > 18) {
      greeting = 'Good evening!';
  } else if (hourNow > 12) {
      greeting = 'Good afternoon!';
  } else if (hourNow > 0) {
      greeting = 'Good morning!';
  } else {
      greeting = 'Have a nice day!';
  }

  document.write('<h1 class="welcome2">' + greeting + '</h1>');
