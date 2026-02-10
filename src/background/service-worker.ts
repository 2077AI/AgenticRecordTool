import { EventTypes  } from "../types";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
let recordStatus: any
let recordingTabId: number | null = null;
// let actionStack: any[] = [];
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse: any) => {
  if (request.action === "triggerStartRecord") {
    recordStatus = request.data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        recordingTabId = tabs[0].id;
      }
    });
    handleStartRecord(request.isRawHtml);
  }
  if (request.action === "previewLoaded") {
    // Forward previewLoaded message to offscreen document
    chrome.runtime.sendMessage({
      action: "previewLoaded",
    }).catch((error) => {
      console.debug('Could not forward previewLoaded message to offscreen:', error.message);
    });
    return false;
  }
  if (request.action === "startRecord") {
    chrome.runtime.sendMessage({
      action: "startRecord",
    }).then(() => {
      console.log('startRecord success');
    }).catch((error) => {
      console.error('startRecord error', error);
    });
    return false;
  }
  if (request.action === "finishRecord") {
    chrome.runtime.sendMessage({
      action: "finishRecord",
    }).catch(() => {});
    
    const targetTabId = recordingTabId;
    recordingTabId = null;

    // Immediately create preview page with loading animation
    console.log('Recording finished, navigating to preview page');
    chrome.tabs.create({ url: chrome.runtime.getURL("preview/index.html") });

    // Try to send resultState message to collect final page state (non-blocking, failure doesn't affect)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const finalTabId = targetTabId || (activeTab ? activeTab.id : null);

      if (finalTabId) {
        chrome.tabs.sendMessage(finalTabId, {
          action: "resultState",
          url: activeTab?.url?.split('#')[0],
        }).then(() => {
          console.log('Successfully collected final page state');
        }).catch((error) => {
          console.warn('Failed to collect final page state (does not affect recording result):', error?.message);
          // Does not affect main flow, data has already been collected in offscreen
        });
      }
    });

    return false;
  }
  if (
    request.action === "collectionTrigger" &&
    request.data.type === EventTypes.RESULT_STATE
  ) {
    console.log('Received RESULT_STATE event (final page state collected)');
    // No longer used to trigger preview page creation, preview page is created immediately in finishRecord
    return false;
  }
  
  // Forward actionChunks messages from offscreen to preview page
  // Note: chrome.runtime.sendMessage broadcasts to all listeners, but we keep this
  // for explicit forwarding if needed
  if (request.action === "actionChunks") {
    // Message will be broadcast to all listeners including preview page
    return false;
  }

  // return true;
});
async function createOffscreenDocument(isRawHtml: boolean) {
  const offscreenUrl = chrome.runtime.getURL(
    "offscreen/index.html?isRawHtml=" + isRawHtml
  );
  const hasOffscreen = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });
  if (hasOffscreen.length) {
    chrome.offscreen.closeDocument();
  }
  try {
    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: ["DISPLAY_MEDIA"],
      justification: "Offscreen document needed to handle media stream",
    });
    console.log("Offscreen document created successfully");
  } catch (error) {
    console.log(error);
    chrome.offscreen.closeDocument();
  }
}
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    chrome.runtime.sendMessage({
      action: "collectionTrigger",
      data: {
        type: "TAB_CHANGE",
        info: tab,
      },
      time: new Date().getTime(),
    });
  });
});
chrome.sidePanel.setPanelBehavior;
const handleStartRecord = async (isRawHtml: boolean = true) => {
  await createOffscreenDocument(isRawHtml);
  chrome.runtime.sendMessage({ action: "startRecordingRequest", data: recordStatus });
};
