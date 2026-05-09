const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Send a message 5 times in the current channel')
    .addStringOption((opt) =>
      opt.setName('message').setDescription('The message to send x5').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const message = interaction.options.getString('message');

    await interaction.reply({ content: '📢 Sending...', ephemeral: true });

    for (let i = 0; i < 5; i++) {
      await interaction.channel.send(message);
      await new Promise((r) => setTimeout(r, 700));
    }
  },
};
