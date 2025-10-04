export class UiNotClipboard {

  getId(){
    return "notClipboard";
  }

  getStrDefaultRules(){
    return `teams.microsoft.com
outlook.office.com
www.perplexity.ai
www.google.com
web.whatsapp.com`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataNotClipboard"]);
    return result.dataNotClipboard.strTotal;
  }

  async getNumActualRules(){
    const result = await chrome.storage.local.get(["dataNotClipboard"]);
    const domainsArray = result.dataNotClipboard.domainsArray;
    const lengthdomainsArray = domainsArray.length;
    return String(lengthdomainsArray);
  }

  async setRules(strTotal){
    let domainsArray = this.#text2list(strTotal);
    const result = await chrome.storage.local.get(["dataNotClipboard"]);
    let dataNotClipboard = result.dataNotClipboard;
    dataNotClipboard.strTotal = strTotal;
    dataNotClipboard.domainsArray = domainsArray;
    await chrome.storage.local.set({ dataNotClipboard });
  }

  #text2list(text) {
    return text.split('\n')
               .map(subString => subString.trim())
               .filter(subString => subString.trim() !== '');
  }

}