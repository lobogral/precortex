import { uiOptionList, getOptionsActivated } from '/common.js';

let optionsActivated = await getOptionsActivated();

// Get elements

const downloadButton = document.getElementById('downloadButton');
const uploadButton = document.getElementById('uploadButton');

downloadButton.innerText = chrome.i18n.getMessage('fileDownloadButton');
uploadButton.innerText = chrome.i18n.getMessage('fileUploadButton');

document.querySelector('title').innerText = chrome.i18n.getMessage('name');
document.getElementById('downloadText').innerText = chrome.i18n.getMessage('fileDownloadText');
document.getElementById('uploadText').innerText = chrome.i18n.getMessage('fileUploadText');

// Hide elements

const fileInput = document.getElementById('fileInput');
fileInput.style.display = 'none';


//
// Download Rules
//

downloadButton.addEventListener('click', async () => {

  let text = "";

  for(const uiOption of uiOptionList){
    if (!optionsActivated[uiOption.getId()].checked) continue;
    text += "## " + uiOption.getId() + " ##\n\n";
    text += await uiOption.getStrActualRules() + "\n\n";
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const filename = chrome.i18n.getMessage('fileNameRules') + '.txt';

  await chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false
  });

});

//
// Upload Rules
//

uploadButton.addEventListener('click', async () => {
  fileInput.style.display = fileInput.style.display === 'none' ? 'block' : 'none';
});

fileInput.addEventListener('change', async (event) => {

  const file = event.target.files[0];

  const lector = new FileReader();
  lector.onload = async (e) => await saveUiOptions(e);
  lector.readAsText(file);
  fileInput.style.display = 'none';

});

async function saveUiOptions(e) {

  const text = e.target.result;

  const arrayText = text.split('## ')
                        .filter(subString => subString.trim() !== '')

  const textListJson = arrayText.map(element => {
    let values = element.split(' ##').map(subString => subString.trim());
    return {
      id: values.shift(),
      strRules: values.shift()
    };
  });

  let textJson;

  for(const uiOption of uiOptionList){
    if (!optionsActivated[uiOption.getId()].checked) continue;
    [textJson] = textListJson.filter(textJson => textJson.id === uiOption.getId());
    if (textJson === undefined) continue;
    await uiOption.setRules(textJson.strRules);
  }

}
