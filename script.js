document.getElementById('multiply-btn').addEventListener('click', () => {
    const n = parseInt(document.getElementById('n').value);
    let m = document.getElementById('m').value.replace(/[^01]/g, '');
    let q = document.getElementById('q').value.replace(/[^01]/g, '');
    const errorMessage = document.getElementById('error-message');
    const decimalResult = document.getElementById('decimal-result');
    const bcdResult = document.getElementById('bcd-result');

    errorMessage.textContent = '';
    decimalResult.textContent = '-';
    bcdResult.textContent = '-';

    if (!n || n < 1 || n > 32) {
        errorMessage.textContent = 'Number of bits must be between 1 and 32.';
        return;
    }
    if (m.length === 0 || q.length === 0) {
        errorMessage.textContent = 'Please enter valid binary numbers.';
        return;
    }
    if (m.length > n || q.length > n) {
        errorMessage.textContent = `Binary inputs must be at most ${n} bits.`;
        return;
    }

    m = padBinary(m, n);
    q = padBinary(q, n);

    const productBinary = boothMultiply(m, q, n);
    const decimal = binaryToDecimal(productBinary);
    const bcd = decimalToBCD(Math.abs(decimal));
    const sign = decimal < 0 ? '-' : '';

    decimalResult.textContent = decimal;
    bcdResult.textContent = decimal === 0 ? '0000' : sign + bcd;
});

function padBinary(binaryStr, n) {
    const signBit = binaryStr[0] === '1' ? '1' : '0';
    return signBit.repeat(n - binaryStr.length) + binaryStr;
}

function addBinary(binA, binB, n) {
    let carry = 0;
    let result = '';
    for (let i = n - 1; i >= 0; i--) {
        const bitA = binA[i] === '1' ? 1 : 0;
        const bitB = binB[i] === '1' ? 1 : 0;
        const sum = bitA + bitB + carry;
        result = (sum % 2) + result;
        carry = Math.floor(sum / 2);
    }
    return result;
}

function twosComplement(bin, n) {
    const inverted = bin.split('').map(bit => bit === '0' ? '1' : '0').join('');
    return addBinary(inverted, '0'.repeat(n - 1) + '1', n);
}

function subtractBinary(binA, binB, n) {
    return addBinary(binA, twosComplement(binB, n), n);
}

function boothMultiply(m, q, n) {
    let A = '0'.repeat(n);
    let Q = q;
    let Qm1 = '0';
    for (let i = 0; i < n; i++) {
        const bits = Q.slice(-1) + Qm1;
        if (bits === '01') {
            A = addBinary(A, m, n);
        } else if (bits === '10') {
            A = subtractBinary(A, m, n);
        }
        const oldA = A;
        const oldQ = Q;
        A = oldA[0] + oldA.slice(0, -1);
        Q = oldA.slice(-1) + oldQ.slice(0, -1);
        Qm1 = oldQ.slice(-1);
    }
    return A + Q;
}

function binaryToDecimal(binary) {
    if (binary[0] === '0') {
        return parseInt(binary, 2);
    }
    const n = binary.length;
    return parseInt(binary, 2) - Math.pow(2, n);
}

function decimalToBCD(decimal) {
    if (decimal === 0) return '0000';
    let bcd = '';
    while (decimal > 0) {
        const digit = decimal % 10;
        bcd = digit.toString(2).padStart(4, '0') + ' ' + bcd;
        decimal = Math.floor(decimal / 10);
    }
    return bcd.trim();
}