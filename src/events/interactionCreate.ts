import { Events, Interaction, MessageFlags, Collection } from 'discord.js';
import { Event, Command, ButtonHandler } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';

const event: Event<typeof Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    const client = interaction.client;

    // Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.warn(`⚠️ Comando não encontrado: ${interaction.commandName}`);
        return;
      }

      // Check cooldown
      if (command.cooldown) {
        const cooldowns = client.cooldowns;
        
        if (!cooldowns.has(command.data.name)) {
          cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name)!;
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

          if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 500);
            return interaction.reply({
              content: `⏳ Por favor, aguarde <t:${expiredTimestamp}:R> antes de usar \`/${command.data.name}\` novamente.`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ Erro no comando ${interaction.commandName}:`, error);

        const errorMessage = '❌ Ocorreu um erro ao executar este comando.';
        
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
          }
        } catch (replyError) {
          console.error('❌ Falha ao enviar mensagem de erro:', replyError);
        }
      }
      return;
    }

    // Handle Autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);

      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(`❌ Erro no autocomplete ${interaction.commandName}:`, error);
      }
      return;
    }

    // Handle Button Interactions
    if (interaction.isButton()) {
      // Find matching handler by prefix
      for (const [prefix, handler] of client.buttons) {
        if (interaction.customId.startsWith(prefix)) {
          const args = interaction.customId.slice(prefix.length).split('_').filter(Boolean);

          try {
            await handler.execute(interaction, args);
          } catch (error) {
            console.error(`❌ Erro no button ${prefix}:`, error);
            
            try {
              const errMsg = '❌ Ocorreu um erro ao processar esta ação.';
              if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: errMsg, flags: MessageFlags.Ephemeral });
              } else {
                await interaction.followUp({ content: errMsg, flags: MessageFlags.Ephemeral });
              }
            } catch (replyError) {
              console.error('❌ Falha ao notificar erro do button:', replyError);
            }
          }
          return;
        }
      }
    }

    // Handle Select Menu Interactions
    if (interaction.isStringSelectMenu()) {
      try {
        const customId = interaction.customId || '';
        // character selection flow
        if (customId.startsWith('character_select:')) {
          const parts = customId.split(':');
          const ownerId = parts[1];
          if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: '❌ Apenas quem iniciou a busca pode selecionar uma opção.', flags: MessageFlags.Ephemeral });
          }

          const selected = interaction.values[0];
          if (!selected) {
            return interaction.reply({ content: '❌ Nenhuma opção selecionada.', flags: MessageFlags.Ephemeral });
          }

          // option value format: "<apiId>::<index>" — extract apiId
          const apiId = selected.includes('::') ? selected.split('::')[0] : selected;

          const characterService = new CharacterService();
          const apiChar = await characterService.getApiCharacterById(apiId);
          if (!apiChar) {
            return interaction.update({ content: '❌ Não foi possível obter os detalhes do personagem selecionado.', components: [] });
          }

          const dbChar = await characterService.findOrCreateCharacter(apiChar);

          // Build embed
          const prisma = (await import('../lib/prisma.js')).default as any;
          const stats = await prisma.userCharacter.aggregate({ where: { characterId: dbChar.id }, _count: true });
          const constants = await import('../config/constants.js');
          const { RARITY_EMOJIS, RARITY_COLORS, COLORS } = constants as any;
          const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

          const rarityKey = (dbChar.rarity || '').toUpperCase() as keyof typeof RARITY_COLORS;

          const embed = new EmbedBuilder()
            .setTitle(`${(RARITY_EMOJIS as any)[rarityKey] || '⚪'} ${dbChar.name}`)
            .setDescription([
              `**Obra:** ${dbChar.workName || apiChar.workTitle}`,
              `**Raridade:** ${dbChar.rarity}`,
              '',
              `📊 **Estatísticas:**`,
              `• Total coletados: ${stats._count}`,
            ].join('\n'))
            .setColor((RARITY_COLORS as any)[rarityKey] || (COLORS as any).primary)
            .setImage(dbChar.imageUrl || apiChar.image || '');

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`wishlist:add:${dbChar.id}`)
              .setLabel('Adicionar à Wishlist')
              .setEmoji('❤️')
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.update({ embeds: [embed], components: [row as any], content: '' });
          return;
        }
      } catch (error) {
        console.error('❌ Erro no select menu handler:', error);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Erro ao processar seleção.', flags: MessageFlags.Ephemeral });
          } else {
            await interaction.followUp({ content: '❌ Erro ao processar seleção.', flags: MessageFlags.Ephemeral });
          }
        } catch (e) {
          console.error('❌ Falha ao notificar erro no select handler:', e);
        }
      }
    }

    // Handle Modal Submissions
    if (interaction.isModalSubmit()) {
      // Can be extended for modal handlers
    }
  },
};

export default event;
