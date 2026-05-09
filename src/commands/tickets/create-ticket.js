const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-ticket')
    .setDescription('Create a support ticket'),

  async execute(interaction) {
    await handleCreate(interaction);
  },

  async handleButton(interaction) {
    await handleCreate(interaction);
  },
};

async function handleCreate(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;

  const existing = db
    .prepare('SELECT * FROM tickets WHERE user_id = ? AND guild_id = ? AND status = ?')
    .get(user.id, guild.id, 'open');

  if (existing) {
    const ch = guild.channels.cache.get(existing.channel_id);
    return interaction.reply({
      content: `You already have an open ticket: ${ch ? ch.toString() : '#deleted-channel'}`,
      ephemeral: true,
    });
  }

  const settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guild.id);

  const ticketChannel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    parent: settings?.ticket_category_id || null,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ],
  });

  db.prepare('INSERT INTO tickets (channel_id, guild_id, user_id) VALUES (?, ?, ?)').run(
    ticketChannel.id,
    guild.id,
    user.id
  );

  const embed = new EmbedBuilder()
    .setTitle('🎫 Ticket Opened')
    .setDescription(`Hello ${user}, support will be with you shortly.\n\nClick **Close Ticket** when your issue is resolved.`)
    .setColor(0x57f287)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒')
  );

  await ticketChannel.send({ content: `${user}`, embeds: [embed], components: [row] });
  await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
}
