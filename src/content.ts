type Theme = "light" | "dark";

const ORIGINAL_BUTTON_TEXT = "Add Tags";

const styles = {
  light: {
    backgroundColor: "#ffffff",
    color: "#2c2d25",
    borderColor: "#eaeae9",
  },
  dark: {
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    borderColor: "#3e3e3e",
  },
};

function detectTheme(): Theme {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta instanceof HTMLMetaElement) {
    const themeColor = themeColorMeta.getAttribute("content");
    return themeColor === "#131313" ? "dark" : "light";
  }
  return "light";
}

function applyThemeStyles(element: HTMLElement, theme: Theme): void {
  const themeStyles = styles[theme];
  element.style.backgroundColor = themeStyles.backgroundColor;
  element.style.color = themeStyles.color;
  if (
    element instanceof HTMLSelectElement || element instanceof HTMLButtonElement
  ) {
    element.style.borderColor = themeStyles.borderColor;
  }
}

function waitForElement(selector: string): Promise<Element> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver((_mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

async function insertButtonOutsideForm(): Promise<void> {
  const tagInputElement = await waitForElement(".dqimQM") as HTMLInputElement;
  if (!tagInputElement) {
    console.error("not found tag input element");
    return;
  }

  const tagInputRect = tagInputElement.getBoundingClientRect();

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = `${tagInputRect.bottom + window.scrollY + 5}px`;
  container.style.left = `${tagInputRect.left + window.scrollX}px`;
  container.style.zIndex = "1000";
  container.style.display = "flex";
  container.style.marginTop = "10px";
  container.style.backgroundColor = "white";

  const select = document.createElement("select");
  styleSelectElement(select);
  loadDropdownOptions(select);

  const button = document.createElement("button");
  button.innerHTML = ORIGINAL_BUTTON_TEXT;
  styleButtonElement(button);

  button.addEventListener("click", (event) => {
    event.preventDefault();
    const selectedKey = select.value;
    chrome.storage.sync.get("data", (data) => {
      const inputStrings = data.data[selectedKey]
        ? data.data[selectedKey].split("\n")
        : [];
      addTags(inputStrings);
    });
  });

  container.appendChild(select);
  container.appendChild(button);
  document.body.appendChild(container);

  const updatePosition = () => {
    const tagInputRect = tagInputElement.getBoundingClientRect();
    container.style.top = `${tagInputRect.bottom + window.scrollY + 5}px`;
    container.style.left = `${tagInputRect.left + window.scrollX}px`;
  };

  // Apply initial theme
  const initialTheme = detectTheme();
  applyThemeStyles(container, initialTheme);
  applyThemeStyles(select, initialTheme);
  applyThemeStyles(button, initialTheme);

  // Watch for theme changes
  const themeObserver = new MutationObserver(() => {
    const newTheme = detectTheme();
    applyThemeStyles(container, newTheme);
    applyThemeStyles(select, newTheme);
    applyThemeStyles(button, newTheme);
  });

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeObserver.observe(themeColorMeta, { attributes: true });
  }

  // resize window event listener
  window.addEventListener("resize", updatePosition);

  const observer = new MutationObserver(updatePosition);
  observer.observe(document.body, { childList: true, subtree: true });
}

function styleSelectElement(select: HTMLSelectElement): void {
  select.style.alignItems = "center";
  select.style.border = "1px solid #eaeae9";
  select.style.display = "flex";
  select.style.width = "150px";
  select.style.height = "40px";
  select.style.padding = "6px 12px";
  select.style.fontSize = "14px";
  select.style.fontWeight = "700";
  select.style.marginRight = "10px";
  select.style.borderRadius = "4px";
  select.style.outline = "none";
}

function styleButtonElement(button: HTMLButtonElement): void {
  button.style.alignItems = "center";
  button.style.border = "1px solid #eaeae9";
  button.style.display = "flex";
  button.style.width = "150px";
  button.style.height = "40px";
  button.style.padding = "6px 12px";
  button.style.fontSize = "14px";
  button.style.fontWeight = "700";
  button.style.backgroundColor = "#ffffff";
  button.style.cursor = "pointer";
  button.style.borderRadius = "4px";
  button.style.outline = "none";
}

function loadDropdownOptions(select: HTMLSelectElement): void {
  chrome.storage.sync.get("data", (result) => {
    const data = result.data || {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const option = document.createElement("option");
        option.value = key;
        option.text = key;
        select.appendChild(option);
      }
    }
  });
}

async function addTags(inputStrings: string[]): Promise<void> {
  const tagContainer = await waitForElement(
    ".sc-1vhg2oa-1.bMqxZS",
  ) as HTMLElement;
  const inputField = tagContainer.querySelector("input") as HTMLInputElement;

  if (!tagContainer || !inputField) {
    console.error("Required elements not found!");
    return;
  }

  for (const tagText of inputStrings) {
    // Create tag element
    const tagDiv = document.createElement("div");
    tagDiv.className = "sc-1vhg2oa-0 fANqfz";

    const tagContent = document.createElement("p");
    tagContent.className = "sc-iqseJM jRXDtE";
    tagContent.textContent = tagText;

    const deleteButton = document.createElement("div");
    deleteButton.className = "sc-1vhg2oa-2 fupygd";
    deleteButton.innerHTML =
      '<span aria-hidden="true" class="sc-dkPtRN gNfasH"><svg data-tag="IconClose" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m4.76 6.88 2.294 2.295 2.294 2.295c.191.19.286.36.286.53 0 .17-.095.34-.286.53l-2.294 2.295-2.294 2.294c-.423.423-.635.742-.635 1.06 0 .32.212.638.635 1.061.423.423.741.635 1.06.635.32 0 .638-.212 1.06-.635l2.295-2.294 2.295-2.294c.19-.191.36-.286.53-.286.17 0 .34.095.53.286l2.295 2.294 2.294 2.294c.423.423.742.635 1.06.635.32 0 .639-.212 1.062-.635.422-.423.634-.741.634-1.06 0-.32-.212-.638-.634-1.061l-2.295-2.294-2.294-2.295c-.191-.19-.286-.36-.286-.53 0-.17.095-.34.286-.53l2.294-2.295 2.294-2.294c.424-.423.635-.742.635-1.06 0-.32-.212-.638-.634-1.061-.424-.423-.742-.635-1.061-.635-.32 0-.638.212-1.06.635l-2.295 2.294-2.295 2.294c-.19.191-.36.286-.53.286-.17 0-.34-.095-.53-.286L9.175 7.054 6.881 4.76c-.423-.423-.742-.635-1.06-.635-.32 0-.638.212-1.061.635-.423.423-.635.741-.635 1.06 0 .32.212.638.635 1.06"></path></svg></span>';

    deleteButton.addEventListener("click", () => {
      tagContainer.removeChild(tagDiv);
    });

    tagDiv.appendChild(tagContent);
    tagDiv.appendChild(deleteButton);

    // Simulate user input
    inputField.value = tagText;
    inputField.dispatchEvent(new Event("input", { bubbles: true }));
    inputField.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    // Wait for potential asynchronous operations
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Clear the input field
  inputField.value = "";

  // Dispatch a custom event to notify any potential listeners
  const event = new CustomEvent("tagsUpdated", { detail: inputStrings });
  tagContainer.dispatchEvent(event);
}

// Set up a MutationObserver to watch for changes in the tag container
const tagContainer = document.querySelector(".sc-1vhg2oa-1.bMqxZS");
if (tagContainer) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        console.log("Tags have been updated");
      }
    });
  });

  observer.observe(tagContainer, { childList: true, subtree: true });
}

insertButtonOutsideForm();
