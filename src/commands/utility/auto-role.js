const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auto-role')
    .setDescription('Configure server settings: auto-role, welcome, goodbye, muted role')
    .addSubcommand((sub) =>
      sub
        .setName('set-join-role')
        .setDescription('Set the role given to new members automatically')
        .addRoleOption((opt) => opt.setName('role').setDescription('The role to auto-assign').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('set-muted-role')
        .setDescription('Set the role used for muting members')
        .addRoleOption((opt) => opt.setName('role').setDescription('The muted role').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('set-welcome')
        .setDescription('Set the welcome channel and message')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Welcome channel').setRequired(true))
        .addStringOption((opt) =>
          opt.setName('message').setDescription('Message: use {user}, {server}, {count}')
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('set-goodbye')
        .setDescription('Set the goodbye channel and message')
        .addChannelOption((opt) => opt.setName('channel').setDescription('Goodbye channel').setRequired(true))
        .addStringOption((opt) =>
          opt.setName('message').setDescription('Message: use {user}, {server}, {count}')
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    const existing = db.prepare('SELECT guild_id FROM guild_settings WHERE guild_id = ?').get(guildId);
    if (!existing) {
      db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?)').run(guildId);
    }

    if (sub === 'set-join-role') {
      const role = interaction.options.getRole('role');
      db.prepare('UPDATE guild_settings SET auto_role_id = ? WHERE guild_id = ?').run(role.id, guildId);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Auto-role set to ${role}`)
            .setColor(0x57f287),
        ],
      });
    }

    if (sub === 'set-muted-role') {
      const role = interaction.options.getRole('role');
      db.prepare('UPDATE guild_settings SET muted_role_id = ? WHERE guild_id = ?').run(role.id, guildId);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Muted role set to ${role}`)
            .setColor(0x57f287),
        ],
      });
    }

    if (sub === 'set-welcome') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || 'Welcome {user} to {server}!';
      db.prepare('UPDATE guild_settings SET welcome_channel_id = ?, welcome_message = ? WHERE guild_id = ?').run(
        channel.id,
        message,
        guildId
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Welcome channel set to ${channel}\nMessage: \`${message}\``)
            .setColor(0x57f287),
        ],
      });
    }

    if (sub === 'set-goodbye') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message') || 'Goodbye {user}, we will miss you!';
      db.prepare('UPDATE guild_settings SET goodbye_channel_id = ?, goodbye_message = ? WHERE guild_id = ?').run(
        channel.id,
        message,
        guildId
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`✅ Goodbye channel set to ${channel}\nMessage: \`${message}\``)
            .setColor(0x57f287),
        ],
      });
    }
  },
};
