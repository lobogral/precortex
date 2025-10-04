////////////////////////
// LimitScrolling
////////////////////////

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

  if (!changeInfo.url) return;

  const result = await chrome.storage.local.get(["dataLimitScrolling"]);
  let dataLimitScrolling = result.dataLimitScrolling;
  let jsonRules = dataLimitScrolling.jsonRules;
  let timeToday = dataLimitScrolling.timeToday;

  if (jsonRules.limit.length === 0) return;

  indexDomain = jsonRules.limit.findIndex((jsonLimit) => {
    typeAnalysis = jsonLimit.typeAnalysis;
    if (typeAnalysis === "N"){
      return changeInfo.url.includes(jsonLimit.domain);
    } else {
      const regex = new RegExp(jsonLimit.domain);
      return regex.test(changeInfo.url);
    }
  });

  if (indexDomain === -1) {
    await chrome.action.setBadgeText({ text: `` });
  }

  if (jsonRules.exception.length !== 0){

    indexException = jsonRules.exception.findIndex((exception) => {
      return changeInfo.url.includes(exception);
    });

    if (indexException !== -1) return;

  }

  index = jsonRules.limit.findIndex((jsonLimit) => {
    typeAnalysis = jsonLimit.typeAnalysis;
    if (typeAnalysis === "N"){
      return changeInfo.url.includes(jsonLimit.website);
    } else {
      const regex = new RegExp(jsonLimit.website);
      return regex.test(changeInfo.url);
    }
  });

  if (index === -1) return;

  let dateToday = new Date();
  dateToday.setHours(0, 0, 0, 0);
  time = dateToday.getTime();

  if (timeToday < time) {

    for(const jsonLimit of jsonRules.limit){
      jsonLimit.cont = 0;
    }

    timeToday = time;

  }

  const jsonLimit = jsonRules.limit[index]
  const max = jsonLimit.max;
  const cont = jsonLimit.cont + 1;
  const typeElement  = jsonLimit.typeElement;
  const initialTypeElement = jsonLimit.initialTypeElement;

  try {

    if (!(cont <= max)) {

      await chrome.scripting.executeScript({
        target : {tabId : tab.id},
        func : (_typeElement) => alert(chrome.i18n.getMessage("messageClosingAlert", _typeElement)),
        args : [typeElement]
      });

      await chrome.tabs.create({});
      await chrome.tabs.remove(tab.id);
      await chrome.action.setBadgeText({ text: `` });
      return;

    } else {

      await chrome.scripting.executeScript({
        target : {tabId : tab.id},
        func : (_cont, _max, _typeElement) => alert(chrome.i18n.getMessage("messageNoticeAlert", [_max-_cont, _typeElement])),
        args : [cont, max, typeElement]
      });

      dataLimitScrolling.jsonRules.limit[index].cont = cont;
      dataLimitScrolling.timeToday = timeToday;
      await chrome.storage.local.set({ dataLimitScrolling });
      await chrome.action.setBadgeText({ text: `${max-cont}${initialTypeElement}` });
      return;

    }

  } catch(err){
    return;
  }

});

////////////////////
// LimitImmersion
////////////////////

chrome.tabs.onCreated.addListener(async (tab) => {
  await resetTabTime(tab.id);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    await resetTabTime(tabId);
  }
})

