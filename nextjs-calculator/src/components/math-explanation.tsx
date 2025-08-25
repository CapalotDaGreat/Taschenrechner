import React from "react";

interface MathExplanationProps {
  explanation: string;
}

export function MathExplanation({ explanation }: MathExplanationProps) {
  // Function to convert markdown-like math formatting to HTML
  const formatMathExplanation = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const formattedLines: React.ReactNode[] = [];
    
    let inList = false;
    let listItems: string[] = [];
    let inMathBlock = false;
    let mathBlockContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (line === '') {
        // If we're in a list, close it
        if (inList && listItems.length > 0) {
          formattedLines.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-3 space-y-1">
              {listItems.map((item, idx) => (
                <li key={`item-${i}-${idx}`} className="mb-1">{formatInlineMath(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        continue;
      }
      
      // Handle math block start
      if (line.startsWith('\\[')) {
        if (inList && listItems.length > 0) {
          formattedLines.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-3 space-y-1">
              {listItems.map((item, idx) => (
                <li key={`item-${i}-${idx}`} className="mb-1">{formatInlineMath(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        inMathBlock = true;
        mathBlockContent = [];
        continue;
      }
      
      // Handle math block end
      if (line.startsWith('\\]')) {
        inMathBlock = false;
        formattedLines.push(
          <div key={`math-block-${i}`} className="math-formula-block my-3 p-3 bg-muted rounded">
            {mathBlockContent.map((content, idx) => (
              <div key={`math-line-${idx}`} className="math-formula-line">
                {content}
              </div>
            ))}
          </div>
        );
        mathBlockContent = [];
        continue;
      }
      
      // Handle math block content
      if (inMathBlock) {
        mathBlockContent.push(line);
        continue;
      }
      
      // Handle markdown headers
      if (line.startsWith('###')) {
        if (inList && listItems.length > 0) {
          formattedLines.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-3 space-y-1">
              {listItems.map((item, idx) => (
                <li key={`item-${i}-${idx}`} className="mb-1">{formatInlineMath(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        formattedLines.push(
          <h3 key={`h3-${i}`} className="font-bold text-lg mt-4 mb-2 text-primary">
            {line.substring(3).trim()}
          </h3>
        );
      }
      // Handle markdown subheaders (####)
      else if (line.startsWith('####')) {
        if (inList && listItems.length > 0) {
          formattedLines.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-3 space-y-1">
              {listItems.map((item, idx) => (
                <li key={`item-${i}-${idx}`} className="mb-1">{formatInlineMath(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        formattedLines.push(
          <h4 key={`h4-${i}`} className="font-semibold text-md mt-3 mb-2">
            {line.substring(4).trim()}
          </h4>
        );
      }
      // Handle list items
      else if (line.startsWith('-')) {
        if (!inList) {
          inList = true;
        }
        listItems.push(line.substring(1).trim());
      }
      // Handle numbered lists (for steps)
      else if (/^\d+\./.test(line)) {
        if (!inList) {
          inList = true;
        }
        listItems.push(line.replace(/^\d+\.\s*/, '').trim());
      }
      // Handle regular paragraphs
      else {
        if (inList && listItems.length > 0) {
          formattedLines.push(
            <ul key={`list-${i}`} className="list-disc pl-6 mb-3 space-y-1">
              {listItems.map((item, idx) => (
                <li key={`item-${i}-${idx}`} className="mb-1">{formatInlineMath(item)}</li>
              ))}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        formattedLines.push(
          <p key={`p-${i}`} className="mb-3">
            {formatInlineMath(line)}
          </p>
        );
      }
    }
    
    // Close any open list
    if (inList && listItems.length > 0) {
      formattedLines.push(
        <ul key="final-list" className="list-disc pl-6 mb-3 space-y-1">
          {listItems.map((item, idx) => (
            <li key={`final-item-${idx}`} className="mb-1">{formatInlineMath(item)}</li>
          ))}
        </ul>
      );
    }
    
    return formattedLines;
  };

  // Function to format inline math expressions
  const formatInlineMath = (text: string): React.ReactNode => {
    // Handle inline math expressions \( ... \)
    const parts = text.split(/(\\\([^)]*\\\))/);
    
    return parts.map((part, index) => {
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const mathContent = part.substring(2, part.length - 2);
        return (
          <span key={`math-${index}`} className="math-formula font-mono bg-muted px-1 py-0.5 rounded">
            {mathContent}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="math-explanation">
      {formatMathExplanation(explanation)}
    </div>
  );
}