import type { EditorThemeClasses } from 'lexical';

export const newMessageAreaTheme: EditorThemeClasses = {
  paragraph: 'mb-1 last:mb-0',
  link: 'text-lime-400 underline cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'rounded bg-white/10 px-1 font-mono text-sm',
  },
};
