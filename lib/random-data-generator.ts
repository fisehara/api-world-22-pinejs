
export function randomString(stringlen: number) {

    let string = '';
    for (let i = 0; i < stringlen; i++) {
        string += String.fromCharCode(Math.floor(0x41 + Math.random() * (0x5a - 0x41)))
    }
    return string
}