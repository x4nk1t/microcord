const { io } = require('socket.io-client');
const { SnowTransfer } = require('snowtransfer');

const config = require('../config.json');
const prefix = config.prefix;

const socket = io('ws://127.0.0.1:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 5000
});
const Logger = require('../Logger.js');

const snowClient = new SnowTransfer(config.token);

socket.on('connected', () => {
    Logger.log('Successfully connected to the gateway!');
})

socket.on('commandReceived', async data => {
    const content = data.content;
    const channel_id = data.channel_id;
    const command = content.toLowerCase().replace(prefix, '');

    if(command == "ping"){
        const sentMessage = snowClient.channel.createMessage(channel_id, 'Pong!');

        sentMessage.then(message => {
            const receivedTimestamp = new Date(data.timestamp).getTime();
            const sentTimestamp = new Date(message.timestamp).getTime();

            const ping = Math.round(sentTimestamp - receivedTimestamp);

            snowClient.channel.editMessage(channel_id, message.id, `${ping}ms`);
        })
    }
})

socket.on('anotherInstance', () => {
    Logger.log('Another instance is already connected to the gateway!');
})

socket.on('connect_error', err => {
    Logger.log('Failed to connect to the gateway. Make sure the gateway is online!');
})