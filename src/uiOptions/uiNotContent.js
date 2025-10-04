export class UiNotContent {

  getId(){
    return "notContent";
  }

  getStrDefaultRules(){
    return `--
https://www.youtube.com/results?search_query=
https://www.youtube.com/results?search_query=
//yt-formatted-string[contains(text(), 'controversy')]
//yt-formatted-string[contains(text(), 'criticism')]

--
https://www.tiktok.com/search
https://www.tiktok.com/search?q=peace
//span[contains(text(), 'controversy')]
//span[contains(text(), 'criticism')]`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataNotContent"]);
    return result.dataNotContent.strTotal;
  }

  async getNumActualRules(){
    const result = await chrome.storage.local.get(["dataNotContent"]);
    const xpathListJson = result.dataNotContent.xpathListJson;
    const lengthXpathListJson = xpathListJson.length;
    return String(lengthXpathListJson);
  }

  async setRules(strTotal){
    let xpathListJson = this.#text2listJson(strTotal);
    const result = await chrome.storage.local.get(["dataNotContent"]);
    let dataNotContent = result.dataNotContent;
    dataNotContent.strTotal = strTotal;
    dataNotContent.xpathListJson = xpathListJson;
    await chrome.storage.local.set({ dataNotContent });
  }

  #text2listJson(text) {

    const arrayText = text.split('--')
                          .filter(subString => subString.trim() !== '')

    return arrayText.map(element => {
      let values = element.split('\n')
                          .map(subString => subString.trim())
                          .filter(subString => subString.trim() !== '');

      return {
          urlContent: values.shift(),
          urlRedirect: values.shift(),
          xpath: values.filter(subString => subString !== '')
      };
    });

  }

}
