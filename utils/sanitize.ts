const ALLOWED_TAGS = new Set<string>([
  "a",
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "span",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "img",
  // Headings
  "h1",
  "h2",
  "h3",
  // Tables
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
  "*": new Set(["class"]),
};

function isAllowedTag(tagName: string) {
  return ALLOWED_TAGS.has(tagName);
}

function isAllowedAttr(tagName: string, attrName: string) {
  const allowed = ALLOWED_ATTRS[tagName] || ALLOWED_ATTRS["*"];
  return allowed.has(attrName);
}

function isSafeUrl(url: string, forImg = false) {
  try {
    const trimmed = url.trim();
    if (trimmed.startsWith("javascript:")) return false;
    if (trimmed.startsWith("data:")) {
      return forImg && /^data:image\//i.test(trimmed);
    }
    return /^(https?:|mailto:)/i.test(trimmed);
  } catch {
    return false;
  }
}

function cleanNode(node: Node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
    }

    if (!isAllowedTag(tag)) {
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      return;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!isAllowedAttr(tag, name)) {
        if (!(name === "class" && ALLOWED_ATTRS["*"].has("class"))) {
          el.removeAttribute(name);
          continue;
        }
      }

      const value = attr.value;
      if (tag === "a" && name === "href") {
        if (!isSafeUrl(value)) {
          el.removeAttribute("href");
        } else {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
          const existing = el.getAttribute("class") || "";
          const classes = new Set(existing.split(/\s+/).filter(Boolean));
          classes.add("desc-link");
          el.setAttribute("class", Array.from(classes).join(" "));
        }
      }
      if (tag === "img" && name === "src") {
        if (!isSafeUrl(value, true)) {
          el.removeAttribute("src");
        }
      }
    }

    for (const child of Array.from(el.childNodes)) cleanNode(child);
  } else if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node);
  } else {
  }
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  const container = document.createElement("div");
  container.innerHTML = input;
  for (const child of Array.from(container.childNodes)) {
    cleanNode(child);
  }
  return container.innerHTML;
}
