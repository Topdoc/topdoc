fs = require('fs')
cssParse = require('css-parse')
path = require('path')
read = fs.readFileSync


class Topdocument
  constructor: (sourcePath, template=null) ->
    @sourcePath = sourcePath
    @template = template ? path.join 'lib', 'template.jade'
    @cssParseResults = @cssParse()
    @results = @topdocParse()
  cssParse: ->
    @source = read(@sourcePath, 'utf8')
    return cssParse(read(@sourcePath, 'utf8'), { position: true })
  topdocParse: ->
    sourceLines = @source.split(/\n/g)
    @validRegEx = /^\n*\s*((?:\w| )*)\n\s*-{2,}\s/
    results =
      title: @titlify(path.basename(@sourcePath))
      filename: path.basename(@sourcePath)
      source: @sourcePath
      template: @template
      components: []
    rules = @cssParseResults.stylesheet.rules
    for listItem, i in rules
      if @isValidComment(listItem)
        startCSSPos = listItem.position.end
        endCSSPos = null
        for nextItem in [i+1..rules.length] by 1
          if @isValidComment(rules[nextItem])
            endCSSPos = rules[nextItem].position.start
            break
        if endCSSPos
          cssLines = sourceLines.slice(startCSSPos.line, endCSSPos.line-1)
        else 
          cssLines = sourceLines.slice(startCSSPos.line)
        css = cssLines.join('\n')
        name = @validRegEx.exec(listItem.comment)[1].trim()
        details = listItem.comment.replace(@validRegEx, '')
        details = details.substring(0, details.indexOf('  ')).trim()
        details = details.replace(/(\n)+ ?/g, '\n')
        examples = listItem.comment.split('  ')[1..]
        html = ''
        for example in examples
          html += example
        component =
          name: name
          slug: @slugify(name)
          details: details
          html: html.trim()
          css: css
        results.components.push component
    return results
  isValidComment: (comment)->
    if comment and comment.type is "comment"
      commentMatch = @validRegEx.exec(comment.comment)
      if commentMatch
        return true
    return false
  slugify: (title)->
    slug = title.toLowerCase()
    spaceRegex = /( +)/
    slug = slug.replace(spaceRegex, "-")
    nonWordRegex = /([^\w-]+)/
    slug = slug.replace(nonWordRegex, "")
    return slug
  titlify: (slug)->
    title = slug.replace(/-/g, ' ')
    if title.indexOf('.css') is title.length - 4
      title = title.replace('.css', '')
    title = title.replace /\w\S*/g, (txt)->
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    return title

module.exports = Topdocument