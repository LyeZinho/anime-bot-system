import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ChatInputCommandInteraction,
  ButtonInteraction,
  Collection,
  AutocompleteInteraction,
} from 'discord.js';

// Command interface
export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void | any>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  cooldown?: number; // seconds
}

// Button handler interface
export interface ButtonHandler {
  customId: string; // Prefix to match (e.g., "claim", "battle")
  execute: (interaction: ButtonInteraction, args?: string[]) => Promise<void>;
}

// Event interface
export interface Event<T extends string = string> {
  name: T;
  once?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => Promise<any> | any;
}

// Prefix command interface
export interface PrefixCommand {
  name: string;
  aliases?: string[];
  description: string;
  execute: (message: import('discord.js').Message, args: string[]) => Promise<void>;
  cooldown?: number;
}

// Extend discord.js Client
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
    prefixCommands: Collection<string, PrefixCommand>;
    buttons: Collection<string, ButtonHandler>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
