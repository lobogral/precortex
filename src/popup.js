import { uiOptionList, getOptionsActivated } from '/common.js';

// Hide elements

const divActive = document.querySelector('.active');
divActive.style.display = 'none';

// Create checkbuttons

var label, input, text;

for (const uiOption of uiOptionList){

  label = document.createElement("label");
  label.id = uiOption.getId();

  input = document.createElement("input");
  input.type = "checkbox";

  label.appendChild(input);
  text = chrome.i18n.getMessage(uiOption.getId() + 'Name');
  label.appendChild(document.createTextNode(text));

  divActive.appendChild(label);

}

const checkButtons = divActive.childNodes;

// Set buttons

const seeButton = document.getElementById('seeButton');
const activeButton = document.getElementById('activeButton');
const fileButton = document.getElementById('fileButton');

seeButton.innerText = chrome.i18n.getMessage('popupSeeButton');
activeButton.innerText = chrome.i18n.getMessage('popupActiveButton');
fileButton.innerText = chrome.i18n.getMessage('popupFileButton');

// Set other elements

document.querySelector('h1').innerText = chrome.i18n.getMessage('name');
document.querySelector('p').innerText = chrome.i18n.getMessage('description');

let optionsActivated;

// Remove Tab Cortex (Using background)

async function removeTabCortex(){
  const tabs = await chrome.tabs.query({});
  const [tabCortex] = tabs.filter(tab => tab.title === chrome.i18n.getMessage('name'));
  if (tabCortex === undefined) return;
  await chrome.tabs.create({});
}

(async () => {

  await removeTabCortex();

  optionsActivated = await getOptionsActivated();

  for(const checkButton of checkButtons){
    checkButton.querySelector('input').checked = optionsActivated[checkButton.id].checked;
  }

})();

//
// See Cortex
//

seeButton.addEventListener('click', async () => {
  const url = chrome.runtime.getURL('options.html');
  chrome.tabs.create({ url: url });
});

//
// Active / Deactivate Cortex
//

activeButton.addEventListener('click', async () => {
  divActive.style.display = divActive.style.display === 'none' ? 'block' : 'none';
});

for(const checkButton of checkButtons){

  checkButton.addEventListener('change', async () => {

    var strRules;

    // Select the current uiOption
    const [uiOption] = uiOptionList.filter(uiOption => uiOption.getId() === checkButton.id);

    // Update checked
    optionsActivated[checkButton.id].checked = checkButton.querySelector('input').checked;

    // Update temporal
    if (checkButton.querySelector('input').checked){
      strRules = optionsActivated[checkButton.id].temporal;
      optionsActivated[checkButton.id].temporal = '';
    } else {
      optionsActivated[checkButton.id].temporal = await uiOption.getStrActualRules();
      strRules = '';
    }

    // Save optionsActivated
    await chrome.storage.sync.set({ optionsActivated });

    // Set rules
    await uiOption.setRules(strRules);

  });

}

//
// Access html Download/Upload
//

fileButton.addEventListener('click', async () => {
  const url = chrome.runtime.getURL('file.html');
  chrome.tabs.create({ url: url });
});

