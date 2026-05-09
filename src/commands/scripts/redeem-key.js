const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem-key')
    .setDescription('Redeem a script key to access a script')
    .addStringOption((opt) =>
      opt.setName('key').setDescription('The key to redeem').setRequired(true)
    ),

  async execute(interaction) {
    const key = interaction.options.getString('key').trim();
    const row = db.prepare('SELECT * FROM keys WHERE key = ?').get(key);

    if (!row) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription('❌ Invalid key.').setColor(0xed4245)],
        ephemeral: true,
      });
    }

    if (row.redeemed) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('❌ This key has already been redeemed.')
            .setColor(0xed4245),
        ],
        ephemeral: true,
      });
    }

    db.prepare('UPDATE keys SET redeemed = 1, redeemed_by = ? WHERE key = ?').run(
      interaction.user.id,
      key
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ Key Redeemed!')
      .setDescription(
        `**Script:** ${row.script_name}\n\n` +
          `\`\`\`\n${row.script_content}\n\`\`\``
      )
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
