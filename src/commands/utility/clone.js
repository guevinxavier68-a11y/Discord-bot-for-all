const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clone')
    .setDescription('Clone a Discord server structure (roles + channels) into this server')
    .addStringOption((opt) =>
      opt.setName('server-id').setDescription('The ID of the server to clone').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const serverId = interaction.options.getString('server-id').trim();

    const source = client.guilds.cache.get(serverId);
    if (!source) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription('❌ Bot is not in that server, or the ID is invalid.')
            .setColor(0xed4245),
        ],
      });
    }

    const target = interaction.guild;
    let rolesCloned = 0;
    let channelsCloned = 0;

    try {
      await source.roles.fetch();
      const roles = source.roles.cache
        .filter((r) => !r.managed && r.name !== '@everyone')
        .sort((a, b) => a.position - b.position);

      for (const [, role] of roles) {
        await target.roles.create({
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          mentionable: role.mentionable,
          permissions: role.permissions,
        });
        rolesCloned++;
        await new Promise((r) => setTimeout(r, 300));
      }

      await source.channels.fetch();
      const categories = source.channels.cache
        .filter((c) => c.type === ChannelType.GuildCategory)
        .sort((a, b) => a.position - b.position);

      const categoryMap = new Map();

      for (const [, cat] of categories) {
        const newCat = await target.channels.create({
          name: cat.name,
          type: ChannelType.GuildCategory,
        });
        categoryMap.set(cat.id, newCat.id);
        channelsCloned++;
        await new Promise((r) => setTimeout(r, 300));
      }

      const textAndVoice = source.channels.cache
        .filter(
          (c) =>
            c.type === ChannelType.GuildText ||
            c.type === ChannelType.GuildVoice ||
            c.type === ChannelType.GuildAnnouncement
        )
        .sort((a, b) => a.position - b.position);

      for (const [, ch] of textAndVoice) {
        await target.channels.create({
          name: ch.name,
          type: ch.type,
          topic: ch.topic || undefined,
          parent: ch.parentId ? categoryMap.get(ch.parentId) || null : null,
          nsfw: ch.nsfw || false,
          bitrate: ch.bitrate || undefined,
          userLimit: ch.userLimit || undefined,
        });
        channelsCloned++;
        await new Promise((r) => setTimeout(r, 300));
      }

      const embed = new EmbedBuilder()
        .setTitle('✅ Server Clone Complete')
        .addFields(
          { name: 'Source Server', value: source.name, inline: true },
          { name: 'Roles Cloned', value: `${rolesCloned}`, inline: true },
          { name: 'Channels Cloned', value: `${channelsCloned}`, inline: true }
        )
        .setColor(0x57f287)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: 'An error occurred during cloning. Check bot permissions.',
      });
    }
  },
};
