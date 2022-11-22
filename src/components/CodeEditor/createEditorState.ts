import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import {
  bracketMatching,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { Compartment, EditorState } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  scrollPastEnd,
} from '@codemirror/view'
import { classHighlighter } from '@lezer/highlight'

const disableSpellchecking = {
  'data-gramm': 'false',
  spellcheck: 'false',
}

function createEditorState(content: string) {
  const languageHighlightExtension = new Compartment()
  const languageServiceExtensions = new Compartment()
  const contentHandlingExtensions = new Compartment()
  const editabilityExtensions = new Compartment()

  const state = EditorState.create({
    doc: content,
    extensions: [
      EditorView.contentAttributes.of(disableSpellchecking),
      editabilityExtensions.of([]),
      lineNumbers(),
      bracketMatching(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      scrollPastEnd(),
      EditorState.tabSize.of(2),
      drawSelection(),
      dropCursor(),
      closeBrackets(),
      indentOnInput(),
      highlightActiveLine(),
      keymap.of([
        ...defaultKeymap,
        ...closeBracketsKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab,
        {
          // Override default browser Ctrl/Cmd+S shortcut when a code editor is focused.
          key: 'Mod-s',
          run: () => true,
        },
      ]),
      languageServiceExtensions.of([]),
      contentHandlingExtensions.of([]),
      languageHighlightExtension.of([]),
      syntaxHighlighting(classHighlighter),
    ],
  })

  return {
    state,
    languageHighlightExtension,
    languageServiceExtensions,
    contentHandlingExtensions,
    editabilityExtensions,
  }
}

export default createEditorState
