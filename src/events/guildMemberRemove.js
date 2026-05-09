const db = require('../database/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const settings = db
      .prepare('SELECT * FROM guild_settings WHERE guild_id = ?')
      .get(member.guild.id);

    if (!settings?.goodbye_channel_id) return;

    const channel = member.guild.channels.cache.get(settings.goodbye_channel_id);
    if (!channel) return;

    const msg = (settings.goodbye_message || 'Goodbye {user}, we will miss you!')
      .replace('{user}', member.user.username)
      .replace('{server}', member.guild.name)
      .replace('{count}', member.guild.memberCount);

    const embed = new EmbedBuilder()
      .setTitle('Goodbye!')
      .setDescription(msg)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(0xed4245)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
