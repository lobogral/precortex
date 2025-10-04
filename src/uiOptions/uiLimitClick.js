export class UiLimitClick {

  getId(){
    return "limitClick";
  }

  getStrDefaultRules(){
    return `--
teams.microsoft.com
//button[contains(@data-tid, 'MessageCommands-send')]
//button[contains(@data-tid, 'chat-call-audio')]

--
www.perplexity.ai
//button[@data-testid='submit-button']

--
web.whatsapp.com
//button[@aria-label='Enviar']

--
www.google.com
//a[contains(text(), 'Gmail')]
//a[contains(text(), 'Images')]
`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataLimitClick"]);
    return result.dataLimitClick.strTotal;
  }

  async getNumActualRules(){
    const result = await chrome.storage.local.get(["dataLimitClick"]);
    const xpathListJson = result.dataLimitClick.xpathListJson;
    const lengthXpathListJson = xpathListJson.length;
    return String(lengthXpathListJson);
  }

  async setRules(strTotal){
    let xpathListJson = this.#text2listJson(strTotal);
    const result = await chrome.storage.local.get(["dataLimitClick"]);
    let dataLimitClick = result.dataLimitClick;
    dataLimitClick.strTotal = strTotal;
    dataLimitClick.xpathListJson = xpathListJson;
    await chrome.storage.local.set({ dataLimitClick });
  }

  #text2listJson(text) {

    const arrayText = text.split('--')
                          .filter(subString => subString.trim() !== '')

    return arrayText.map(element => {

      let values = element.split('\n')
                          .map(subString => subString.trim())
                          .filter(subString => subString.trim() !== '');

      const domain = values.shift();

      const xpaths = values.filter(subString => subString !== '')
                           .map(subString => ({xpath: subString, result: null}));

      return {
          domain: domain,
          xpaths: xpaths,
      };

    });

  }

}
