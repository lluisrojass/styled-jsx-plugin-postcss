const loopWhile = require('deasync').loopWhile
const processor = require('./processor')

module.exports = (css, settings) => {
  const cssWithVariablePlaceholders = css.replace(
    /[:+\-*\,\/a-z(]\s*(%%styled-jsx-placeholder=(\d+)%%)/gi,
    (match, nativePlaceholder, id) => 
      match.replace(nativePlaceholder, `var(--styled-jsx-placeholder-${id})`) 
  );
  
  const cssWithCommentPlaceholders = cssWithVariablePlaceholders
    .replace(/%%styled-jsx-placeholder-(\d+)%%/g, (_, id) =>
      `/*%%styled-jsx-placeholder-${id}%%*/`
    )
  let processedCss
  let wait = true

  function resolved(result) {
    processedCss = result
    wait = false
  }

  processor(cssWithCommentPlaceholders)
    .then(resolved)
    .catch(resolved)
  loopWhile(() => wait)

  if (processedCss instanceof Error || processedCss.name === 'CssSyntaxError') {
    throw processedCss
  }

  return processedCss
    .replace(
      /var\(--styled-jsx-placeholder-(\d+)\)/g,
      (_,id) => `%%styled-jsx-placeholder-${id}%%`
    )
    .replace(
      /\/\*%%styled-jsx-placeholder-(\d+)%%\*\//g, 
      (_, id) => `%%styled-jsx-placeholder-${id}%%`
    )
}
