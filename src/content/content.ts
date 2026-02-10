import { EventTypes } from "../types";
let wheelTime: any;
let mousedownFlag = false;
function throttle(fn: Function, delay: number) {
  let lastCall = 0;

  return (...args: any) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(undefined, args);
    }
  };
}
function getXPath(el: any) {
  if (!el) return "";
  if (el?.id) return `//*[@id="${el.id}"]`;
  const parts = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = el.previousSibling;
    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        sibling.nodeName === el.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = el.nodeName.toLowerCase();
    parts.unshift(`${tagName}[${index}]`);
    el = el.parentNode;
  }
  return "/" + parts.join("/");
}

// Record mouse down event
document.addEventListener("mousedown", function (e: MouseEvent) {
  console.log("mousedown");
  const time = new Date().getTime();
  const rarHtml = getDOMTree();
  mousedownFlag = true;
  try {
    chrome.runtime.sendMessage({
      action: "collectionTrigger",
      time: time,
      data: {
        type: EventTypes.MOUSE_DOWM,
        url: window.location.href,
        rawHtml: rarHtml,
        info: {
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          layerX: e.layerX,
          layerY: e.layerY,
          screenX: e.screenX,
          screenY: e.screenY,
          altKey: e.altKey,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey,
          target: {
            innerText: (e.target as HTMLElement)?.innerText?.slice(0, 10),
            className: (e.target as HTMLElement)?.className,
            xPath: getXPath(document.elementFromPoint(e.clientX, e.clientY)),
          },
        },
      },
    });
  } catch (e: any) {
    if (e.message.indexOf("Extension context invalidated") > -1) {
      window.alert("Please close the browser and reopen it to record again");
    }
  }
}, true);
document.addEventListener(
  "mousemove",
  throttle(function (e: MouseEvent) {
    if (!mousedownFlag) return;
    const time = new Date().getTime();
    console.log("drag");
    const rarHtml = getDOMTree();
    try {
      chrome.runtime.sendMessage({
        action: "collectionTrigger",
        time: time,
        data: {
          type: EventTypes.MOUSE_DRAG,
          url: window.location.href,
          rawHtml: rarHtml,
          info: {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
            layerX: e.layerX,
            layerY: e.layerY,
            screenX: e.screenX,
            screenY: e.screenY,
            altKey: e.altKey,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            target: {
              innerText: (e.target as HTMLElement)?.innerText?.slice(0, 10),
              className: (e.target as HTMLElement)?.className,
            },
          },
        },
      });
    } catch (e: any) {
      if (e.message.indexOf(" Extension context invalidated") > -1) {
        window.alert("Please close the browser and reopen it to record again");
      }
    }
  }, 400), true
);
document.addEventListener("mouseup", function (e: MouseEvent) {
  const time = new Date().getTime();
  const rarHtml = getDOMTree();
  mousedownFlag = false;
  try {
    chrome.runtime.sendMessage({
      action: "collectionTrigger",
      time: time,
      data: {
        type: EventTypes.MOUSE_UP,
        url: window.location.href,
        rawHtml: rarHtml,
        info: {
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          layerX: e.layerX,
          layerY: e.layerY,
          screenX: e.screenX,
          screenY: e.screenY,
          altKey: e.altKey,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey,
          target: {
            innerText: (e.target as HTMLElement)?.innerText?.slice(0, 10),
            className: (e.target as HTMLElement)?.className,
            xPath: getXPath(document.elementFromPoint(e.clientX, e.clientY)),
          },
        },
      },
    });
  } catch (e: any) {
      if (e.message.indexOf(" Extension context invalidated") > -1) {
        window.alert("Please close the browser and reopen it to record again");
      }
  }
}, true);

