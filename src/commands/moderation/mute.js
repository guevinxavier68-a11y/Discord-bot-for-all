const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member in the server')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user to mute').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for muting')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
    }

    const settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(interaction.guild.id);
    const mutedRoleId = settings?.muted_role_id;

    if (!mutedRoleId) {
      return interaction.reply({
        content: 'No muted role configured. Set one with `/auto-role` or contact an admin.',
        ephemeral: true,
      });
    }

    const mutedRole = interaction.guild.roles.cache.get(mutedRoleId);
    if (!mutedRole) {
      return interaction.reply({ content: 'Muted role not found.', ephemeral: true });
    }

    if (target.roles.cache.has(mutedRoleId)) {
      return interaction.reply({ content: 'This user is already muted.', ephemeral: true });
    }

    await target.roles.add(mutedRole, reason);

    const embed = new EmbedBuilder()
      .setTitle('🔇 Member Muted')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Reason', value: reason }
      )
      .setColor(0xfee75c)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
