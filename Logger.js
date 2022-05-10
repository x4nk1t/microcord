module.exports = {
    log: (message) => {
        const date = new Date()
        const timeStamp = ('0'+ date.getHours()).slice(-2) +':'+ ('0'+ date.getMinutes()).slice(-2) +':'+ ('0'+ date.getSeconds()).slice(-2)

        console.log(`${timeStamp} ${message}`);
    }
}