const db = require('../database/db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const settings = db
      .prepare('SELECT * FROM guild_settings WHERE guild_id = ?')
      .get(member.guild.id);

    if (settings?.auto_role_id) {
      const role = member.guild.roles.cache.get(settings.auto_role_id);
      if (role) await member.roles.add(role).catch(() => null);
    }

    if (settings?.welcome_channel_id) {
      const channel = member.guild.channels.cache.get(settings.welcome_channel_id);
      if (!channel) return;

      const msg = (settings.welcome_message || 'Welcome {user} to {server}!')
        .replace('{user}', `<@${member.id}>`)
        .replace('{server}', member.guild.name)
        .replace('{username}', member.user.username)
        .replace('{count}', member.guild.memberCount);

      const embed = new EmbedBuilder()
        .setTitle('Welcome!')
        .setDescription(msg)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor(0x57f287)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }
  },
};
