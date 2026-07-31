const { ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = (itemData) => {
  const modal = new ModalBuilder()
    .setCustomId("watched")
    .setTitle("Mark as Watched")
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`### ${itemData.title} (${itemData.year})`),
    )
    .addLabelComponents((label) =>
      label
        .setLabel("What do you rate this?")
        .setDescription("1 is lowest, 5 is highest")
        .setStringSelectMenuComponent((stringSelect) =>
          stringSelect
            .setCustomId("rating")
            .setPlaceholder("Rating")
            .setRequired(true)
            .addOptions(
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
            ),
        ),
    )
    .addLabelComponents((label) =>
      label
        .setLabel("Who did you watch with?")
        .setUserSelectMenuComponent((userSelect) =>
          userSelect
            .setCustomId("users")
            .setPlaceholder("Select users")
            .setRequired(false)
            .setMinValues(0),
        ),
    )
    .addLabelComponents((label) =>
      label
        .setLabel("Comments")
        .setDescription("Any further comments")
        .setTextInputComponent((textInput) =>
          textInput
            .setStyle(TextInputStyle.Paragraph)
            .setCustomId("comments")
            .setRequired(false),
        ),
    );

  return modal;
};
