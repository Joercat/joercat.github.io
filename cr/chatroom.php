<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $_SESSION['username'] = $username;
    header('Location: chatroom.html');
    exit;
}
?>
