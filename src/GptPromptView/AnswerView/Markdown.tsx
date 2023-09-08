import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula as codeStyle } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";
import { Spacer } from "../../utils/Spacer";

export const Markdown: React.FC<{ children: string }> = (props) => {
  return (
    <div>
      <Spacer height={1} />
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        children={props.children}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const _children = String(children)
              .replace(/^\n/, "")
              .replace(/\n$/, "");
            return !inline ? (
              <SyntaxHighlighter
                {...props}
                language={match?.[1] || ""}
                style={codeStyle}
              >
                {_children}
              </SyntaxHighlighter>
            ) : (
              <code
                {...props}
                className={className}
                style={{
                  padding: ".2em .4em",
                  whiteSpace: "break-spaces",
                  backgroundColor: "rgba(175,184,193,0.2)",
                  borderRadius: "6px",
                }}
              >
                {_children}
              </code>
            );
          },
          blockquote(props) {
            return (
              <blockquote
                {...props}
                style={{
                  wordWrap: "break-word",
                  margin: "0",
                  color: "#57606a",
                  borderLeft: "4px solid #d0d7de",
                  padding: "1px 1em",
                }}
              />
            );
          },
        }}
      />
      <Spacer height={1} />
    </div>
  );
};
