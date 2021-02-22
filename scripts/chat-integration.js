// Hooks 

// Prepare messagens before sending
Hooks.on("preCreateChatMessage", function (data) { 
  attachTargetsToMessage(data);
});

// Alters rendered chat message to add the token name hover and click functions
Hooks.on("renderChatMessage", function (chatMessage, html, messageData) { 
  // Ignore old messages
  if (Date.now() - chatMessage.data.timestamp > 5000) {
    return;
  }
  // Adds token interaction via sender name click
  renderToMessage_SenderFunctions(chatMessage, html, messageData);
  
  // Adds attack targets
  renderToMessage_Targets(html, messageData);
  
  // Add hover and functions to all marked HTML elements
  renderToMessage_AddMouseFunction(html);
});

function renderToMessage_SenderFunctions(chatMessage, html, messageData) {
  if( !game.settings.get("cozy-target", "chatIntegrationHover") || !game.settings.get("cozy-target", "chatIntegrationClick") ) { return; }
  
  // Adds token interaction via sender name click
  let searchResults = html.find(".message-sender");
  
  if(searchResults && searchResults.length > 0) {
    let senderToken = messageData.message.speaker.token;
    
    // But trying to find the sender
    if(!senderToken) {
      let fakeSpeaker = ChatMessage.getSpeaker({actor: messageData.message.speaker.actor});
      senderToken = fakeSpeaker.token;
    }
    
    if(senderToken) {
      searchResults[0].setAttribute("id", senderToken);
      searchResults[0].setAttribute("hoverable", "true");
      
      if(game.settings.get("cozy-target", "chatIntegrationHover")) {
        searchResults[0].classList.add("psnhoverable");
      }
      
      if(game.settings.get("cozy-target", "chatIntegrationClick")) {
        searchResults[0].classList.add("psnclickable");
      }
    }
  }
}


// ----------------------------------------------------------------------------------------------------
//        MAIN FUNCTIONS
// ----------------------------------------------------------------------------------------------------


// We will build the current targets into a JSON structure. The reason: its the only way i found to pass them thru the message without altering its contents very much.
// This way I can add the targets to "roll" parameter (the only one that i could find) and it will be send.
// The "roll" parameter is a JSON dict, so i think as long I keep the targets in a separate key inside this dict I'll not mess with other modules
function attachTargetsToMessage(messageData) {
  let settings = game.settings.get("cozy-target", "targetsSendToChat");
  
  if( settings === "none" ) { return; }
  else if( settings === "explicit" && messageData.type != CONST.CHAT_MESSAGE_TYPES.ROLL ) { return; }
  else if( settings === "implicit" && messageData.type != CONST.CHAT_MESSAGE_TYPES.ROLL && !messageData.content.includes("dice-roll") ) { return; }
    
  // Create JSON structure
  let JSONListOfTargets = targetsJSON();
  if (JSONListOfTargets == null) return;
  JSONListOfTargets = `"selectedTargets":` + JSONListOfTargets;
  
  // Clear targets
  if( game.settings.get("cozy-target", "targetsClearOnRoll") && settings !== "all" ) clearTargets();
  
  // Attach to message content
  if(messageData.roll) messageData.roll = messageData.roll.substr(0,messageData.roll.length-1) + "," + JSONListOfTargets + "}";
  else messageData.roll = "{" + JSONListOfTargets + "}";
}


// Search for targets info and add it to the already received message HTML
function renderToMessage_Targets(html, messageData) {
  // Return cases
  if( game.settings.get("cozy-target", "targetsSendToChat") === "none" ) { return; }
  if( !messageData.message.roll ) { return; }
  
  var rollDict = JSON.parse(messageData.message.roll);
  let targetedTokens = getTokenObjsFromIds(rollDict.selectedTargets);
  if(!targetedTokens) { return; }
  
  // Build targets message
  let targetNodes = getTokensHTML(targetedTokens);
  if( !targetNodes || targetNodes.length == 0 ) { return; }
  
  // Create Base Info
  let targetsDiv = document.createElement("div");
  targetsDiv.classList.add("targetList");
  
  let targetsLabel = document.createElement("span");
  targetsLabel.classList.add("targetListLabel");
  targetsLabel.innerHTML = `<b>TARGETS:</b>`;
  targetsDiv.append(targetsLabel);
  
  // Add targets
  for(let i = 0; i < targetNodes.length; i++) {
    targetNode = targetNodes[i];
    targetsDiv.append(targetNode);
  }
  
  // append back to the message html
  html[0].append(targetsDiv);
  
  // Add target all hover function
  if( game.settings.get("cozy-target", "chatIntegrationClick") ) {
    let targetsLabelList = html.find(".targetListLabel");
    if(targetsLabelList) targetsLabelList.click(_onChatNameClick_all);
  }
}



// --------------------------------------- AUX FUNCTIONS

// Returns a JSON string for a list of current targets
function targetsJSON() {
  let targetTokens = getTargetedTokens();
  if(!targetTokens || targetTokens.length == 0) return null;
  
  // Create JSON structure
  let JSONtargets = `[`;

  let firstFlag = true;
  for(let i = 0; i < targetTokens.length; i++) {
    if (firstFlag) firstFlag = false;
    else JSONtargets += ",";
    JSONtargets += `"` + targetTokens[i].id + `"`;
  }
  JSONtargets += "]";
  
  return JSONtargets
}

