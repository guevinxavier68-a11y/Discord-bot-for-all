const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-key')
    .setDescription('Delete a script key (owner only)')
    .addStringOption((opt) =>
      opt.setName('key').setDescription('The key to delete').setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('❌ Only the bot owner can use this command.')
            .setColor(0xed4245),
        ],
        ephemeral: true,
      });
    }

    const key = interaction.options.getString('key').trim();
    const row = db.prepare('SELECT * FROM keys WHERE key = ?').get(key);

    if (!row) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription('❌ Key not found.').setColor(0xed4245)],
        ephemeral: true,
      });
    }

    db.prepare('DELETE FROM keys WHERE key = ?').run(key);

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Key Deleted')
      .setDescription(`Key for **${row.script_name}** has been deleted.`)
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
