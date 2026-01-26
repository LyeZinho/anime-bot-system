import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { UserService } from '../services/UserService.js';
import { COLORS, WORK_OPTIONS } from '../config/constants.js';
import prisma from '../lib/prisma.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabalha para ganhar moedas')
    .addStringOption(option =>
      option
        .setName('tipo')
        .setDescription('Tipo de trabalho')
        .setRequired(false)
        .addChoices(
          { name: '🎮 Stream - 50-150 moedas (30min)', value: 'stream' },
          { name: '📝 Freelance - 80-200 moedas (1h)', value: 'freelance' },
          { name: '🏢 Escritório - 150-350 moedas (2h)', value: 'office' },
          { name: '💼 Empresa - 300-600 moedas (4h)', value: 'business' },
          { name: '🎯 Missão - 500-1000 moedas (8h)', value: 'mission' }
        )
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const workType = interaction.options.getString('tipo');
    const userService = new UserService();

    // Se não especificou tipo, mostra menu
    if (!workType) {
      const user = await userService.getUser(interaction.user.id);
      
      if (!user) {
        await userService.findOrCreate(interaction.user.id, interaction.user.username);
      }
      
      const now = new Date();

      const workList = Object.entries(WORK_OPTIONS).map(([key, work]) => {
        const lastWork = user?.lastWork;
        const cooldownMs = work.cooldownMinutes * 60 * 1000;
        const canWork = !lastWork || (now.getTime() - lastWork.getTime() >= cooldownMs);
        const status = canWork ? '✅' : `⏳ ${Math.ceil((cooldownMs - (now.getTime() - (lastWork?.getTime() || 0))) / 60000)}min`;
        
        return `${work.emoji} **${work.name}** - ${work.minReward}-${work.maxReward} moedas (${work.cooldownMinutes >= 60 ? `${work.cooldownMinutes / 60}h` : `${work.cooldownMinutes}min`}) ${status}`;
      });

      const embed = new EmbedBuilder()
        .setTitle('💼 Trabalhos Disponíveis')
        .setDescription([
          'Use `/work tipo:<tipo>` para trabalhar!',
          '',
          ...workList,
        ].join('\n'))
        .setColor(COLORS.primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        Object.entries(WORK_OPTIONS).slice(0, 5).map(([key, work]) =>
          new ButtonBuilder()
            .setCustomId(`work:${key}`)
            .setEmoji(work.emoji)
            .setLabel(work.name)
            .setStyle(ButtonStyle.Secondary)
        )
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    // Executa trabalho
    const work = WORK_OPTIONS[workType];
    if (!work) {
      await interaction.reply({
        content: '❌ Tipo de trabalho inválido!',
        ephemeral: true,
      });
      return;
    }

    // Verifica cooldown
    const user = await userService.findOrCreate(interaction.user.id, interaction.user.username);
    const now = new Date();
    const cooldownMs = work.cooldownMinutes * 60 * 1000;
    
    if (user.lastWork && (now.getTime() - user.lastWork.getTime() < cooldownMs)) {
      const remaining = Math.ceil((cooldownMs - (now.getTime() - user.lastWork.getTime())) / 60000);
      await interaction.reply({
        content: `⏳ Você ainda está cansado! Descanse por mais **${remaining} minutos**.`,
        ephemeral: true,
      });
      return;
    }

    // Calcula recompensa
    const reward = Math.floor(
      Math.random() * (work.maxReward - work.minReward + 1) + work.minReward
    );

    // Atualiza usuário
    await prisma.user.update({
      where: { id: interaction.user.id },
      data: {
        coins: { increment: reward },
        lastWork: now,
      },
    });

    const messages = [
      `Você trabalhou como ${work.name.toLowerCase()} e ganhou **${reward.toLocaleString()}** moedas!`,
      `Após muito esforço como ${work.name.toLowerCase()}, você recebeu **${reward.toLocaleString()}** moedas!`,
      `Seu trabalho como ${work.name.toLowerCase()} rendeu **${reward.toLocaleString()}** moedas!`,
    ];

    const embed = new EmbedBuilder()
      .setTitle(`${work.emoji} Trabalho Concluído!`)
      .setDescription(messages[Math.floor(Math.random() * messages.length)])
      .setColor(COLORS.success)
      .setFooter({ text: `Próximo trabalho disponível em ${work.cooldownMinutes >= 60 ? `${work.cooldownMinutes / 60}h` : `${work.cooldownMinutes}min`}` });

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
