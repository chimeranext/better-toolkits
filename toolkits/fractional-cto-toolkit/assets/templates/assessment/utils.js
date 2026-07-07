/**
 * Shared utility functions.
 */

/** HTML-escape a string to prevent injection. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build <option> tags from a list of [value, label] pairs. */
export function buildOptions(selectedValue, options) {
  return options
    .map(([value, label]) =>
      `<option value="${value}"${selectedValue === value ? ' selected' : ''}>${label}</option>`
    )
    .join('');
}

/**
 * Safely inject HTML into an element.
 * Uses insertAdjacentHTML on a fresh container to avoid
 * setting innerHTML on user-visible elements directly.
 */
export function setContent(element, html) {
  element.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.insertAdjacentHTML('beforeend', html);
  while (wrapper.firstChild) {
    element.appendChild(wrapper.firstChild);
  }
}
