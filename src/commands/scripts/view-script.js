const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-script')
    .setDescription('Preview the content of an available script')
    .addStringOption((opt) =>
      opt.setName('name').setDescription('The script name to preview').setRequired(true)
    ),

  async execute(interaction) {
    const name = interaction.options.getString('name').trim();
    const row = db
      .prepare('SELECT * FROM keys WHERE script_name = ? AND redeemed = 0 LIMIT 1')
      .get(name);

    if (!row) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`❌ No available script found named **${name}**.`)
            .setColor(0xed4245),
        ],
        ephemeral: true,
      });
    }

    const preview =
      row.script_content.length > 500
        ? row.script_content.slice(0, 500) + '\n...(redeem key to see full script)'
        : row.script_content;

    const embed = new EmbedBuilder()
      .setTitle(`📜 Script: ${row.script_name}`)
      .setDescription(`\`\`\`\n${preview}\n\`\`\``)
      .setColor(0x5865f2)
      .setFooter({ text: 'Use /redeem-key to unlock the full script' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
