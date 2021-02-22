Hooks.once("init", () => {

  // chatActorTokenIntegration
  game.settings.register("cozy-target", "chatIntegrationHover", {
		name: "Chat Integration: Hover",
    hint: "Simulates token hovering when hovering a token name on chat.",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
  
  game.settings.register("cozy-target", "chatIntegrationClick", {
		name: "Chat Integration: Click",
    hint: "Simulates token selection when clicking a token name on chat.",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
  
  game.settings.register("cozy-target", "targetsSendToChat", {
		name: "Targets: Add to chat",
    hint: "Attach current targets to chat message in some situations. WARNING! Implicit moode have the greater performance hit, but is more compatible with better rolls module.",
		scope: "world",
		config: true,
		default: "explicit",
		type: String,
		choices: {
      "none": "Never",
      "explicit": "On explicit rolls",
      "implicit": "On implicit rolls",
      "all": "On any message"
		}
	});
	
  game.settings.register("cozy-target", "targetsClearOnRoll", {
		name: "Targets: Clear on Attach",
    hint: "Deselects all targets when attaching them to a message.",
		scope: "global",
		config: false,
		default: false,
		type: Boolean
	});	
  
  game.settings.register("cozy-target", "targetsClearOnTurnEnd", {
		name: "Targets: Clear on Turn End",
    hint: "Deselects all targets when passing your turn.",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
 
  
});