import { uiOptionList, getOptionsActivated } from '/common.js';

document.addEventListener('DOMContentLoaded', async () => {

// Set elements from sidenav

let optionsActivated = await getOptionsActivated();
const sidenav = document.querySelector('.sidenav');

var element;
for (const uiOption of uiOptionList){

  if(!optionsActivated[uiOption.getId()].checked){
    continue;
  }

  element = document.createElement("a");
  element.id = uiOption.getId();
  element.textContent = chrome.i18n.getMessage(uiOption.getId() + 'Name');
  sidenav.appendChild(element);
}

const links = sidenav.childNodes;
if (links.length === 0) {
  window.close();
  alert(chrome.i18n.getMessage('optionsAlertMessage'));
  return;
}

// Get other elements
document.getElementById('uiDescription').innerText = chrome.i18n.getMessage('uiDescription');
document.getElementById('uiHowToUse').innerText = chrome.i18n.getMessage('uiHowToUse');
document.querySelector('title').innerText = chrome.i18n.getMessage('name');
document.getElementById("default").innerHTML += chrome.i18n.getMessage('defaultCheck');
document.querySelector('button').innerText = chrome.i18n.getMessage('updateButton');

const optionDescription = document.getElementById('optionDescription')
const optionHowToUse = document.getElementById('optionHowToUse')
const defaultCheck = document.querySelector("label").querySelector('input');
const strTextarea = document.querySelector('textarea');
const statusSpan = document.querySelector('span');
const updateButton = document.querySelector('button');


links.forEach(link => {
  link.addEventListener('click', async (event) => {

    // Set activatedLink
    event.preventDefault();
    removeActiveLinks(links);
    addActiveLink(link);

    // Get rules
    const [uiOption] = uiOptionList.filter(uiOption => uiOption.getId() === link.id);
    strTextarea.value = await uiOption.getStrActualRules();

    // Set values
    statusSpan.innerText = '';
    defaultCheck.checked = false;
    strTextarea.disabled = false;
    optionDescription.innerText = chrome.i18n.getMessage(uiOption.getId() + 'Description');
    optionHowToUse.innerText = chrome.i18n.getMessage(uiOption.getId() + 'HowToUse');

  });
});

function removeActiveLinks(links) {
  links.forEach(link => link.classList.remove('active'));
}

function addActiveLink(link) {
  link.classList.add('active');
}

defaultCheck.addEventListener('change', async () => {

  // Select the current uiOption
  const link = document.querySelector('a.active');
  const [uiOption] = uiOptionList.filter(uiOption => uiOption.getId() === link.id);

  // Set Textarea
  if (defaultCheck.checked){
    strTextarea.value = uiOption.getStrDefaultRules();
    strTextarea.disabled = true;
  } else {
    strTextarea.value = await uiOption.getStrActualRules();
    strTextarea.disabled = false;
  }

});

updateButton.addEventListener('click', async () => {

  // Select the current option
  const link = document.querySelector('a.active');
  const [uiOption] = uiOptionList.filter(uiOption => uiOption.getId() === link.id);

  // Set Rules
  await uiOption.setRules(strTextarea.value);

  // Set values
  const statusNum = await uiOption.getNumActualRules();
  statusSpan.innerText = chrome.i18n.getMessage('outputText', statusNum);
  defaultCheck.checked = false;
  strTextarea.disabled = false;

});

// Click on first link
links[0].click();

});