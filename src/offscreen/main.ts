import { EventTypes, type RECORD_STATUS } from "../types";
let mediaRecorder: MediaRecorder;
let recordedChunks: any[] = [];
let stream: any;
let url: string;
let startTime: number;
let isRawHtml: boolean = true;
let recordStatus: RECORD_STATUS;
let recordingSessionId: string = ''; // Unique ID for each recording session
class DataCollection {
  actionStack: any[] = [];
  constructor() {}
  add(e: any) {
    const lastAction = this.actionStack[this.actionStack.length - 1];
    if (!isRawHtml && lastAction && (lastAction.type === EventTypes.KEY_DOWN && e.type === EventTypes.INPUT)) {
      delete e.rawHtml;
    }
    // Add unique ID for each mouse event
    e.id = uuid();
    this.actionStack.push(e);
  }
  clear() {
    this.actionStack.length = 0;
  }
  exports() {
    return this.actionStack;
  }  
}
const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
const dataCollection = new DataCollection();
document.addEventListener("DOMContentLoaded", () => {
  // Notify background script that offscreen document is ready
  const urlParams = new URLSearchParams(window.location.search);
  isRawHtml = urlParams.get("isRawHtml") === "false" ? false : true;
  chrome.runtime.sendMessage({ action: "offscreenReady" }).catch((error) => {
    console.debug('Could not send offscreenReady message:', error.message);
  });
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse: any) => {
  if (message.action === "startRecordingRequest") {
    // Start recording logic
    console.log(message.data);
    recordStatus = JSON.parse(JSON.stringify(message.data));
    dataCollection.clear();
    recordedChunks = [];
    // Generate a unique recording session ID for this recording
    recordingSessionId = `rec_${Date.now()}_${uuid()}`;
    console.log('🎬 New recording session started:', recordingSessionId);
    handleStartRecord();
  }
  if (message.action === "triggerFinishRecord") {
    mediaRecorder.stop();
  }
  if (message.action === "getRecordData") {
    const data = dataCollection.exports();
    sendResponse(data);
    // return true;
  }
  if (message.action === "collectionTrigger") {
    if (!recordStatus || !recordStatus.recording) return;
    if (message.data.type === EventTypes.RESULT_STATE) {
      recordStatus.recording = false;
      localStorage.setItem("RECORD_STATUS", JSON.stringify(recordStatus));
    }
    dataCollection.add(wrapTime(message.data, message.time - startTime));
  }
  if (message.action === "previewLoaded") {
    const chunkSize = 5;
    const actionStack = dataCollection.exports();
    const totalChunks = Math.max(1, Math.ceil(actionStack.length / chunkSize));
    
    console.log('Preview page loaded, preparing to send data:', {
      actionCount: actionStack.length,
      hasUrl: !!url,
      url: url || 'NOT SET',
      totalChunks,
      recordingSessionId
    });
    
    if (!url) {
      console.error('⚠️ Video URL is not set! Recording may have failed or not completed.');
    }
    
    if (actionStack.length === 0) {
      console.warn('Warning: Recording data is empty, possibly due to short recording time or no operations captured');
      chrome.runtime.sendMessage({
        action: "actionChunks",
        data: {
          chunk: JSON.stringify([]),
          id: 0,
          total: 1,
          url,
          recordingSessionId,
        },
      }).catch((error) => {
        console.debug('Could not send empty actionChunks message:', error.message);
      });
    } else {
      console.log(`📤 Sending ${actionStack.length} actions in ${totalChunks} chunks`);
      for (let i = 0; i < actionStack.length; i += chunkSize) {
        const chunk = actionStack.slice(i, i + chunkSize);
        chrome.runtime.sendMessage({
          action: "actionChunks",
          data: {
            chunk: JSON.stringify(chunk),
            id: i, // Starting index of actions in this chunk
            total: totalChunks,
            url,
            recordingSessionId,
          },
        }).catch((error) => {
          console.debug(`Could not send chunk:`, error.message);
        });
      }
    }
  }
  return false;
});
function wrapTime(e: any, time: number) {
  console.log(time);
  return Object.assign(e, {
    time,
  });
}
const handleStartRecord = async () => {
  try {
    if (!stream) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    }
    if (stream) {
      const tracks = stream.getTracks();
      if (tracks && tracks.length > 0) {
        tracks[0].onended = () => {
          if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        };
      }
      chrome.runtime.sendMessage({ action: "startRecord" }).catch((error) => {
        console.debug('Could not send startRecord message:', error.message);
      });
    }
    const options = {
      mimeType: "video/webm",
    };
    mediaRecorder = new MediaRecorder(stream, options);
    recordStatus.recording = true;
    localStorage.setItem("RECORD_STATUS", JSON.stringify(recordStatus));
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      url = URL.createObjectURL(blob);
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        stream = null;
      }
      // Update recording status
      if (recordStatus) {
        recordStatus.recording = false;
        localStorage.setItem("RECORD_STATUS", JSON.stringify(recordStatus));
      }
      // Save to chrome.storage
      // Create download link
      chrome.runtime.sendMessage({
        action: "finishRecord",
        data: {
          url,
        },
      }).catch((error) => {
        console.debug('Could not send finishRecord message:', error.message);
      });
    };

    mediaRecorder.start(100); // Collect data every 100ms
    startTime = new Date().getTime();
    // updateUI(true);
  } catch (err) {
    console.log("Recording error:", err);
  }
};
