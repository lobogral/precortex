export class UiGrayStyle {

  getId(){
    return "grayStyle";
  }

  getStrDefaultRules(){
    return `>> Fixed
google.com
twitch.tv
youtube.com

>> Mutation
perplexity.ai

>> Exception
google.com/maps`;
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataGrayStyle"]);
    return result.dataGrayStyle.strTotal;
  }

  async getNumActualRules(){

    const result = await chrome.storage.local.get(["dataGrayStyle"]);
    const jsonRules = result.dataGrayStyle.jsonRules;

    const lengthFixed = jsonRules.fixed.length;
    const lengthMutation = jsonRules.mutation.length;
    const lengthException = jsonRules.exception.length;

    return String(lengthFixed + lengthMutation + lengthException);

  }

  async setRules(strTotal){

    const strList = strTotal.split('>>')
                            .filter(subString => subString.trim() !== '')

    let jsonRules = {fixed: [], mutation: [], exception: []};

    for (const str of strList){
      if (str.includes('Fixed')) {
        jsonRules.fixed = this.#text2list(str.replace('Fixed', ''));
      }
      if (str.includes('Mutation')){
        jsonRules.mutation = this.#text2list(str.replace('Mutation', ''));
      }
      if (str.includes('Exception')) {
        jsonRules.exception = this.#text2list(str.replace('Exception', ''));
      }
    }

    const result = await chrome.storage.local.get(["dataGrayStyle"]);
    let dataGrayStyle = result.dataGrayStyle;
    dataGrayStyle.strTotal = strTotal;
    dataGrayStyle.jsonRules = jsonRules;
    await chrome.storage.local.set({ dataGrayStyle });
  
  }

  #text2list(text) {
    return text.split('\n')
               .map(subString => subString.trim())
               .filter(subString => subString !== '');
  }

}