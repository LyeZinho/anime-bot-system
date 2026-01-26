import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
  ActivityType,
} from 'discord.js';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Command, PrefixCommand, ButtonHandler, Event } from '../types/discord.js';
import prisma from '../database/prisma.js';
import redis from '../database/redis.js';

// Get directory for ES modules
const getSrcDir = () => {
  // In development (ts-node/tsx), use process.cwd()
  // In production, use dist folder
  const base = process.cwd();
  const srcPath = join(base, 'src');
  const distPath = join(base, 'dist');
  
  if (existsSync(distPath)) return distPath;
  return srcPath;
};

export class DiscordBot {
  public client: Client;
  public commands: Collection<string, Command> = new Collection();
  public prefixCommands: Collection<string, PrefixCommand> = new Collection();
  public buttons: Collection<string, ButtonHandler> = new Collection();
  public cooldowns: Collection<string, Collection<string, number>> = new Collection();

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.User],
    });

    // Attach collections to client
    this.client.commands = this.commands;
    this.client.prefixCommands = this.prefixCommands;
    this.client.buttons = this.buttons;
    this.client.cooldowns = this.cooldowns;
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Iniciando bot...');

      // Connect to databases
      await this.connectDatabases();

      // Load handlers
      await this.loadCommands();
      await this.loadPrefixCommands();
      await this.loadButtons();
      await this.loadEvents();

      // Login
      await this.client.login(process.env.DISCORD_TOKEN);

      // Deploy commands
      await this.deployCommands();

      console.log('✅ Bot iniciado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao iniciar bot:', error);
      process.exit(1);
    }
  }

  private async connectDatabases(): Promise<void> {
    console.log('🔌 Conectando aos bancos de dados...');
    
    // Test Prisma connection
    await prisma.$connect();
    console.log('✅ PostgreSQL conectado!');

    // Connect Redis
    await redis.connect();
    console.log('✅ Redis conectado!');
  }

  private async loadCommands(): Promise<void> {
    const commandsPath = join(getSrcDir(), 'commands');
    
    try {
      if (!existsSync(commandsPath)) {
        console.warn('⚠️ Pasta de comandos não encontrada:', commandsPath);
        return;
      }

      const files = readdirSync(commandsPath).filter(
        file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
      );

      console.log(`📂 Carregando ${files.length} comandos...`);

      for (const file of files) {
        try {
          const filePath = join(commandsPath, file);
          const command = await import(filePath);
          const cmd = command.default as Command;

          if (cmd?.data?.name) {
            this.commands.set(cmd.data.name, cmd);
            console.log(`  📝 Comando carregado: /${cmd.data.name}`);
          }
        } catch (err) {
          console.error(`  ❌ Erro ao carregar ${file}:`, err instanceof Error ? err.message : err);
        }
      }

      console.log(`✅ ${this.commands.size} comandos slash carregados!`);
    } catch (error) {
      console.error('⚠️ Erro ao carregar comandos:', error instanceof Error ? error.message : error);
    }
  }

  private async loadPrefixCommands(): Promise<void> {
    const commandsPath = join(getSrcDir(), 'prefix');

    try {
      if (!existsSync(commandsPath)) {
        console.warn('⚠️ Pasta prefix não encontrada:', commandsPath);
        return;
      }

      const files = readdirSync(commandsPath).filter(
        file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
      );

      console.log(`📂 Carregando ${files.length} comandos prefix...`);

      for (const file of files) {
        try {
          const filePath = join(commandsPath, file);
          const command = await import(filePath);
          const cmd = command.default as PrefixCommand;

          if (cmd?.name) {
            this.prefixCommands.set(cmd.name, cmd);
            
            // Register aliases
            if (cmd.aliases) {
              for (const alias of cmd.aliases) {
                this.prefixCommands.set(alias, cmd);
              }
            }
            
            console.log(`  📝 Comando prefix carregado: !${cmd.name}`);
          }
        } catch (err) {
          console.error(`  ❌ Erro ao carregar ${file}:`, err instanceof Error ? err.message : err);
        }
      }

      console.log(`✅ ${this.prefixCommands.size} comandos prefix carregados!`);
    } catch (error) {
      console.error('⚠️ Erro ao carregar comandos prefix:', error instanceof Error ? error.message : error);
    }
  }

  private async loadButtons(): Promise<void> {
    const buttonsPath = join(getSrcDir(), 'buttons');

    try {
      if (!existsSync(buttonsPath)) {
        console.warn('⚠️ Pasta buttons não encontrada:', buttonsPath);
        return;
      }

      const files = readdirSync(buttonsPath).filter(
        file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
      );

      console.log(`📂 Carregando ${files.length} button handlers...`);

      for (const file of files) {
        try {
          const filePath = join(buttonsPath, file);
          const buttonModule = await import(filePath);
          
          // Support both single export and array export
          const handlers = Array.isArray(buttonModule.default) 
            ? buttonModule.default 
            : [buttonModule.default];

          for (const handler of handlers) {
            if (handler?.customId) {
              this.buttons.set(handler.customId, handler);
              console.log(`  🔘 Button handler carregado: ${handler.customId}`);
            }
          }
        } catch (err) {
          console.error(`  ❌ Erro ao carregar ${file}:`, err instanceof Error ? err.message : err);
        }
      }

      console.log(`✅ ${this.buttons.size} button handlers carregados!`);
    } catch (error) {
      console.error('⚠️ Erro ao carregar buttons:', error instanceof Error ? error.message : error);
    }
  }

  private async loadEvents(): Promise<void> {
    const eventsPath = join(getSrcDir(), 'events');
    
    try {
      if (!existsSync(eventsPath)) {
        console.warn('⚠️ Pasta events não encontrada:', eventsPath);
        return;
      }

      const files = readdirSync(eventsPath).filter(
        file => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
      );

      console.log(`📂 Carregando ${files.length} eventos...`);

      for (const file of files) {
        try {
          const filePath = join(eventsPath, file);
          const eventModule = await import(filePath);
          const event = eventModule.default as Event;

          if (event?.name) {
            if (event.once) {
              this.client.once(event.name, (...args) => event.execute(...args));
            } else {
              this.client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`  📡 Evento carregado: ${event.name}`);
          }
        } catch (err) {
          console.error(`  ❌ Erro ao carregar ${file}:`, err instanceof Error ? err.message : err);
        }
      }

      console.log('✅ Eventos carregados!');
    } catch (error) {
      console.error('⚠️ Erro ao carregar eventos:', error instanceof Error ? error.message : error);
    }
  }

  private async deployCommands(): Promise<void> {
    if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
      console.warn('⚠️ Token ou Client ID não configurados');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = this.commands.map(cmd => cmd.data.toJSON());

    try {
      console.log('🔄 Atualizando comandos slash...');

      if (process.env.DISCORD_GUILD_ID) {
        // Deploy to specific guild (faster for development)
        await rest.put(
          Routes.applicationGuildCommands(
            process.env.DISCORD_CLIENT_ID,
            process.env.DISCORD_GUILD_ID
          ),
          { body: commands }
        );
        console.log(`✅ ${commands.length} comandos registrados na guild!`);
      } else {
        // Deploy globally
        await rest.put(
          Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
          { body: commands }
        );
        console.log(`✅ ${commands.length} comandos registrados globalmente!`);
      }
    } catch (error) {
      console.error('❌ Erro ao registrar comandos:', error);
    }
  }

  setActivity(text: string, type: ActivityType = ActivityType.Playing): void {
    this.client.user?.setActivity(text, { type });
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Desligando bot...');
    
    await prisma.$disconnect();
    await redis.disconnect();
    
    this.client.destroy();
    console.log('👋 Bot desligado!');
  }
}

export const bot = new DiscordBot();
