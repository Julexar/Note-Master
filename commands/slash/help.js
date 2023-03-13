const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "help",
  description: "Displays an Info Post.",

  run: async (client, interaction) => {
    const user = interaction.user;
    const help = new EmbedBuilder()
     .setColor('#00ffff')
     .setAuthor({name: user.username, iconURL: user.avatarURL()})
     .setTitle("Command Help")
     .setDescription("Here is a list of all available Commands and their usage:\n\n\`/notes view\` - Pulls up your notes\n> \`tinum:Insert text\` - pulls up a specific Note based on the Title or Numer (Number has to be written with a # in front - do not include Number in Title)\n> \`private:True/False\` - Sets whether only you can see the Notes or everyone. (Default: false)\n\n\`/notes add content:Insert text\` - Adds a Note.\n\`title:Insert text\` - Sets the title of the Note (if blank, the Note will be displayed with its Number instead)\n\n\`/notes remove tinum:Insert text\` - Removes a specific Note (based on Title or Number)\n\n\`/notes edit tinum:Insert text\` - Edits a specific Note.\n> \`content:Insert text\` - Changes the content\n> \`title:Insert text\` - Changes the Title\n\n\n\n\`/help - Displays this Message\`")
 .setTimestamp();
    await interaction.reply({embeds: [help]});
  },
};