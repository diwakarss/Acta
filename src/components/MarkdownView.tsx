import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useMarkdown } from '../hooks';
import { MarkdownElement, InlineElement, MarkdownStyles } from '../hooks/useMarkdown';

interface MarkdownViewProps {
  content: string;
  scrollable?: boolean;
  style?: object;
}

/**
 * A component for rendering markdown content
 * @param content The markdown content to render
 * @param scrollable Whether the content should be scrollable
 * @param style Additional styles to apply to the container
 */
const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  scrollable = false,
  style = {},
}) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const { parseMarkdown, styles } = useMarkdown(isDarkMode);
  
  // Parse the markdown content
  const parsedMarkdown = parseMarkdown(content);
  
  // Render inline markdown elements
  const renderInlineElements = (inlineElements: InlineElement[]): React.ReactNode => {
    if (!inlineElements || !inlineElements.length) return null;
    
    return inlineElements.map((element, index) => {
      switch (element.type) {
        case 'text':
          return <Text key={index.toString()}>{element.content as string}</Text>;
        case 'strong':
          return (
            <Text key={index.toString()} style={styles.strong}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'em':
          return (
            <Text key={index.toString()} style={styles.em}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'del':
          return (
            <Text key={index.toString()} style={styles.del}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'code':
          return (
            <Text key={index.toString()} style={styles.code}>
              {element.content as string}
            </Text>
          );
        case 'link':
          return (
            <Text key={index.toString()} style={styles.link}>
              {element.text}
            </Text>
          );
        default:
          return null;
      }
    });
  };
  
  // Render markdown elements
  const renderMarkdown = (elements: MarkdownElement[]): React.ReactNode => {
    if (!elements || !elements.length) return null;
    
    return elements.map((element, index) => {
      switch (element.type) {
        case 'paragraph':
          return (
            <View key={index.toString()} style={styles.paragraph}>
              {renderInlineElements(element.content as InlineElement[])}
            </View>
          );
        case 'heading1':
          return (
            <Text key={index.toString()} style={styles.heading1}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'heading2':
          return (
            <Text key={index.toString()} style={styles.heading2}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'heading3':
          return (
            <Text key={index.toString()} style={styles.heading3}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'heading4':
          return (
            <Text key={index.toString()} style={styles.heading4}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'heading5':
          return (
            <Text key={index.toString()} style={styles.heading5}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'heading6':
          return (
            <Text key={index.toString()} style={styles.heading6}>
              {renderInlineElements(element.content as InlineElement[])}
            </Text>
          );
        case 'blockquote':
          return (
            <View key={index.toString()} style={styles.blockquote}>
              {renderInlineElements(element.content as InlineElement[])}
            </View>
          );
        case 'unorderedListItem':
          return (
            <View key={index.toString()} style={styles.listItem}>
              <Text>•</Text>
              <View style={styles.listItemContent}>
                {renderInlineElements(element.content as InlineElement[])}
              </View>
            </View>
          );
        case 'orderedListItem':
          return (
            <View key={index.toString()} style={styles.listItem}>
              <Text>{element.number}.</Text>
              <View style={styles.listItemContent}>
                {renderInlineElements(element.content as InlineElement[])}
              </View>
            </View>
          );
        case 'codeBlock':
          return (
            <View key={index.toString()} style={styles.codeBlock}>
              <Text>{element.content as string}</Text>
            </View>
          );
        case 'hr':
          return <View key={index.toString()} style={styles.hr} />;
        case 'emptyLine':
          return <View key={index.toString()} style={{ height: 8 }} />;
        default:
          return null;
      }
    });
  };
  
  // Render the content with or without scrolling
  const renderedMarkdown = renderMarkdown(parsedMarkdown);
  
  if (scrollable) {
    return (
      <ScrollView style={[componentStyles.container, style]}>
        {renderedMarkdown}
      </ScrollView>
    );
  }
  
  return (
    <View style={[componentStyles.container, style]}>
      {renderedMarkdown}
    </View>
  );
};

const componentStyles = StyleSheet.create({
  container: {
    padding: 8,
  },
});

export default MarkdownView; 