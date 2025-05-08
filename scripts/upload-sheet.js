Hooks.on("ready", () => {
  if (!game.user.isGM) return;

  const button = document.createElement("button");
  button.innerHTML = "Import XCC Character";
  button.style.margin = "5px";
  button.addEventListener("click", async () => {
    const content = await new Promise((resolve) => {
      new Dialog({
        title: "Paste XCC Character Text",
        content: '<textarea id="xcc-import-text" rows="20" style="width:100%"></textarea>',
        buttons: {
          import: {
            label: "Import",
            callback: (html) => resolve(html.find("#xcc-import-text").val())
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve(null)
          }
        }
      }).render(true);
    });

    if (!content) return;

    const actorData = parseXCCText(content);
    if (!actorData) {
      ui.notifications.error("Failed to parse character data.");
      return;
    }

    await Actor.create(actorData);
    ui.notifications.info("XCC Character imported successfully.");
  });

  const controls = document.querySelector("aside#sidebar section.directory .directory-header");
  if (controls) controls.appendChild(button);
});

function parseXCCText(text) {
  const data = {};

  const lines = text.split(/\r?\n/);

  function extract(label) {
    const line = lines.find(l => l.startsWith(label));
    return line ? line.replace(label, "").trim() : "";
  }

  data.name = extract("Name:");
  data.type = "character";
  data.system = {
    abilities: {
      str: { value: extract("Strength:") },
      agi: { value: extract("Agility:") },
      sta: { value: extract("Stamina:") },
      per: { value: extract("Personality:") },
      luk: { value: extract("Luck:") },
      int: { value: extract("Intelligence:") }
    },
    hp: { value: extract("Hit Points:"), max: extract("Hit Points Max:") },
    ac: { value: extract("Armor Class:") },
    saves: {
      fort: { value: extract("Fort Save:") },
      ref: { value: extract("Ref Save:") },
      will: { value: extract("Will Save:") }
    }
  };

  return data;
}