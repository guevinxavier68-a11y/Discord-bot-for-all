const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const crypto = require('crypto');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-key')
    .setDescription('Create a script key (owner only)')
    .addStringOption((opt) =>
      opt.setName('script-name').setDescription('Name of the script').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('script-content').setDescription('The script content').setRequired(true)
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

    const scriptName = interaction.options.getString('script-name').trim();
    const scriptContent = interaction.options.getString('script-content').trim();
    const key = crypto.randomBytes(12).toString('hex').toUpperCase();

    db.prepare('INSERT INTO keys (key, script_name, script_content) VALUES (?, ?, ?)').run(
      key,
      scriptName,
      scriptContent
    );

    const embed = new EmbedBuilder()
      .setTitle('🔑 Key Created')
      .addFields(
        { name: 'Script Name', value: scriptName },
        { name: 'Key', value: `\`${key}\`` }
      )
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
