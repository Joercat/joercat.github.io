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
      greeting = 'Have a nice day!';
  }

  document.write('<h1 class="welcome2">' + greeting + '</h1>');
