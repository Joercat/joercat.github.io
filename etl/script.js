    const alphabet = {
       a:"𐌰", b:"𐌱", c:"𐌲", d:"𐌳", e:"𐌴", f:"𐌵", g:"𐌶", h:"𐌷", i:"𐌸", j:"𐌹", k:"𐌺", l:"𐌻", m:"𐌼", n:"𐌽", o:"𐌾", p:"𐌿", q:"𐍀", r:"𐍁", s:"𐍂", t:"𐍃", u:"𐍄", v:"𐍅", w:"𐍆", x:"𐍇", y:"𐍈", z:"𐍉", " ": "  "
    };

    function convertText() {
        let input = document.getElementById("englishInput").value.toLowerCase();
        let output = "";
        for (let i = 0; i < input.length; i++) {
            output += alphabet[input[i]] || input[i];
        }
        document.getElementById("outputText").innerText = output;
    }
