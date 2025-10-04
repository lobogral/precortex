import { UiWhiteListInherit } from './uiOptions/uiWhiteList.js';
import { UiGrayStyle } from './uiOptions/uiGrayStyle.js';
import { UiLimitScrolling } from './uiOptions/uiLimitScrolling.js';
import { UiNotRecommendationInherit } from './uiOptions/uiNotRecommendation.js';
import { UiLimitImmersion } from './uiOptions/uiLimitImmersion.js';
import { UiNotContent } from './uiOptions/uiNotContent.js';
import { UiNotClipboard } from './uiOptions/uiNotClipboard.js';
import { UiLimitClick } from './uiOptions/uiLimitClick.js';

// UiOptions

export const uiOptionList = [
  new UiWhiteListInherit(),
  new UiGrayStyle(),
  new UiLimitScrolling(),
  new UiNotRecommendationInherit(),
  new UiLimitImmersion(),
  new UiNotContent(),
  new UiNotClipboard(),
  new UiLimitClick()
];

// OptionsActivated

export async function getOptionsActivated(){

  const result = await chrome.storage.sync.get(['optionsActivated']);
  let optionsActivated = result.optionsActivated;
  if (optionsActivated !== undefined) return optionsActivated;

  const listActivated = uiOptionList.map(uiOption => [uiOption.getId(), {checked: true, temporal: ""}])
  optionsActivated = Object.fromEntries(listActivated);
  await chrome.storage.sync.set({ optionsActivated });
  return optionsActivated;

}