async function resetTabTime(tabId){
  const result = await chrome.storage.local.get(["dataLimitImmersion"]);
  let dataLimitImmersion = result.dataLimitImmersion;
  let tabTimes = dataLimitImmersion.tabTimes;
  tabTimes[tabId] = 0;
  await chrome.storage.local.set({ dataLimitImmersion });
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const result = await chrome.storage.local.get(["dataLimitImmersion"]);
  let dataLimitImmersion = result.dataLimitImmersion;
  let tabTimes = dataLimitImmersion.tabTimes;
  delete tabTimes[tabId];
  await chrome.storage.local.set({ dataLimitImmersion });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  
  if (alarm.name !== 'myAlarm') return;

  const result = await chrome.storage.local.get(["dataLimitImmersion"]);
  let dataLimitImmersion = result.dataLimitImmersion;
  let jsonRules = dataLimitImmersion.jsonRules;
  let tabTimes = dataLimitImmersion.tabTimes;

  if (jsonRules.limit.length === 0) return;
  if (jsonRules.waiting === 0) return;
  if (jsonRules.grace === 0) return;

  const tabs = await chrome.tabs.query({});
  const iconUrl = await chrome.runtime.getURL('icon.png');
 
  for(const tab of tabs){

    if (tabTimes[tab.id] === undefined) continue;

    if (jsonRules.exception.length !== 0){

      indexException = jsonRules.exception.findIndex((exception) => {
        return tab.url.includes(exception);
      });

      if (indexException !== -1) continue;

    }

    index = jsonRules.limit.findIndex((limit) => {
      return tab.url.includes(limit);
    });

    if (index === -1) continue;

    tabTimes[tab.id] += 1;

    if (tabTimes[tab.id] === jsonRules.waiting) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: chrome.i18n.getMessage("messageTitleNotification"),
        message: chrome.i18n.getMessage("messageNoticeNotification", [jsonRules.waiting, tab.title, jsonRules.grace])
      });
    }

    if (tabTimes[tab.id] === jsonRules.waiting + jsonRules.grace) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: chrome.i18n.getMessage("messageTitleNotification"),
        message: chrome.i18n.getMessage("messageClosingNotification", tab.title)
      });
      await chrome.tabs.create({});
      await chrome.tabs.remove(tab.id);
    }

  }

  await chrome.storage.local.set({ dataLimitImmersion });

});

////////////////////
// Main
////////////////////

chrome.runtime.onInstalled.addListener(async (details) => {

  if (details.reason !== 'install') {
    return;
  }

  const dataWhiteList = {
    strTotal: '',
    domainsArray: []
  };

  await chrome.storage.local.set({ dataWhiteList });

  const dataGrayStyle = {
    strTotal: '',
    jsonRules: {fixed: [], mutation: [], exception: []}
  };

  await chrome.storage.local.set({ dataGrayStyle });

  let dateToday = new Date();
  dateToday.setHours(0, 0, 0, 0);
  timeToday = dateToday.getTime();

  const dataLimitScrolling = {
    jsonRules: {limit: [], exception: []},
    timeToday: timeToday
  };

  await chrome.storage.local.set({ dataLimitScrolling });

  const dataNotRecommendation = {
    strTotal: '',
    xpathListJson: [],
    redirectListJson: []
  };

  await chrome.storage.local.set({ dataNotRecommendation });

  const dataLimitImmersion = {
    strTotal: '',
    jsonRules: {limit: [], waiting: 0, grace: 0, exception: []},
    tabTimes: {}
  };

  await chrome.storage.local.set({ dataLimitImmersion });
  await chrome.alarms.create('myAlarm', { periodInMinutes: 1 });

  const dataNotContent = {
    strTotal: '',
    xpathListJson: []
  };

  await chrome.storage.local.set({ dataNotContent });

  const dataNotClipboard = {
    strTotal: '',
    domainsArray: []
  };

  await chrome.storage.local.set({ dataNotClipboard });

  const dataLimitClick = {
    strTotal: '',
    xpathListJson: [],
    messageClick: chrome.i18n.getMessage('messageClick')
  };

  await chrome.storage.local.set({ dataLimitClick });

});

chrome.tabs.onActivated.addListener((activeInfo) => {
  setTimeout(async () => {
    const tabs = await chrome.tabs.query({});
    const [tabCortex] = tabs.filter(tab => tab.title === chrome.i18n.getMessage('name'));
    if (tabCortex === undefined) return;
    if (tabCortex.id === activeInfo.tabId) return;
    await chrome.tabs.remove(tabCortex.id);
  }, 500);
});

