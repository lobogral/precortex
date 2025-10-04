export class UiWhiteList {

  getId(){
    return "whiteList";
  }

  getStrDefaultRules(){
    return `>> Buscadores clásicos
google.com
wikipedia.org
chatgpt.com
youtube.com

>> Otros
web.whatsapp.com
twitch.tv`
  }

  async getStrActualRules(){
    const result = await chrome.storage.local.get(["dataWhiteList"]);
    return result.dataWhiteList.strTotal;
  }

  async getNumActualRules(){
    const result = await chrome.storage.local.get(["dataWhiteList"]);
    const lengthDomainsArray = result.dataWhiteList.domainsArray.length;
    return String(lengthDomainsArray);
  }

  async setRules(strTotal){

    const domainsCommentsArray = (strTotal.trim() === '') ? [] : strTotal.split('\n');
    const domainsArray = domainsCommentsArray.map(domain => domain.trim())
                                             .filter(domain => !domain.includes(">>") && domain !== '');

    const result = await chrome.storage.local.get(["dataWhiteList"]);
    let dataWhiteList = result.dataWhiteList;
    dataWhiteList.strTotal = strTotal;
    dataWhiteList.domainsArray = domainsArray;
    await chrome.storage.local.set({ dataWhiteList });

    let newRulesDefault;
    let newRulesAllowArray;

    if (domainsArray.length != 0){
      newRulesDefault = [
        this.#getRule(1, "*", "block"),
        this.#getRule(2, "|http://localhost/", "allow"),
        this.#getRule(3, "|http://localhost:", "allow"),
        this.#getRule(4, "|http://127.0.0.1/", "allow"),
        this.#getRule(5, "|http://127.0.0.1:", "allow"),
        this.#getRule(6, "|file://", "allow")
      ];
      newRulesAllowArray = domainsArray.map(
        (domain, i) => this.#getRule(i+7, "||" + domain + "/", "allow")
      );
    } else {
      newRulesDefault = [];
      newRulesAllowArray = [];
    }

    const newRulesArray = newRulesDefault.concat(newRulesAllowArray);

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

  #getRule(id, urlFilter, actionType){
    return JSON.parse(`{
      "id": ${id},
      "condition": {
        "urlFilter": "${urlFilter}",
        "resourceTypes": ["main_frame"]
      },
      "action": {
        "type": "${actionType}"
      },
      "priority": 1
    }`);
  }

}

export class UiWhiteListInherit extends UiWhiteList {

  async setRules(strTotal){

    await super.setRules(strTotal);

    const oldRulesArray = await chrome.declarativeNetRequest.getDynamicRules();
    const rulesWhiteList = JSON.parse(JSON.stringify(oldRulesArray));
    let result;

    result = await chrome.storage.local.get(["dataWhiteList"]);
    let dataWhiteList = result.dataWhiteList;
    dataWhiteList.rules = rulesWhiteList;
    await chrome.storage.local.set({ dataWhiteList });

    result = await chrome.storage.local.get(["dataNotRecommendation"]);
    let rulesNotRecommendation = result.dataNotRecommendation.rules || [];

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