export class UiNotRecommendation {

  getId(){
    return "notRecommendation";
  }

  getStrDefaultRules(){
    return `>> Redirect

-- https://www.youtube.com/results?search_query=
https://www.youtube.com/
https://www.youtube.com/?app=desktop&hl=es

-- https://www.tiktok.com/search?q=sports
https://www.tiktok.com/
https://www.tiktok.com/es/
https://www.tiktok.com/explore

>> Xpath

-- https://www.youtube.com/
//div[@id='start']
//div[contains(@class, 'ytd-mini-guide-renderer')]

-- https://www.reddit.com/r/
//div[@id='right-sidebar-contents']
//div[@id='flex-left-nav-contents']`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataNotRecommendation"]);
    return result.dataNotRecommendation.strTotal;
  }

  async getNumActualRules(){

    const result = await chrome.storage.local.get(["dataNotRecommendation"]);
    const dataNotRecommendation = result.dataNotRecommendation;

    const lengthRedirectListJson = dataNotRecommendation.redirectListJson.length;
    const lengthXpathListJson = dataNotRecommendation.xpathListJson.length;

    return String(lengthRedirectListJson + lengthXpathListJson);

  }

  async setRules(strTotal){

    const strList = strTotal.split('>>')
                            .filter(subString => subString.trim() !== '')

    let redirectListJson = [];
    let xpathListJson = [];

    for (const str of strList){
      if (str.includes('Redirect')) {
        redirectListJson = this.#text2listJson(str.replace('Redirect', ''), "redirect", "condition");
      }
      if (str.includes('Xpath')){
        xpathListJson = this.#text2listJson(str.replace('Xpath', ''), "url", "xpath");
      }
    }

    await this.#setRedirection(redirectListJson);

    const result = await chrome.storage.local.get(["dataNotRecommendation"]);
    let dataNotRecommendation = result.dataNotRecommendation;
    dataNotRecommendation.strTotal = strTotal;
    dataNotRecommendation.redirectListJson = redirectListJson;
    dataNotRecommendation.xpathListJson = xpathListJson;
    await chrome.storage.local.set({ dataNotRecommendation });

  }

  #text2listJson(text, principal, secondary) {

    const arrayText = text.split('-- ')
                          .filter(subString => subString.trim() !== '')

    return arrayText.map(element => {
      let values = element.split('\n').map(subString => subString.trim());
      return {
          [principal]: values.shift(),
          [secondary]: values.filter(subString => subString !== '')
      };
    });

  }

  async #setRedirection(redirectListJson){

    let id = 1
    let newRulesArray = []

    for (const redirectJson of redirectListJson) {
      for (const urlCondition of redirectJson.condition){
        newRulesArray.push(this.#getRule(id, urlCondition, redirectJson.redirect));
        id += 1;
      }
    }

    try {
      const oldRulesArray = await chrome.declarativeNetRequest.getDynamicRules();
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRulesArray.map(rule => rule.id),
        addRules: newRulesArray,
      });
    } catch (error) {
      console.error(error);
    }

  }

  #getRule(id, urlCondition, urlReplace){
    return JSON.parse(`{
      "id": ${id},
      "condition": {
        "urlFilter": "|${urlCondition}|",
        "resourceTypes": ["main_frame"]
      },
      "action": {
        "type": "redirect",
        "redirect": {
          "url": "${urlReplace}"
        }
      },
      "priority": 1
    }`);
  }

}

export class UiNotRecommendationInherit extends UiNotRecommendation {

  async setRules(strTotal){

    await super.setRules(strTotal);

    const oldRulesArray = await chrome.declarativeNetRequest.getDynamicRules();
    const rulesNotRecommendation = JSON.parse(JSON.stringify(oldRulesArray));
    let result;

    result = await chrome.storage.local.get(["dataWhiteList"]);
    let rulesWhiteList = result.dataWhiteList.rules || [];

    result = await chrome.storage.local.get(["dataNotRecommendation"]);
    let dataNotRecommendation = result.dataNotRecommendation;
    dataNotRecommendation.rules = rulesNotRecommendation;
    await chrome.storage.local.set({ dataNotRecommendation });

    let maxIdRule = 0;
    if (rulesWhiteList.length !== 0){
      maxIdRule = Math.max(...rulesWhiteList.map(oldRule => oldRule.id));
    }

    for (const ruleNotRecommendation of rulesNotRecommendation){
      ruleNotRecommendation.id += maxIdRule;
      ruleNotRecommendation.priority = 2;
    }

    const newRulesArray = rulesWhiteList.concat(rulesNotRecommendation);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRulesArray.map(rule => rule.id),
      addRules: newRulesArray,
    });

  }

}