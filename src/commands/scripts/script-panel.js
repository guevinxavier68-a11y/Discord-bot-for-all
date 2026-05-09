const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('script-panel')
    .setDescription('Show all available scripts and how to redeem them')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const scripts = db
      .prepare('SELECT DISTINCT script_name FROM keys WHERE redeemed = 0')
      .all();

    const embed = new EmbedBuilder()
      .setTitle('📜 Script Panel')
      .setColor(0x5865f2)
      .setTimestamp();

    if (scripts.length === 0) {
      embed.setDescription('No scripts are currently available.\nAsk an admin to create keys using `/create-key`.');
    } else {
      embed.setDescription(
        scripts.map((s) => `• **${s.script_name}**`).join('\n') +
          '\n\nUse `/redeem-key <key>` to redeem a script key.\nUse `/view-script <name>` to preview a script.'
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
