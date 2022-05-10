const { Server } = require('socket.io');
const { Client } = require('cloudstorm');
const { SnowTransfer } = require('snowtransfer');

var restClient = null;
const config = require('../config.json');
const prefix = config.prefix;

const io = new Server(3000);
const Logger = require('../Logger.js');

const snowClient = new SnowTransfer(config.token);

io.on("connection", (socket) => {
    if(restClient == null){
        restClient = socket;

        socket.emit('connected');
        Logger.log('REST Client connected with id: '+ socket.id);
    } else {
        socket.emit('anotherInstance');
        socket.disconnect();
    }

    socket.on("disconnect", () => {
        restClient = null;
        Logger.log('REST Client disconnected! Waiting for new connection!');
    })
})

const client = new Client(config.token, { intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']});
client.connect()

client.on('ready', () => {
    Logger.log('Bot ready!')
})

client.on('event', (event) => {
    filterEvents(event);
})

const filterEvents = (packet) => {
    switch(packet.t){
        case 'MESSAGE_CREATE':
            if(packet.d.author.bot) return;

            const data = packet.d;
            const content = data.content;

            if(restClient != null){
                restClient.emit('messageCreate', packet.d);

                if(content.startsWith(prefix)){
                    restClient.emit('commandReceived', packet.d);
                }
            } else {
                Logger.log('Received message! Rest Client not online to respond.');

                if(content.startsWith(prefix)){
                    snowClient.channel.createMessage(data.channel_id, 'Rest Client is currently offline. Your request cannot be processed! Please try again later.');
                }
            }
        break;
    }
}