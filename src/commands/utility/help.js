const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Command List')
      .setColor(0x5865f2)
      .setTimestamp()
      .addFields(
        {
          name: '🎫 Tickets',
          value: [
            '`/ticket-panel` — Send a ticket panel to this channel',
            '`/create-ticket` — Open a new support ticket',
            '`/close-ticket` — Close the current ticket',
          ].join('\n'),
        },
        {
          name: '📜 Scripts',
          value: [
            '`/script-panel` — Show available scripts',
            '`/redeem-key <key>` — Redeem a key to unlock a script',
            '`/view-script <name>` — Preview a script',
            '`/create-key` — Create a script key *(owner only)*',
            '`/delete-key <key>` — Delete a key *(owner only)*',
          ].join('\n'),
        },
        {
          name: '🔨 Moderation',
          value: [
            '`/ban <user> [reason]` — Ban a member',
            '`/unban <user-id>` — Unban a user',
            '`/mute <user> [reason]` — Mute a member',
            '`/unmute <user>` — Unmute a member',
          ].join('\n'),
        },
        {
          name: '⚙️ Utility',
          value: [
            '`/auto-role set-join-role` — Auto-assign role on join',
            '`/auto-role set-muted-role` — Set the muted role',
            '`/auto-role set-welcome` — Configure welcome messages',
            '`/auto-role set-goodbye` — Configure goodbye messages',
            '`/spam <message>` — Send a message 5 times',
            '`/clone <server-id>` — Clone a server structure *(admin)*',
            '`/help` — Show this menu',
          ].join('\n'),
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  },
};
