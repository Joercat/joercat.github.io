    const alphabet = {
       a:"अ", b:"Ж", c:"日", d:"λ", e:"م", f:"ה", g:"ष", h:"요", i:"ศ", j:"ब", k:"Я", l:"ע", m:"α", n:"ข", o:"ع", p:"ᄀ", q:"ব", r:"ζ", s:"ז", t:"ش", u:"प", v:"几", w:"Ⴀ", x:"ফ", y:"ね", z:"∞", " ": "  "
    };

    function convertText() {
        let input = document.getElementById("englishInput").value.toLowerCase();
        let output = "";
        for (let i = 0; i < input.length; i++) {
            output += alphabet[input[i]] || input[i];
        }
        document.getElementById("outputText").innerText = output;
    }