import { useEffect } from "react";

const DEFAULT_TITLE = "E-Library";

const setMetaTag = (name, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

/**
 * Sets the browser tab title and meta description for as long as the
 * calling page is mounted, then restores the app default. This is a
 * client-side-only update — it improves the tab/bookmark title and
 * the description a signed-in user sees, but it does NOT make link
 * previews on Twitter/Discord/etc. show book-specific text, since
 * those crawlers never execute this app's JavaScript. True crawler-
 * visible Open Graph tags need server-side rendering or a
 * bot-detection middleware serving prerendered HTML — a deliberate
 * scope cut for this milestone, not an oversight.
 */
export const useDocumentMeta = ({ title, description }) => {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = `${title} — ${DEFAULT_TITLE}`;
    setMetaTag("description", description);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
};
