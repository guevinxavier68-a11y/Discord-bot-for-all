const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a muted member')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user to unmute').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');

    if (!target) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    const settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(interaction.guild.id);
    const mutedRoleId = settings?.muted_role_id;

    if (!mutedRoleId) {
      return interaction.reply({ content: 'No muted role configured.', ephemeral: true });
    }

    if (!target.roles.cache.has(mutedRoleId)) {
      return interaction.reply({ content: 'This user is not muted.', ephemeral: true });
    }

    const mutedRole = interaction.guild.roles.cache.get(mutedRoleId);
    await target.roles.remove(mutedRole);

    const embed = new EmbedBuilder()
      .setTitle('🔊 Member Unmuted')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true }
      )
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