document.addEventListener("keydown", function (e: KeyboardEvent) {
  const time = new Date().getTime();
  try {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: "collectionTrigger",
        time,
        data: {
          url: window.location.href,
          type: EventTypes.KEY_DOWN,
          rawHtml: getDOMTree(),
          info: {
            data: e.key,
            key: e.key,
            code: e.code,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
          },
        },
      });
    }, 0);
  } catch (e: any) {
      if (e.message.indexOf(" Extension context invalidated") > -1) {
        window.alert("Please close the browser and reopen it to record again");
      }
  }
});
document.addEventListener("input", function (e: Event) {
  const time = new Date().getTime();
  try {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: "collectionTrigger",
        time: time,
        data: {
          url: window.location.href,
          type: EventTypes.INPUT,
          rawHtml: getDOMTree(),
          info: {
            data: (e as any).data,
            target: {
              id: (e.target as any)?.id,
              className: (e.target as any)?.className,
            },
          },
        },
      });
    });
  } catch (e: any) {
    if (e.message.indexOf(" Extension context invalidated") > -1) {
      window.alert("Please close the browser and reopen it to record again");
    }
  }
}, true);
document.addEventListener("wheel", function (e: WheelEvent) {
  clearTimeout(wheelTime);
  wheelTime = setTimeout(() => {
    const pageCode = getDOMTree();
    try {
      chrome.runtime.sendMessage({
        action: "collectionTrigger",
        time: new Date().getTime(),
        data: {
          url: window.location.href,
          type: EventTypes.WHEEL,
          rawHtml: pageCode,
          info: {
            clientX: e.clientX,
            clientY: e.clientY,
            pageX: e.pageX,
            pageY: e.pageY,
            layerX: e.layerX,
            layerY: e.layerY,
            screenX: e.screenX,
            screenY: e.screenY,
            altKey: e.altKey,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            target: {
              innertText: (e.target as any).innerText?.slice(0, 10),
              className: (e.target as any).className,
            },
          },
        },
      });
    } catch (e: any) {
      if (e.message.indexOf(" Extension context invalidated") > -1) {
        window.alert("Please close the browser and reopen it to record again");
      }
    }
  }, 500);
}, true);
document.addEventListener("contextmenu", function (e) {
  chrome.runtime.sendMessage({
    action: "collectionTrigger",
    time: new Date().getTime(),
    data: {
      url: window.location.href,
      type: EventTypes.CONTEXT_MENU,
      rawHtml: getDOMTree(),
      info: {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        layerX: e.layerX,
        layerY: e.layerY,
        screenX: e.screenX,
        screenY: e.screenY,
        altKey: e.altKey,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        target: {
          innertText: (e.target as any)?.innerText?.slice(0, 10),
          id: (e.target as any)?.id,
          className: (e.target as any)?.className,
          xPath: getXPath(document.elementFromPoint(e.clientX, e.clientY)),
        },
      },
    },
  });
}, true);

export function getDOMTree() {
  return document.documentElement.outerHTML
    .replace(/\s+/g, " ")
    .replace(/\s*(<|>|{|})\s*/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse: any) => {
  if (
    message.action === "resultState" &&
    window.location.href.split('#')[0] === message.url
  ) {
    chrome.runtime.sendMessage({
      action: "collectionTrigger",
      time: new Date().getTime(),
      data: {
        url: window.location.href,
        type: EventTypes.RESULT_STATE,
        rawHtml: getDOMTree(),
      },
    });
  }
  console.log(__APP_ENV__.url)
  if (
    message.action === "requestToken" &&
    window.location.href.includes(__APP_ENV__.domain)
  ) {
    const token = localStorage.getItem("TOKEN");
    sendResponse(token || "no token");
  }
  return false;
});
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .__xpath-highlight__ {
  outline: 0.5px solid rgba(0, 136, 255,.1) !important;
  
}

.__xpath-tooltip__ {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 999999;
  white-space: nowrap;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
}

  `;
  document.head.appendChild(style);
  let lastEl: any = null;
  const tooltip = document.createElement("div");
  tooltip.className = "__xpath-tooltip__";
  // document.body.appendChild(tooltip);

  document.addEventListener("mousemove", (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);

    if (!el || el === lastEl || el === tooltip) return;

    if (lastEl) lastEl.classList.remove("__xpath-highlight__");
    el.classList.add("__xpath-highlight__");
    lastEl = el;

    const xpath = getXPath(el);
    tooltip.textContent = xpath;
    tooltip.style.left = e.clientX + 12 + "px";
    tooltip.style.top = e.clientY + 12 + "px";
    tooltip.style.display = "block";
  });

  document.addEventListener("mouseout", (_e) => {
    if (lastEl) {
      lastEl.classList.remove("__xpath-highlight__");
      lastEl = null;
    }
    tooltip.style.display = "none";
  });

  document.addEventListener("mouseover", () => {
    tooltip.style.display = "block";
  });
})();