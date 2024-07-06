// Base32 encoding/decoding functions

const base32 = {
    encode: function (input) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=';
        let output = '';
        let buffer = 0;
        let bitsLeft = 0;

        for (let i = 0; i < input.length; i++) {
            buffer = (buffer << 8) | input[i];
            bitsLeft += 8;

            while (bitsLeft >= 5) {
                const index = (buffer >> (bitsLeft - 5)) & 31;
                output += alphabet[index];
                bitsLeft -= 5;
            }
        }

        if (bitsLeft > 0) {
            const index = (buffer << (5 - bitsLeft)) & 31;
            output += alphabet[index];
        }

        while (output.length % 8 !== 0) {
            output += '=';
        }

        return output;
    },

    decode: function (input) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let buffer = 0;
        let bitsLeft = 0;
        const output = [];

        input = input.replace(/=+$/, '');

        for (let i = 0; i < input.length; i++) {
            const value = alphabet.indexOf(input[i]);
            if (value === -1) {
                throw new Error('Invalid Base32 character');
            }

            buffer = (buffer << 5) | value;
            bitsLeft += 5;

            if (bitsLeft >= 8) {
                output.push((buffer >> (bitsLeft - 8)) & 255);
                bitsLeft -= 8;
            }
        }

        return new Uint8Array(output);
    }
};
