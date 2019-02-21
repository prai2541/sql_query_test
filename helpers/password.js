const md5 = require('md5')

function hash(password) {
    return md5("1d512341e15" + password + "4d514dw56d1q1651")
}

function generate() {
    let time = new Date().getTime()
    return hash(time)
}

module.exports = {
    hash, 
    generate,
}