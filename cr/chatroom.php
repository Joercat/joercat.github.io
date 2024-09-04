<?php
session_start();

// Dummy user data (in a real scenario, this would be fetched from a database)
$valid_users = array(
    'user1' => 'password1',
    'user2' => 'password2'
);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if (isset($valid_users[$username]) && $valid_users[$username] === $password) {
        $_SESSION['username'] = $username;
        header('Location: chatroom.html');
        exit;
    } else {
        echo '<script>alert("Invalid username or password");</script>';
    }
}
?>
