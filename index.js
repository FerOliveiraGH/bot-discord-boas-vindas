const { Client, Events, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('node:fs')
const path = require('node:path')

require('dotenv').config()

const token = process.env.DISCORD_TOKEN ?? 'ABcd123ABcd123ABcd123ABcd123ABcd123.ABcd123.ABcd123ABcd123-ABcd123-ABcd123';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

client.functions = new Collection()
client.reactions = new Collection()

const reactionsPath = path.join(__dirname, 'src/reactions')
const reactionsFile = fs.readdirSync(reactionsPath).filter(file => file.endsWith('.js'))

reactionsFile.forEach(file => {
    const filePath = path.join(reactionsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
        client.reactions.set(command.data.name, command)
    } else {
        console.log(`Esse reacão não pode ser carregado!: ${file}`)
    }
})

const functionsPath = path.join(__dirname, 'src/functions')
const actionFile = fs.readdirSync(functionsPath).filter(file => file.endsWith('.js'))

actionFile.forEach(file => {
    const filePath = path.join(functionsPath, file)
    const action = require(filePath)
    if ('data' in action && 'execute' in action) {
        client.functions.set(action.data.name, action)
    } else {
        console.log(`Essa ação não pode ser carregada: ${file}`)
    }
})

client.once(Events.ClientReady, async c => {
    console.log('Bot Start')
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        await reaction.client.reactions.get('accept_rules').execute(reaction, user)
    } catch (err) {
        console.log(`Error: ${err}`)
    }
})

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    try {
        await reaction.client.reactions.get('remove_rules').execute(reaction, user)
    } catch (err) {
        console.log(`Error: ${err}`)
    }
})

client.on(Events.GuildMemberAdd, async (member) => {
    try {
        member.client.functions.forEach( async file => {
            if (!file) {
                return console.log('Ação não encontrada!')
            }

            await file.execute(member);
        })
    } catch (err) {
        console.log(`Error: ${err}`)
    }
});

client.login(token)