// Add hover and functions to all marked HTML elements
function renderToMessage_AddMouseFunction(html) {
  if( game.settings.get("cozy-target", "targetsSendToChat") === "none" ) { return; }

  // Add hover and functions to all marked elements
  if(game.settings.get("cozy-target", "chatIntegrationHover")) {
    let hoverableList = html.find(".psnhoverable");
    if(hoverableList) hoverableList.hover(_onChatNameHover, _onChatNameOut);
  }
  
  if(game.settings.get("cozy-target", "chatIntegrationClick")) {
    let clickableList = html.find(".psnclickable");
    if(clickableList) clickableList.click(_onChatNameClick);
  }
}

// Hover attributes
let _lastHoveredToken = null;

let _onChatNameHover = (event) => {
  event.preventDefault();
  if ( !canvas.scene.data.active ) return;
  
  const token = canvas.tokens.get(event.currentTarget.id);
  if ( token && token.isVisible ) {
    _lastHoveredToken = token;
    event.fromChat = true;
    token._onHoverIn(event);
  }
}

let _onChatNameOut = (event) => {
  event.preventDefault();
  if ( !canvas.scene.data.active ) return;
  
  if (_lastHoveredToken ) {
    _lastHoveredToken._onHoverOut(event);
    _lastHoveredToken = null;
  }
}

function _selectToken(tokenId, multiselect = true) {
  const token = canvas.tokens.get(tokenId);
  if(!token) return;
  if(!token.control) return;
  
  if( multiselect )  token.control({ multiSelect: true, releaseOthers: false });
  else token.control({ multiSelect: false, releaseOthers: true });   
}

let _onChatNameClick = (event) => {
  event.preventDefault();
  if ( !canvas.scene.data.active ) return;
  
  _selectToken(event.currentTarget.id, keyboard.isDown("Shift"));                   
};

let _onChatNameClick_all = (event) => {
  event.preventDefault();
  if ( !canvas.scene.data.active ) return;
  
  let parentNode = event.currentTarget.parentNode;
  let brotherNodes = parentNode.childNodes;
  
  if(brotherNodes.length < 2) return;
  
  _selectToken(brotherNodes[1].id, keyboard.isDown("Shift"));
  
  for(let i = 2; i < brotherNodes.length; i++) {
    _selectToken(brotherNodes[i].id, true);
  }                    
};




// Clear Targets
function clearTargets(targetToKeep = null) {
  const targets = game.user.targets.values();
  for(let target = targets.next(); !target.done; target = targets.next())
  {
      target.value.setTarget(false, { user: game.user, releaseOthers: true });
  }
  //game.user.targets = new Set();
}

// Turn End Clear Markers
var previousTurn = "";
Hooks.on("updateCombat", (combat, update, options, user) => {
  if( !game.settings.get("cozy-target", "targetsClearOnTurnEnd") ) return;
  
/*  if( previousTurn === "" ) {
    clearTargets();
    previousTurn = combat.current.tokenId;
    return;
  }
  
  if( canvas.tokens.controlled.map(t=>t.id).includes(previousTurn) ) {
    clearTargets();
    previousTurn = combat.current.tokenId;
    return;
  } */
   clearTargets();
});

// Get Selected Targets (returns a token list)
function getTargetedTokens()
{
  let targetList = [];
  
  const targets = game.user.targets.values();
  for(let target = targets.next(); !target.done; target = targets.next())
  {
    targetList.push(target.value);
  }
  
  return targetList;
}

// Marks an html element to receive hover and click functions
function markHtmlElement(htmlElement, tokenId)
{
    htmlElement.classList.add("targetToken");
    
    if(game.settings.get("cozy-target", "chatIntegrationHover")) htmlElement.classList.add("psnhoverable");
    if(game.settings.get("cozy-target", "chatIntegrationClick")) htmlElement.classList.add("psnclickable");
    htmlElement.setAttribute("id", tokenId);
}


// Returns HTML node with prepared hover info for a given node: returns element for token IMG
function getTokenHTML_Img(token, size = 30, borderSize = 0) {
  if( !token ) return null;
  
  let imgSrc = token.img || token.data.img || (token.actor && token.actor.img);
  if( !imgSrc ) return null;
  
  let img = document.createElement("img");
  img.src = imgSrc;
  img.width = size;
  img.height = size;
  img.border = 0;
  
  img.setAttribute("style","border: " + borderSize + "px;");
  
  markHtmlElement(img, token.id);

  return img;
}


// Returns HTML node with prepared hover info for a given node: returns element for token name (span)
function getTokenHTML_Span(token)
{
  let newElement = document.createElement("span");
  markHtmlElement(newElement, token.id);
  newElement.innerHTML = token.name;
  return newElement;
}

// Returns HTML nodes from a list of tokens
function getTokensHTML(tokens)
{
  let targetsHTML = [];
  
  for(let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    let spanElement = getTokenHTML_Span(token);
    targetsHTML.push(spanElement);
  }

  return targetsHTML;
}

// Get an array of token objects by a given list of ids
function getTokenObjsFromIds( idsList ) {
  let allTokens = canvas.tokens.placeables;
  let tokenObjs = [];
  
  if(!idsList) return tokenObjs;
  
  if(idsList.length < 3) {
    // Small list, lets get one by one
    for(let i = 0; i < idsList.length; i++) {
      let tokenId = idsList[i];
      for(let j = 0; j < allTokens.length; j++) {
        let token = allTokens[j];
        if(token.id === tokenId ) tokenObjs.push(token);
      }
    }
  } else {
    // Big list... lets create a map 
    let tokenMap = {};
    for(let i = 0; i < allTokens.length; i++) {
      let token = allTokens[i];
      tokenMap[token.id] = token;
    }
    for(let i = 0; i < idsList.length; i++) {
      let tokenId = idsList[i];
      tokenObjs.push( tokenMap[tokenId] );
    }
  }
  return tokenObjs;
}
