export class UiLimitImmersion {

  getId(){
    return "limitImmersion";
  }

  getStrDefaultRules(){
    return `>> Limit
youtube.com/watch
reddit.com/r/
twitch.tv/

>> Waiting
20

>> Grace
5

>> Exception
reddit.com/r/AskReddit
reddit.com/r/Games`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataLimitImmersion"]);
    return result.dataLimitImmersion.strTotal;
  }

  async getNumActualRules(){

    const result = await chrome.storage.local.get(["dataLimitImmersion"]);
    const jsonRules = result.dataLimitImmersion.jsonRules;

    const lengthLimit = jsonRules.limit.length;
    const lengthException = jsonRules.exception.length;

    return String(lengthLimit + lengthException);

  }

  async setRules(strTotal){

    const strList = strTotal.split('>>')
                            .filter(subString => subString.trim() !== '')

    let jsonRules = {limit: [], waiting: 0, grace: 0, exception: []}

    for (const str of strList){
      if (str.includes('Limit')) {
        jsonRules.limit = this.#text2list(str.replace('Limit', ''));
      }
      if (str.includes('Waiting')) {
        jsonRules.waiting = this.#text2int(str.replace('Waiting', ''));
      }
      if (str.includes('Grace')) {
        jsonRules.grace = this.#text2int(str.replace('Grace', ''));
      }
      if (str.includes('Exception')) {
        jsonRules.exception = this.#text2list(str.replace('Exception', ''));
      }
    }

    const result = await chrome.storage.local.get(["dataLimitImmersion"]);
    let dataLimitImmersion = result.dataLimitImmersion;
    dataLimitImmersion.strTotal = strTotal;
    dataLimitImmersion.jsonRules = jsonRules;
    await chrome.storage.local.set({ dataLimitImmersion });

  }

  #text2list(text) {
    return text.split('\n')
               .map(subString => subString.trim())
               .filter(subString => subString !== '');
  }

  #text2int(text){
    return parseInt(text.trim());
  }

}