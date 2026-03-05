let text = "```html\n<dmz_artifact type=\"html\" filename=\"w.html\" title=\"T\">\n<!DOCTYPE html>\n<html></html>\n</dmz_artifact>\n```";

// Clean:
let remaining = text.replace(/```[a-zA-Z]*\s*\n*(<dmz_artifact[\s\S]*?(?:<\/dmz_artifact>|$))\n*\s*(?:```|$)/g, '$1');

console.log("REMAINING:", remaining);
