import { Events, ActivityType } from 'discord.js';
import { Event } from '../types/discord.js';

const event: Event<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    const c = client as import('discord.js').Client;
    console.log(`\n🤖 Bot online como ${c.user?.tag}!`);
    console.log(`📊 Servidores: ${c.guilds.cache.size}`);
    console.log(`👥 Usuários: ${c.users.cache.size}`);
    
    // Set activity
    c.user?.setActivity('!help | /help', { type: ActivityType.Listening });
    
    // Rotate activity every 30 seconds
    const activities = [
      { name: '!help | /help', type: ActivityType.Listening },
      { name: 'com waifus 💕', type: ActivityType.Playing },
      { name: `${c.guilds.cache.size} servidores`, type: ActivityType.Watching },
      { name: '!roll para personagens', type: ActivityType.Playing },
    ];

    let i = 0;
    setInterval(() => {
      c.user?.setActivity(activities[i].name, { type: activities[i].type });
      i = (i + 1) % activities.length;
    }, 30000);
  },
};

export default event;
