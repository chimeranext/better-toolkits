-- Optional Pandoc filter: turn trailing ^block-id markers into LaTeX labels.
-- Useful when source notes use block anchors; safe no-op on plain Markdown.

local function take_block_id(inlines)
  local count = #inlines
  if count == 0 or inlines[count].t ~= "Str" then
    return nil
  end
  local id = inlines[count].text:match("^%^([%w%-]+)$")
  if not id then
    return nil
  end
  local last = count - 1
  if last > 0 and inlines[last].t == "Space" then
    last = last - 1
  end
  local kept = pandoc.List()
  for index = 1, last do
    kept:insert(inlines[index])
  end
  return id, kept
end

local function tag_block(el)
  if not el.content then
    return nil
  end
  local id, kept = take_block_id(el.content)
  if not id then
    return nil
  end
  kept:insert(1, pandoc.RawInline("latex", "\\hypertarget{" .. id .. "}{}\\label{" .. id .. "}"))
  if el.t == "Plain" then
    return pandoc.Plain(kept)
  end
  return pandoc.Para(kept)
end

return {
  {
    Para = tag_block,
    Plain = tag_block,
  },
}
