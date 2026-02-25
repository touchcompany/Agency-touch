'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Code, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Undo, Redo, Heading1, Heading2
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

// For simplicity, we define a small Toggle component locally if not available
function EditorToggle({ 
  pressed, 
  onPressedChange, 
  children, 
  title 
}: { 
  pressed: boolean; 
  onPressedChange: () => void; 
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onPressedChange();
      }}
      title={title}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md transition-colors hover:bg-muted",
        pressed ? "bg-muted text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escribe algo...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none p-4",
          className
        ),
      },
    },
  });

  // Sync value if changed from outside (e.g. IA generation)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-input bg-background overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/20 border-b">
        <EditorToggle
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          title="Subrayado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </EditorToggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <EditorToggle
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </EditorToggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <EditorToggle
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista de viñetas"
        >
          <List className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </EditorToggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <EditorToggle
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive('codeBlock')}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloque de código"
        >
          <Code className="h-4 w-4" />
        </EditorToggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <EditorToggle
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          title="Alinear izquierda"
        >
          <AlignLeft className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          title="Centrar"
        >
          <AlignCenter className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          title="Alinear derecha"
        >
          <AlignRight className="h-4 w-4" />
        </EditorToggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const url = window.prompt('URL del enlace:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            } else if (url === '') {
              editor.chain().focus().unsetLink().run();
            }
          }}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-md transition-colors hover:bg-muted",
            editor.isActive('link') ? "bg-muted text-primary" : "text-muted-foreground"
          )}
          title="Enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <EditorToggle
          pressed={false}
          onPressedChange={() => editor.chain().focus().undo().run()}
          title="Deshacer"
        >
          <Undo className="h-4 w-4" />
        </EditorToggle>
        <EditorToggle
          pressed={false}
          onPressedChange={() => editor.chain().focus().redo().run()}
          title="Rehacer"
        >
          <Redo className="h-4 w-4" />
        </EditorToggle>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
