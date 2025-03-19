import { useState, useEffect } from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// Define types for markdown elements
export type MarkdownStyles = {
  paragraph: ViewStyle;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  heading4: TextStyle;
  heading5: TextStyle;
  heading6: TextStyle;
  strong: TextStyle;
  em: TextStyle;
  u: TextStyle;
  del: TextStyle;
  link: TextStyle;
  blockquote: ViewStyle;
  code: TextStyle;
  codeBlock: ViewStyle;
  listItem: ViewStyle;
  orderedList: ViewStyle;
  unorderedList: ViewStyle;
  listItemContent: ViewStyle;
  hr: ViewStyle;
};

// Define types for parsed markdown elements
export type InlineElement = {
  type: string;
  content?: string | InlineElement[];
  text?: string;
  url?: string;
  number?: number;
};

export type MarkdownElement = {
  type: string;
  content?: string | InlineElement[];
  number?: number;
};

// Define return type for the hook
export type UseMarkdownReturn = {
  parseMarkdown: (text: string) => MarkdownElement[];
  styles: MarkdownStyles;
};

/**
 * A hook for parsing markdown text
 * @param isDarkMode Whether the app is in dark mode
 * @returns Markdown parsing functions and styles
 */
export function useMarkdown(isDarkMode: boolean = false): UseMarkdownReturn {
  // Generate styles based on dark mode
  const getStyles = (): MarkdownStyles => {
    const baseTextColor = isDarkMode ? '#FFFFFF' : '#000000';
    const codeBackgroundColor = isDarkMode ? '#2D2D2D' : '#F0F0F0';
    const blockquoteColor = isDarkMode ? '#555555' : '#EEEEEE';
    const linkColor = isDarkMode ? '#90CAF9' : '#2196F3';
    
    return StyleSheet.create({
      paragraph: {
        marginVertical: 8,
        lineHeight: 20,
        color: baseTextColor,
      },
      heading1: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 12,
        color: baseTextColor,
      },
      heading2: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: baseTextColor,
      },
      heading3: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 8,
        color: baseTextColor,
      },
      heading4: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
        color: baseTextColor,
      },
      heading5: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
        color: baseTextColor,
      },
      heading6: {
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 8,
        color: baseTextColor,
      },
      strong: {
        fontWeight: 'bold',
      },
      em: {
        fontStyle: 'italic',
      },
      u: {
        textDecorationLine: 'underline',
      },
      del: {
        textDecorationLine: 'line-through',
      },
      link: {
        color: linkColor,
        textDecorationLine: 'underline',
      },
      blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: blockquoteColor,
        paddingLeft: 12,
        marginVertical: 8,
      },
      code: {
        fontFamily: 'monospace',
        backgroundColor: codeBackgroundColor,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 3,
      },
      codeBlock: {
        fontFamily: 'monospace',
        backgroundColor: codeBackgroundColor,
        padding: 8,
        borderRadius: 4,
        marginVertical: 8,
      },
      listItem: {
        flexDirection: 'row',
        marginVertical: 4,
      },
      orderedList: {
        marginLeft: 16,
        marginVertical: 8,
      },
      unorderedList: {
        marginLeft: 16,
        marginVertical: 8,
      },
      listItemContent: {
        flex: 1,
        marginLeft: 8,
      },
      hr: {
        height: 1,
        backgroundColor: isDarkMode ? '#555555' : '#DDDDDD',
        marginVertical: 16,
      },
    }) as MarkdownStyles;
  };
  
  // Initialize styles
  const [styles, setStyles] = useState<MarkdownStyles>(getStyles());
  
  // Update styles when dark mode changes
  useEffect(() => {
    setStyles(getStyles());
  }, [isDarkMode]);
  
  /**
   * Parse markdown text into a structured format
   * @param text Markdown text to parse
   * @returns Parsed markdown structure
   */
  const parseMarkdown = (text: string): MarkdownElement[] => {
    if (!text) return [];
    
    // Split text into lines
    const lines = text.split('\n');
    const parsedLines: MarkdownElement[] = [];
    
    let inCodeBlock = false;
    let codeBlockContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          parsedLines.push({
            type: 'codeBlock',
            content: codeBlockContent,
          });
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }
      
      // Handle headings
      if (line.startsWith('# ')) {
        parsedLines.push({
          type: 'heading1',
          content: parseInlineMarkdown(line.substring(2)),
        });
      } else if (line.startsWith('## ')) {
        parsedLines.push({
          type: 'heading2',
          content: parseInlineMarkdown(line.substring(3)),
        });
      } else if (line.startsWith('### ')) {
        parsedLines.push({
          type: 'heading3',
          content: parseInlineMarkdown(line.substring(4)),
        });
      } else if (line.startsWith('#### ')) {
        parsedLines.push({
          type: 'heading4',
          content: parseInlineMarkdown(line.substring(5)),
        });
      } else if (line.startsWith('##### ')) {
        parsedLines.push({
          type: 'heading5',
          content: parseInlineMarkdown(line.substring(6)),
        });
      } else if (line.startsWith('###### ')) {
        parsedLines.push({
          type: 'heading6',
          content: parseInlineMarkdown(line.substring(7)),
        });
      }
      // Handle blockquotes
      else if (line.startsWith('> ')) {
        parsedLines.push({
          type: 'blockquote',
          content: parseInlineMarkdown(line.substring(2)),
        });
      }
      // Handle unordered lists
      else if (line.match(/^[\*\-\+]\s/)) {
        parsedLines.push({
          type: 'unorderedListItem',
          content: parseInlineMarkdown(line.substring(2)),
        });
      }
      // Handle ordered lists
      else if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^(\d+)\.\s(.*)/);
        if (match) {
          parsedLines.push({
            type: 'orderedListItem',
            number: parseInt(match[1]),
            content: parseInlineMarkdown(match[2]),
          });
        }
      }
      // Handle horizontal rule
      else if (line.match(/^[\*\-\_]{3,}$/)) {
        parsedLines.push({
          type: 'hr',
        });
      }
      // Handle paragraphs
      else if (line.trim() !== '') {
        parsedLines.push({
          type: 'paragraph',
          content: parseInlineMarkdown(line),
        });
      }
      // Handle empty lines
      else {
        parsedLines.push({
          type: 'emptyLine',
        });
      }
    }
    
    // Handle any remaining code block
    if (inCodeBlock && codeBlockContent) {
      parsedLines.push({
        type: 'codeBlock',
        content: codeBlockContent,
      });
    }
    
    return parsedLines;
  };
  
  /**
   * Parse inline markdown elements (bold, italic, etc.)
   * @param text Text to parse for inline markdown
   * @returns Array of parsed inline elements
   */
  const parseInlineMarkdown = (text: string): InlineElement[] => {
    if (!text) return [];
    
    const elements: InlineElement[] = [];
    let currentText = '';
    
    // Helper to add current text as a regular text element
    const addCurrentText = () => {
      if (currentText) {
        elements.push({
          type: 'text',
          content: currentText,
        });
        currentText = '';
      }
    };
    
    // Process text character by character
    for (let i = 0; i < text.length; i++) {
      // Bold (double asterisk or underscore)
      if ((text[i] === '*' || text[i] === '_') && 
          i + 1 < text.length && 
          text[i + 1] === text[i]) {
        const marker = text[i];
        addCurrentText();
        
        // Find closing marker
        let boldText = '';
        let j = i + 2;
        while (j < text.length - 1 && 
               !(text[j] === marker && text[j + 1] === marker)) {
          boldText += text[j];
          j++;
        }
        
        if (j < text.length - 1) {
          elements.push({
            type: 'strong',
            content: parseInlineMarkdown(boldText),
          });
          i = j + 1; // Skip to after closing marker
        } else {
          currentText += marker + marker;
          i = i + 1;
        }
      }
      // Italic (single asterisk or underscore)
      else if ((text[i] === '*' || text[i] === '_') && 
               (i === 0 || text[i - 1] !== text[i]) && 
               (i + 1 < text.length && text[i + 1] !== text[i])) {
        const marker = text[i];
        addCurrentText();
        
        // Find closing marker
        let italicText = '';
        let j = i + 1;
        while (j < text.length && text[j] !== marker) {
          italicText += text[j];
          j++;
        }
        
        if (j < text.length) {
          elements.push({
            type: 'em',
            content: parseInlineMarkdown(italicText),
          });
          i = j; // Skip to after closing marker
        } else {
          currentText += marker;
        }
      }
      // Strikethrough (double tilde)
      else if (text[i] === '~' && 
               i + 1 < text.length && 
               text[i + 1] === '~') {
        addCurrentText();
        
        // Find closing marker
        let strikethroughText = '';
        let j = i + 2;
        while (j < text.length - 1 && 
               !(text[j] === '~' && text[j + 1] === '~')) {
          strikethroughText += text[j];
          j++;
        }
        
        if (j < text.length - 1) {
          elements.push({
            type: 'del',
            content: parseInlineMarkdown(strikethroughText),
          });
          i = j + 1; // Skip to after closing marker
        } else {
          currentText += '~~';
          i = i + 1;
        }
      }
      // Inline code (backtick)
      else if (text[i] === '`') {
        addCurrentText();
        
        // Find closing marker
        let codeText = '';
        let j = i + 1;
        while (j < text.length && text[j] !== '`') {
          codeText += text[j];
          j++;
        }
        
        if (j < text.length) {
          elements.push({
            type: 'code',
            content: codeText, // Don't parse inline markdown in code
          });
          i = j; // Skip to after closing marker
        } else {
          currentText += '`';
        }
      }
      // Links [text](url)
      else if (text[i] === '[') {
        addCurrentText();
        
        // Find closing bracket
        let linkText = '';
        let j = i + 1;
        while (j < text.length && text[j] !== ']') {
          linkText += text[j];
          j++;
        }
        
        // Check if followed by opening parenthesis
        if (j < text.length && j + 1 < text.length && text[j + 1] === '(') {
          // Find closing parenthesis
          let linkUrl = '';
          let k = j + 2;
          while (k < text.length && text[k] !== ')') {
            linkUrl += text[k];
            k++;
          }
          
          if (k < text.length) {
            elements.push({
              type: 'link',
              text: linkText,
              url: linkUrl,
            });
            i = k; // Skip to after closing parenthesis
          } else {
            currentText += '[' + linkText + ']';
            i = j;
          }
        } else {
          currentText += '[' + linkText;
          i = j;
        }
      }
      // Regular text
      else {
        currentText += text[i];
      }
    }
    
    // Add any remaining text
    addCurrentText();
    
    return elements;
  };
  
  return {
    parseMarkdown,
    styles,
  };
} 