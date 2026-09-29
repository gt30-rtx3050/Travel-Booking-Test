import React from 'react'

interface LexicalNode {
  type?: string
  tag?: string
  format?: number | string
  text?: string
  listType?: 'bullet' | 'number' | 'check'
  url?: string
  fields?: {
    url?: string
    newTab?: boolean
  }
  children?: LexicalNode[]
}

interface LexicalDocument {
  root?: {
    children?: LexicalNode[]
  }
}

interface RichTextProps {
  content: LexicalDocument | Record<string, unknown> | string | null | undefined
  className?: string
  compact?: boolean
}

function renderInlineChildren(nodes?: LexicalNode[]): React.ReactNode {
  if (!nodes || !Array.isArray(nodes)) return null

  return nodes.map((node, index) => {
    if (node.type === 'text' || typeof node.text === 'string') {
      let element: React.ReactNode = node.text
      const fmt = typeof node.format === 'number' ? node.format : 0

      if (fmt & 1) {
        element = (
          <strong key={`b-${index}`} className="font-semibold text-navy">
            {element}
          </strong>
        )
      }
      if (fmt & 2) {
        element = <em key={`i-${index}`}>{element}</em>
      }
      if (fmt & 8) {
        element = <u key={`u-${index}`}>{element}</u>
      }
      return <React.Fragment key={index}>{element}</React.Fragment>
    }

    if (node.type === 'link') {
      const href = node.fields?.url || node.url || '#'
      return (
        <a
          key={index}
          href={href}
          target={node.fields?.newTab ? '_blank' : undefined}
          rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
          className="text-ocean underline decoration-sky underline-offset-4 transition-colors hover:text-cyan"
        >
          {renderInlineChildren(node.children)}
        </a>
      )
    }

    if (node.type === 'linebreak') {
      return <br key={index} />
    }

    if (node.children) {
      return <React.Fragment key={index}>{renderInlineChildren(node.children)}</React.Fragment>
    }

    return null
  })
}

export function RichText({ content, className = '', compact = false }: RichTextProps) {
  if (!content) return null

  if (typeof content === 'string') {
    return (
      <div className={`space-y-4 font-body text-navy ${className}`}>
        {content.split('\n\n').map((para, i) => (
          <p key={i} className={compact ? 'text-sm leading-relaxed' : 'text-base leading-relaxed'}>
            {para}
          </p>
        ))}
      </div>
    )
  }

  const doc = content as LexicalDocument
  const children = doc?.root?.children

  if (!children || !Array.isArray(children)) {
    return null
  }

  return (
    <div className={`compact-richtext space-y-4 font-body text-navy ${className}`}>
      {children.map((node, idx) => {
        switch (node.type) {
          case 'heading': {
            const tag = node.tag || 'h3'
            const headingContent = renderInlineChildren(node.children)
            if (tag === 'h1') {
              return (
                <h1 key={idx} className="font-heading text-3xl font-bold tracking-tight text-navy">
                  {headingContent}
                </h1>
              )
            }
            if (tag === 'h2') {
              return (
                <h2
                  key={idx}
                  className="pt-4 font-heading text-2xl font-bold tracking-tight text-navy"
                >
                  {headingContent}
                </h2>
              )
            }
            if (tag === 'h4') {
              return (
                <h4 key={idx} className="pt-2 font-heading text-lg font-semibold text-navy">
                  {headingContent}
                </h4>
              )
            }
            return (
              <h3 key={idx} className="pt-3 font-heading text-xl font-semibold text-navy">
                {headingContent}
              </h3>
            )
          }

          case 'list': {
            const isOrdered = node.listType === 'number' || node.tag === 'ol'
            const ListTag = isOrdered ? 'ol' : 'ul'
            return (
              <ListTag
                key={idx}
                className={`space-y-2 pl-5 ${isOrdered ? 'list-decimal' : 'list-disc'} marker:text-ocean`}
              >
                {(node.children || []).map((li, liIdx) => (
                  <li
                    key={liIdx}
                    className={
                      compact
                        ? 'text-sm leading-relaxed text-navy'
                        : 'text-base leading-relaxed text-navy'
                    }
                  >
                    {renderInlineChildren(li.children)}
                  </li>
                ))}
              </ListTag>
            )
          }

          case 'quote': {
            return (
              <blockquote
                key={idx}
                className="my-6 border-l border-ocean bg-ice/60 px-6 py-4 font-heading text-lg text-navy"
              >
                {renderInlineChildren(node.children)}
              </blockquote>
            )
          }

          case 'paragraph':
          default: {
            return (
              <p
                key={idx}
                className={
                  compact
                    ? 'text-sm leading-relaxed text-navy'
                    : 'text-base leading-relaxed text-navy'
                }
              >
                {renderInlineChildren(node.children)}
              </p>
            )
          }
        }
      })}
    </div>
  )
}
