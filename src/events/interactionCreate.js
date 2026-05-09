const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        const embed = new EmbedBuilder()
          .setDescription('There was an error executing this command.')
          .setColor(0xed4245);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') {
        const createTicket = require('../commands/tickets/create-ticket');
        await createTicket.handleButton(interaction);
      } else if (interaction.customId === 'close_ticket') {
        const closeTicket = require('../commands/tickets/close-ticket');
        await closeTicket.handleButton(interaction);
      }
    }
  },
};
