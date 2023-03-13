const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "notes",
  description: "Lets you view/edit/add/remove notes.",
  options: [
    {
      name: "view",
      description: "Pulls up your Notes.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "tinum",
          description: "Provide the Title or Number of a Note.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "private",
          description: "Set whether only you can see the notes or everyone.",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "edit",
      description: "Edits a Note.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "tinum",
          description: "Provide the Title or Number of the Note",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "title",
          description: "Provide a new Title for the Note",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "content",
          description: "Provide the new Content of the Note",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "private",
          description: "Edit the Notes Visibility",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "add",
      description: "Adds a Note.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "content",
          description: "Provide the Content for the Note",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "title",
          description: "Provide the Title for the Note",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "remove",
      description: "Removes a Note",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "tinum",
          description: "Provide the Title or Number of the Note",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],

  run: async (client, interaction) => {
    const option = interaction.options;
    const user = interaction.user;
    const file = JSON.parse(fs.readFileSync("./database/notes.json"));
    const players = file.players;
    const player = players.find(p => p.id == user.id);
    if (!player) {
      players.push({
        name: user.tag,
        id: `${user.id}`,
        notes: []
      });
      file.players = players;
      fs.writeFileSync("./database/notes.json", JSON.stringify(file, null, "\t"));
      await interaction.reply({ content: `You have been registered!\n\nYou can add a note by using:\n\`/notes add content:TEXT\`\n\nYou can view notes through:\n\`/notes view (tinum:NoteTitle/Number)\`\n() = optional\n\nYou can remove notes by using:\n\`/notes remove number:NoteNumber\`\n\nYou can edit a Note by using:\n\`/notes edit tinum:NoteTitle/Number (content:New Text) (title:New Title)\``, ephemeral: true });
    } else if (player) {
      const notes = player.notes;
      const Embeds = [];
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prevnote')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏪')
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('nextnote')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏩')
            .setDisabled(false),
        );
      switch (option.getSubcommand()) {
        case "view":
          let priv;
          if (!option.getBoolean("private")) {
            priv=false;
          } else if (option.getBoolean("private")) {
            priv=option.getBoolean("private");
          }
          if (!option.getString("tinum")) {
            if (notes.length == 0) {
              Embeds.push(
                new EmbedBuilder()
                  .setColor('#ffdf00')
                  .setAuthor({ name: user.username, iconURL: user.avatarURL() })
                  .setTitle(`Player Notes`)
                  .setTimestamp()
              );
              Embeds[0].setDescription("_No Notes yet..._\n\nYou can add a Note by using:\n\`/notes add content:Text\`");
              await interaction.reply({ embeds: [Embeds[0]], ephemeral: priv });
            } else if (notes.length >= 1) {
              let count = 0;
              let num = 0;
              Embeds.push(
                new EmbedBuilder()
                  .setColor('#ffdf00')
                  .setAuthor({ name: user.username, iconURL: user.avatarURL() })
                  .setTitle("Player Notes")
                  .setTimestamp()
              );
              for (let i = 0; i < notes.length; i++) {
                let note = notes[i];
                if (count == 5) {
                  Embeds.push(
                    new EmbedBuilder()
                      .setColor('#ffdf00')
                      .setAuthor({ name: user.username, iconURL: user.avatarURL() })
                      .setTitle("Player Notes")
                      .setTimestamp()
                  );
                  num++;
                  count = 0;
                }
                if (note.title == "") {
                  Embeds[num].addFields({
                    name: `Note #${i + 1}`,
                    value: `${note.content}`,
                  });
                } else if (note.title != "") {
                  Embeds[num].addFields({
                    name: `${note.title} (#${i + 1})`,
                    value: `${note.content}`,
                  });
                }
                count++;
              }
              if (notes.length < 5) {
                row.components[1].setDisabled(true);
              }
              await interaction.reply({ embeds: [Embeds[0]], components: [row], ephemeral: priv });
              let page = 1;
              const collector = await interaction.channel.createMessageComponentCollector({ time: 90000 });
              collector.on('collect', async (i) => {
                await i.deferUpdate();
                if (i.customId == "nextnote") {

                  if (page < Math.ceil(notes.length / 5)) {
                    page++;
                    if (page == Math.ceil(notes.length / 5)) {
                      row.components[1].setDisabled(true);
                      row.components[0].setDisabled(false);
                    } else {
                      row.components[0].setDisabled(false);
                      row.components[1].setDisabled(false);
                    }
                  }
                  await interaction.editReply({ embeds: [Embeds[page - 1]], components: [row], ephemeral: priv });
                } else if (i.customId == "prevnote") {
                  page--;
                  if (page >= 1) {
                    if (page == 1) {
                      row.components[0].setDisabled(true);
                      row.components[1].setDisabled(false);
                    } else {
                      row.components[0].setDisabled(false);
                      row.components[1].setDisabled(false);
                    }
                  }
                  await interaction.editReply({ embeds: [Embeds[page - 1]], components: [row], ephemeral: priv });
                }
              });
              collector.on("end", async (collected) => {
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(true);
                await interaction.editReply({ embeds: [Embeds[page - 1]], components: [row], ephemeral: priv });
                console.log(`Collected ${collected.size} Interactions.`);
              });
            }
          } else if (option.getString("tinum")) {
            let tinum = option.getString("tinum");
            const list = new EmbedBuilder()
              .setColor('#ffdf00')
              .setAuthor({ name: user.username, iconURL: user.avatarURL() })
              .setTitle("Player Notes")
              .setTimestamp();
            if (tinum.includes("#")) {
              tinum = Number(tinum.replace("#", "") - 1);
              let note = notes[tinum];
              if (note.title == "") {
                list.addFields({
                  name: `Note #${tinum + 1}`,
                  value: `${note.content}`,
                });
              } else if (note.title != "") {
                list.addFields({
                  name: `${note.title} (#${tinum + 1})`,
                  value: `${note.content}`,
                });
              }
              await interaction.reply({ embeds: [list], ephemeral: priv });
            } else if (!tinum.includes("#")) {
              let note = notes.find(n => n.title == tinum);
              if (!note) {
                await interaction.reply({ content: "Could not find a Note with that Title.\nCheck for capitilization or use the Number (#...) instead.", ephemeral: true });
              } else if (note) {
                let num;
                for (let i = 0; i < notes.length; i++) {
                  if (notes[i].title == tinum) {
                    num = i;
                  }
                }
                list.addFields({
                  name: `${note.title} (#${num + 1})`,
                  value: `${note.content}`,
                });
                await interaction.reply({ embeds: [list], ephemeral: priv });
              }
            }
          }
          return;
        case "edit":
          var tinum1 = option.getString("tinum");
          var title1 = option.getString("title");
          var content1 = option.getString("content");
          const secure1 = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🛑')
            );
          if (!title1 && !content1) {
            await interaction.reply({
              content: "You need to use at least one of the given options!",
              ephemeral: true,
            });
          } else if (title1 || content1) {
            if (tinum1.includes("#")) {
              tinum1 = Number(tinum1.replace("#", "") - 1);
              let note = notes[tinum1];
              if (!note) {
                await interaction.rely({
                  content: "Could not find a Note with that Number.\nMake sure to include the #",
                  ephemeral: true,
                });
              } else if (note) {

                await interaction.reply({
                  content: "Are you sure you want to apply the changes?",
                  components: [secure1],
                  ephemeral: true
                });
                const collector = await interaction.channel.createMessageComponentCollector({ time: 90000 });
                collector.on("collect", async (i) => {
                  await i.deferUpdate();
                  if (i.customId == "confirm") {
                    if (title1 && title1 != "") {
                      notes[tinum1].title = title1;
                    }
                    if (content1 && content1 != "") {
                      notes[tinum1].content = content1;
                    }
                    await interaction.editReply({
                      content: "Changes have been applied.",
                      components: [],
                      ephemeral: true
                    });
                    player.notes = notes;
                    for (let i = 0; i < players.length; i++) {
                      if (players[i].id == player.id) {
                        players[i] = player;
                      }
                    }
                    file.players = players;
                    fs.writeFileSync("./database/notes.json", JSON.stringify(file, null, "\t"));
                  } else if (i.customId == "cancel") {
                    await interaction.editReply({
                      content: "Changes have been reverted.",
                      components: [],
                      ephemeral: true
                    });
                  }
                });
                collector.on("end", collected => {
                  console.log(`Collected ${collected.size} Interactions`);
                });
              }
            } else if (!tinum1.includes("#")) {
              let num;
              let note;
              for (let i = 0; i < notes.length; i++) {
                if (notes[i].title == tinum1) {
                  num = i;
                  note = notes[i];
                }
              }
              if (!note) {
                await interaction.reply({
                  content: "Could not find a Note with that Title.\nMake sure to check capitalization or use the Number (#...)",
                  ephemeral: true,
                });
              } else if (note) {
                await interaction.reply({
                  content: "Are you sure you want to apply the changes?",
                  components: [secure1],
                  ephemeral: true
                });
                const collector = await interaction.channel.createMessageComponentCollector({ time: 90000 });
                collector.on("collect", async (i) => {
                  await i.deferUpdate();
                  if (i.customId == "confirm") {
                    if (title1 && title1 != "") {
                      notes[num].title = title1;
                    }
                    if (content1 && content1 != "") {
                      notes[num].content = content1;
                    }
                    await interaction.editReply({
                      content: "Changes have been applied.",
                      ephemeral: true,
                      components: [],
                    });
                    player.notes = notes;
                    for (let i = 0; i < players.length; i++) {
                      if (players[i].id == player.id) {
                        players[i] = player;
                      }
                    }
                    file.players = players;
                    fs.writeFileSync("./database/notes.json", JSON.stringify(file, null, "\t"));
                  } else if (i.customId == "cancel") {
                    await interaction.editReply({
                      content: "Changes have been reverted.",
                      ephemeral: true,
                      components: [],
                    });
                  }
                });
                collector.on("end", collected => {
                  console.log(`Collected ${collected.size} Interactions.`);
                });
              }
            }
          }
          return;
        case "add":
          const content2 = option.getString("content");
          var title2 = option.getString("title");
          if (!title2) {
            title2 = "";
          }
          notes.push({
            title: title2,
            content: content2,
          });
          await interaction.reply({
            content: `Note has been added, view it with:\n\`/notes view tinum:#${notes.length}\``,
            ephemeral: true,
          });
          player.notes = notes;
          for (let i = 0; i < players.length; i++) {
            if (players[i].id == player.id) {
              players[i] = player;
            }
          }
          file.players = players;
          fs.writeFileSync("./database/notes.json", JSON.stringify(file, null, "\t"));
          return;
        case "remove":
          const secure2 = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId("confirm")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🛑')
            );
          let tinum3 = option.getString("tinum");
          if (tinum3.includes("#")) {
            tinum3 = Number(tinum3.replace("#", "") - 1);
            let note = notes[tinum3];
            if (!note) {
              await interaction.reply({
                content: "Could not find a Note with that Number.\nMake sure to copy the #...",
                ephemeral: true,
              });
            } else if (note) {
              await interaction.reply({
                content: "Are you sure you want to remove the Note?",
                ephemeral: true,
                components: [secure2],
              });
              const collector = await interaction.channel.createMessageComponentCollector({ time: 90000 });
              collector.on("collect", async (i) => {
                await i.deferUpdate();
                if (i.customId == "confirm") {
                  notes.splice(tinum3);
                  await interaction.editReply({
                    content: "Note has been deleted.",
                    ephemeral: true,
                    components: [],
                  });
                } else if (i.customId == "cancel") {
                  await interaction.editReply({
                    content: "Deletion has been cancelled",
                    ephemeral: true,
                    components: [],
                  });
                }
              });
              collector.on("end", async (collected) => {
                console.log(`Collected ${collected.size} Interactions.`);
              });
            }
          } else if (!tinum3.includes("#")) {
            let note = notes.find(n => n.title == tinum3);
            if (!note) {
              await interaction.reply({
                content: "Could not find a Note with that Title.\nMake sure to check capitilization, or use the Number (#...) instead.",
                ephemeral: true,
              });
            } else if (note) {
              await interaction.reply({
                content: `Are you sure you want to delete the Note \"${note.title}\"?`,
                ephemeral: true,
                components: [secure2],
              });
              let num;
              for (let i = 0; i < notes.length; i++) {
                if (notes[i].title == note.title) {
                  num = i;
                }
              }
              const collector = await interaction.channel.createMessageComponentCollector({ time: 90000 });
              collector.on("collect", async (i) => {
                await i.deferUpdate();
                if (i.customId == "confirm") {
                  notes.splice(num);
                  await interaction.editReply({
                    content: "Note has been deleted.",
                    ephemeral: true,
                    components: [],
                  });
                } else if (i.customId == "cancel") {
                  await interaction.editReply({
                    content: "Deletion has been cancelled.",
                    ephemeral: true,
                    components: [],
                  });
                }
              });
              collector.on("end", collected => {
                console.log(`Collected ${collected.size} Interactions.`);
              });
            }
          }
          player.notes = notes;
          for (let i = 0; i < players.length; i++) {
            if (players[i].id == player.id) {
              players[i] = player;
            }
          }
          file.players = players;
          fs.writeFileSync("./database/notes.json", JSON.stringify(file, null, "\t"));
          return;
      }
    }
  }
}