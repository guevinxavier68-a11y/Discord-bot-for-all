const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close-ticket')
    .setDescription('Close the current ticket channel'),

  async execute(interaction) {
    await handleClose(interaction);
  },

  async handleButton(interaction) {
    await handleClose(interaction);
  },
};

async function handleClose(interaction) {
  const ticket = db
    .prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = ?')
    .get(interaction.channel.id, 'open');

  if (!ticket) {
    return interaction.reply({ content: 'This channel is not an open ticket.', ephemeral: true });
  }

  const isStaff = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
  const isOwner = ticket.user_id === interaction.user.id;

  if (!isStaff && !isOwner) {
    return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
  }

  db.prepare('UPDATE tickets SET status = ? WHERE channel_id = ?').run('closed', interaction.channel.id);

  const embed = new EmbedBuilder()
    .setTitle('🔒 Ticket Closed')
    .setDescription(`Ticket closed by ${interaction.user}. This channel will be deleted in 5 seconds.`)
    .setColor(0xed4245)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
  setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
}
