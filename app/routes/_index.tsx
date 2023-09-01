import type { V2_MetaFunction } from "@remix-run/node";
import * as React from "react";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

const lineBreak = "\r\n";
// 1 indexed
function emptyFromEnd(item: LazyListItem, numberOfLinesFromEnd: number): boolean {
  const textLines = item.textLines;
  return (
    textLines.length >= numberOfLinesFromEnd &&
    textLines[textLines.length - numberOfLinesFromEnd].length === 0
  );
}

const ITEM_TYPE_SYMBOL_LENGTH = 3;
const ITEM_TYPE_SYMBOL_MARGIN = " ";
const ITEM_LINE_PADDING = "   ";
const EMPTY_LINES = [""];

function printItemType(itemType?: LazyListItemType): string {
  switch (itemType) {
    case LazyListItemType.DONE:
      return '[x]';
  case LazyListItemType.OPEN: 
    return '[_]';
  default:
    return '';
  }
}

function trimLines(lines: string[]): string[] {
  return lines.map((line: string) => {
    return line.trimStart();
  });
}

function parseLazyListItemLine(line: string): LazyListItem {
  for (const itemTypeSymbol of Object.values(LazyListItemType)) {
    if (line.indexOf(itemTypeSymbol) === 0) {
      return { type: itemTypeSymbol, textLines: trimLines([line.substring(ITEM_TYPE_SYMBOL_LENGTH)])}
    }
  }

  return { type: LazyListItemType.NONE, textLines: [line] };
}

function isEmpty(item: LazyListItem): boolean {
  return item.textLines.filter((line: string) => {
    return line.length === 1 && item.textLines[0] === '';
  }).length === 0;
} 

function addNewItem(ll: LazyList, newItem: LazyListItem): LazyList {
  const lastItem = ll[ll.length - 1];
  // replace last item with new item if empty
  if (lastItem.type === LazyListItemType.NONE && isEmpty(lastItem)) {
    return [...ll.slice(0,-1), newItem]
  } else {
    // Add new item
    lastItem.textLines = lastItem.textLines.slice(0,-2);
    return [...ll, newItem];
  }
}

enum LazyListItemType {
  OPEN = "[_]", DONE = "[x]", NONE = ""
}

interface LazyListItem {
  textLines: string[];
  type: LazyListItemType;
}

type LazyList = LazyListItem[];

export default function Index() {
  const [lines, setLines] = React.useState<LazyList>([{ textLines: EMPTY_LINES, type: LazyListItemType.NONE }]);

  const parse = (text: string): LazyList => {
    const realLines = text.split(/\r?\n|\r|\n/g);
    console.log(realLines);

    const lazyList = realLines.reduce(
      (acc: LazyList, currentRealLine: string) => {
        const currentItem = acc[acc.length - 1];

        const parsedLine = parseLazyListItemLine(currentRealLine);
        if (parsedLine.type === LazyListItemType.NONE) {
          // Create new item
          if (
            (!currentRealLine || currentRealLine.length === 0) && emptyFromEnd(currentItem, 1) && emptyFromEnd(currentItem, 2)
          ) {
            const newItem = {textLines: EMPTY_LINES, type: LazyListItemType.OPEN};
            return addNewItem(acc, newItem);
          } else {
            currentItem.textLines.push(currentRealLine);
            return acc;
          }
        } else {
            return addNewItem(acc, parsedLine);
        }
      },
      [{ textLines: [], type: LazyListItemType.NONE }]
    );
    return lazyList;
  };

  const printLines = (ll: LazyList) => {
    console.info("print the lines", lines);
    return ll
      .map((item: LazyListItem) => {
        return printItemType(item.type) + item.textLines.join(lineBreak);
      })
      .join(lineBreak);
  };

  return (
    <div className="App">
      <textarea
      placeholder="testtest \n hthth"
        value={printLines(lines)}
        onChange={(event) => {
          event.preventDefault();
          const text = event.target.value ?? "";
          setLines(parse(text));
        }}
        style={{
          width: "300px",
          height: "300px",
          border: "4px solid black",
          display: "block",
        }}
      ></textarea>

      <pre>{JSON.stringify(lines)}</pre>
    </div>
  );
}
