"""
CatCode: A Programming Language for Cat Lovers

CatCode is a programming language designed for cat enthusiasts. It allows users to write code that interacts with and controls virtual cats. The language includes commands for moving cats, feeding them, and even making them perform tricks.

This module provides the core functionality of the CatCode language, including the interpreter and the implementation of the various CatCode commands.
"""

class CatCodeInterpreter:
    """
    The CatCodeInterpreter class is responsible for executing CatCode programs.

    Attributes:
        cats (list): A list of virtual cats that the program can interact with.
    """

    def __init__(self):
        self.cats = []

    def add_cat(self, cat_name):
        """
        Adds a new virtual cat to the program.

        Args:
            cat_name (str): The name of the new cat.
        """
        self.cats.append(Cat(cat_name))

    def execute_command(self, command):
        """
        Executes a CatCode command.

        Args:
            command (str): The CatCode command to be executed.
        """
        parts = command.split()
        if parts[0] == "move":
            self.move_cat(parts[1], parts[2])
        elif parts[0] == "feed":
            self.feed_cat(parts[1])
        elif parts[0] == "trick":
            self.do_trick(parts[1], parts[2])

    def move_cat(self, cat_name, direction):
        """
        Moves a virtual cat in the specified direction.

        Args:
            cat_name (str): The name of the cat to be moved.
            direction (str): The direction to move the cat (up, down, left, or right).
        """
        for cat in self.cats:
            if cat.name == cat_name:
                cat.move(direction)
                print(f"{cat.name} moved {direction}.")

    def feed_cat(self, cat_name):
        """
        Feeds a virtual cat.

        Args:
            cat_name (str): The name of the cat to be fed.
        """
        for cat in self.cats:
            if cat.name == cat_name:
                cat.feed()
                print(f"{cat.name} has been fed.")

    def do_trick(self, cat_name, trick):
        """
        Makes a virtual cat perform a trick.

        Args:
            cat_name (str): The name of the cat to perform the trick.
            trick (str): The trick to be performed (sit, roll, or jump).
        """
        for cat in self.cats:
            if cat.name == cat_name:
                cat.perform_trick(trick)
                print(f"{cat.name} performed the {trick} trick.")

class Cat:
    """
    The Cat class represents a virtual cat in the CatCode program.

    Attributes:
        name (str): The name of the cat.
        position (tuple): The current position of the cat on the screen.
    """

    def __init__(self, name):
        self.name = name
        self.position = (0, 0)

    def move(self, direction):
        """
        Moves the cat in the specified direction.

        Args:
            direction (str): The direction to move the cat (up, down, left, or right).
        """
        if direction == "up":
            self.position = (self.position[0], self.position[1] + 1)
        elif direction == "down":
            self.position = (self.position[0], self.position[1] - 1)
        elif direction == "left":
            self.position = (self.position[0] - 1, self.position[1])
        elif direction == "right":
            self.position = (self.position[0] + 1, self.position[1])

    def feed(self):
        """
        Feeds the cat.
        """
        print(f"{self.name} is eating their favorite food.")

    def perform_trick(self, trick):
        """
        Makes the cat perform a trick.

        Args:
            trick (str): The trick to be performed (sit, roll, or jump).
        """
        if trick == "sit":
            print(f"{self.name} sits down gracefully.")
        elif trick == "roll":
            print(f"{self.name} rolls over on the floor.")
        elif trick == "jump":
            print(f"{self.name} jumps up high.")
