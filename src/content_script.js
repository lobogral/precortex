///////////////////////
// Gray Style
///////////////////////

async function setGrayStyle() {
  chrome.storage.local.get(['dataGrayStyle']).then((result) => {
    
    const jsonRules = result.dataGrayStyle.jsonRules;

    for (const exception of jsonRules.exception){
      if (document.URL.includes(exception)){
        return;
      }
    }

    const domain = new URL(document.URL).hostname.replace('www.', '');

    if (jsonRules.fixed.includes(domain)){

      document.documentElement.style.filter = 'grayscale(100%)';
      return;

    }

    if (jsonRules.mutation.includes(domain)) {

      document.documentElement.style.filter = 'grayscale(100%)';

      const observer = new MutationObserver((mutations) => {
        if (mutations.some(mutation => mutation.attributeName === 'style')) {
          document.documentElement.style.filter = 'grayscale(100%)';
        }
      });

      observer.observe(document.documentElement, {attributes: true});
      return;

    }

  });
}

///////////////////////
// Not Clipboard
///////////////////////

async function setNotClipboard() {
  chrome.storage.local.get(['dataNotClipboard']).then((result) => {

    document.addEventListener('keydown', (event) => {

      const domains = result.dataNotClipboard.domainsArray;
      const actualDomain = window.location.hostname;

      if (!domains.includes(actualDomain)) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      if (event.key === 'x' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

    }, true);

  });
}

////////////////////////
// Not Recommendation
////////////////////////

class ClassScriptNotRecommendation {

  #storageData;

  async setAttributes(){
    const result = await chrome.storage.local.get(["dataNotRecommendation"]);
    this.#storageData = result.dataNotRecommendation.xpathListJson;
  }

  getStorageData(){
    return this.#storageData;
  }

  update(){

    const xpathListRepeated = this.#storageData
                                  .filter(xpathJson => document.URL.includes(xpathJson.url))
                                  .flatMap(xpathJson => xpathJson.xpath);

    const xpathList = [...new Set(xpathListRepeated)];

    if (xpathList.length === 0) return;

    for (const xpath of xpathList) {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (result !== null) {
        result.remove();
      }
    }
  }

}

///////////////////////////
// Not Content
///////////////////////////

class ClassScriptNotContent {

  #storageData;

  async setAttributes(){
    const result = await chrome.storage.local.get(['dataNotContent']);
    this.#storageData = result.dataNotContent.xpathListJson;
  }

  getStorageData(){
    return this.#storageData;
  }

  update(){

    const [xpathList] = this.#storageData.filter(xpathJson => document.URL.includes(xpathJson.urlContent));

    if (xpathList === undefined) return;

    for (const xpath of xpathList.xpath) {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (result !== null) {
        location.href = xpathList.urlRedirect;
      }
    }
  }

}

///////////////////////////
// Limit Click
///////////////////////////

class ClassScriptLimitClick {

  #storageData;
  #messageClick;
  #cont;

  async setAttributes(){
    const result = await chrome.storage.local.get(['dataLimitClick']);
    this.#cont = 0;
    this.#messageClick = result.dataLimitClick.messageClick;
    this.#storageData = result.dataLimitClick.xpathListJson;
  }

  getStorageData(){
    return this.#storageData;
  }

  update(){

    this.#cont = this.#cont !== 3 ? this.#cont + 1: 0;

    if (this.#cont !== 3) return;

    const [rule] = this.#storageData.filter(element => element.domain.includes(window.location.hostname));

    if (rule === undefined) return;

    for(const xpath of rule.xpaths){

      const actualResult = document.evaluate(
        xpath.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (xpath.result === actualResult) return;

      xpath.result = actualResult;

      if (xpath.result === null) return;

      xpath.result.addEventListener('click', (event) => {
        if (!confirm(this.#messageClick)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);

    }

  }

}

///////////////////////////
// Main
///////////////////////////

function repeatExecution(classScripts) {
  classScripts.forEach((classScript) => classScript.update());
  setTimeout(() => repeatExecution(classScripts), 300);
}

(async () => {

  await setGrayStyle();
  await setNotClipboard();

  const classScripts = [
    new ClassScriptNotRecommendation(),
    new ClassScriptNotContent(),
    new ClassScriptLimitClick()
  ];

  for(const classScript of classScripts){
    await classScript.setAttributes();
  }
  classScriptsFiltered = classScripts.filter(classScript => classScript.getStorageData().length !== 0)
  if (classScriptsFiltered.length !== 0){
    repeatExecution(classScriptsFiltered);
  }

})();
