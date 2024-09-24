  document.getElementById("a");
  var today = new Date();
  var hourNow = today.getHours();
  var greeting;

  if (hourNow > 18) {
      greeting = 'Good evening!';
  } else if (hourNow > 12) {
      greeting = 'Good afternoon!';
  } else if (hourNow > 0) {
      greeting = 'Good morning!';
  } else {
      greeting = 'Hello!';
  }

  document.write('<h1 class="welcome">' + greeting + '</h1>');
