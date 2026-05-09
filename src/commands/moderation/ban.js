const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for banning')
    )
    .addIntegerOption((opt) =>
      opt
        .setName('delete-days')
        .setDescription('Days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete-days') ?? 0;

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'You cannot ban yourself.', ephemeral: true });
    }

    try {
      await interaction.guild.members.ban(target, {
        reason,
        deleteMessageDays: deleteDays,
      });

      const embed = new EmbedBuilder()
        .setTitle('🔨 Member Banned')
        .addFields(
          { name: 'User', value: `${target.tag}`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason }
        )
        .setColor(0xed4245)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: 'Failed to ban the user. Check my permissions.', ephemeral: true });
    }
  },
};
