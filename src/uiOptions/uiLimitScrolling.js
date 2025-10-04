export class UiLimitScrolling {

  getId(){
    return "limitScrolling";
  }

  getStrDefaultRules(){
    return `>> Limit
15 0 youtube.com/shorts short(s)
15 0 tiktok\.com\/@[^\/]+\/video tiktok(s) R
15 0 reddit\.com\/r\/[^\/]+\/comments publicacion(es) R

>> Exception
reddit.com/r/AskReddit
reddit.com/r/Games`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataLimitScrolling"]);
    return this.#json2Str(result.dataLimitScrolling.jsonRules);
  }

  async getNumActualRules(){

    const result = await chrome.storage.local.get(["dataLimitScrolling"]);
    const jsonRules = result.dataLimitScrolling.jsonRules;

    const lengthLimit = jsonRules.limit.length;
    const lengthException = jsonRules.exception.length;

    return String(lengthLimit + lengthException);

  }

  async setRules(strTotal){
    let jsonRules = this.#str2Json(strTotal);
    const result = await chrome.storage.local.get(["dataLimitScrolling"]);
    let dataLimitScrolling = result.dataLimitScrolling;
    dataLimitScrolling.jsonRules = jsonRules;
    await chrome.storage.local.set({ dataLimitScrolling });
  }

  #str2Json(strTotal){

    const strList = strTotal.split('>>')
                            .filter(subString => subString.trim() !== '')

    let jsonRules = {limit: [], exception: []};

    for (const str of strList){

      if (str.includes('Limit')) {

        const listLimit = str.replace('Limit', '')
                             .split('\n')
                             .map(subText => subText.trim())
                             .filter(subText => subText !== '')

        jsonRules.limit = listLimit.map(subText => {
          let [_strMax, _strCont, _website, _typeElement, _typeAnalysis = "N"] = subText.split(" ");
          return {
            max: parseInt(_strMax),
            cont: parseInt(_strCont),
            website: _website,
            domain: _website.split(_typeAnalysis === "N" ? "/": "\\/")[0],
            typeElement: _typeElement,
            initialTypeElement: _typeElement.charAt(0),
            typeAnalysis: _typeAnalysis
          }
        })

      }

      if (str.includes('Exception')) {

        jsonRules.exception = str.replace('Exception', '')
                                 .split('\n')
                                 .map(subText => subText.trim())
                                 .filter(subText => subText !== '')

      }

    }

    return jsonRules

  }

  #json2Str(jsonTotal){

    let strTotal = "";

    if (jsonTotal.limit.length !== 0){
      if (strTotal !== ""){
        strTotal += "\n\n";
      }
      strTotal += ">> Limit";
      let typeAnalysis;
      for (const rule of jsonTotal.limit){
        typeAnalysis = rule.typeAnalysis !== "N" ? ` ${rule.typeAnalysis}` : ``;
        strTotal += `\n${rule.max} ${rule.cont} ${rule.website} ${rule.typeElement}${typeAnalysis}`;
      }
    }

    if (jsonTotal.exception.length !== 0){
      if (strTotal !== ""){
        strTotal += "\n\n";
      }
      strTotal += ">> Exception";
      for (const rule of jsonTotal.exception){
        strTotal += `\n${rule}`;
      }
    }

    return strTotal;

  }

}