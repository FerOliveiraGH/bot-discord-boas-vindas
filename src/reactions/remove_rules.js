require('dotenv').config();

const channelId = process.env.CHANNELID_RULES ?? 1234567891234567891;
const roleName = process.env.ROLENAME ?? 'Membro';

module.exports = {
    data: {
        name: 'remove_rules'
    },
    async execute(reaction, user) {
        if (reaction.message.channelId != channelId) return;
        if (reaction.partial) {
            if(reaction.emoji.name === "✅")
            {
                const member = await reaction.message.guild.members.fetch(user.id);

                const role = reaction.message.guild.roles.cache.find(role => role.name === roleName);

                if (role) {
                    await member.roles.remove(role);
                    console.log(`Cargo '${roleName}' removido de ${user.username}`);
                }
            }
        }
    }
}