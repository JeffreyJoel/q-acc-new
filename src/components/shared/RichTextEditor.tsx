import React, { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { uploadToIPFS } from '@/services/ipfs';
import { handleImageUrl } from '@/helpers/image';

// Custom dark theme for the Rich-Text editor
const customStyles = `
  .custom-editor-container {
    background: #0c0c0c;
    /* border: 1px solid #2a2a2a; */
    border-radius: 24px;
    overflow: hidden;
  }

  /* Toolbar */
  .custom-editor-container .ql-toolbar {
    background: #0a0a0a;
    border: none;
    border-bottom: 1px solid #3a3a3a;
  }

  .custom-editor-container .ql-toolbar .ql-stroke { stroke: #6b6b6b; }
  .custom-editor-container .ql-toolbar .ql-fill   { fill:   #6b6b6b; }
  .custom-editor-container .ql-toolbar .ql-picker-label { color: #6b6b6b; }
  .custom-editor-container .ql-toolbar .ql-picker-label:hover,
  .custom-editor-container .ql-toolbar .ql-picker-label.ql-active {
    color: #ffb07c;
  }
  .custom-editor-container .ql-toolbar .ql-picker-label:hover .ql-stroke,
  .custom-editor-container .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .custom-editor-container .ql-toolbar .ql-picker-label:hover .ql-fill,
  .custom-editor-container .ql-toolbar .ql-picker-label.ql-active .ql-fill {
    stroke: #ffb07c;
    fill: #ffb07c;
  }

  /* Dropdown picker items */
  .custom-editor-container .ql-toolbar .ql-picker-item:hover,
  .custom-editor-container .ql-toolbar .ql-picker-item.ql-selected {
    color: #ffb07c;
  }
  .custom-editor-container .ql-toolbar .ql-picker-item:hover .ql-stroke,
  .custom-editor-container .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .custom-editor-container .ql-toolbar .ql-picker-item:hover .ql-fill,
  .custom-editor-container .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
    stroke: #ffb07c;
    fill: #ffb07c;
  }

  /* Ensure active picker label text and caret use peach */
  .custom-editor-container .ql-toolbar .ql-picker-label.ql-active {
    color: #ffb07c;
  }
  .custom-editor-container .ql-toolbar .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) .ql-picker-label.ql-active::before,
  .custom-editor-container .ql-toolbar .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) .ql-picker-label:hover::before {
    border-top-color: #ffb07c; /* caret arrow */
  }
  .custom-editor-container .ql-toolbar .ql-picker-item.ql-selected::before {
    color: #ffb07c;
  }

  .custom-editor-container .ql-toolbar button:hover .ql-stroke,
  .custom-editor-container .ql-toolbar button.ql-active .ql-stroke {
    stroke: #ffb07c; /* peach shade */
  }
  .custom-editor-container .ql-toolbar button:hover .ql-fill,
  .custom-editor-container .ql-toolbar button.ql-active .ql-fill {
    fill: #ffb07c; /* peach shade */
  }

  .custom-editor-container .ql-toolbar button {
    width: 32px;
    height: 32px;
    padding: 4px;
    margin: 0 2px;
    border-radius: 6px;
    transition: background 0.2s;
  }
  .custom-editor-container .ql-toolbar button:hover,
  .custom-editor-container .ql-toolbar button.ql-active {
    background: #2a2a2a;
  }

  /* Editor */
  .custom-editor-container .ql-container {
    background: #0c0c0c;
    border: none;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
  }
  .custom-editor-container .ql-editor {
    min-height: 400px;
    padding: 24px;
    line-height: 1.6;
  }
  .custom-editor-container .ql-editor h1 {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0.67em 0;
    color: #ffffff;
  }
  .custom-editor-container .ql-editor h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0.75em 0;
    color: #ffffff;
  }
  .custom-editor-container .ql-editor strong { font-weight: 600; color: #ffffff; }
  .custom-editor-container .ql-editor a {
    color: #ffb07c;
  }
  .custom-editor-container .ql-snow .ql-tooltip a.ql-action::after {
    color: #ffb07c;
  }

  /* Scrollbar */
  .custom-editor-container .ql-editor::-webkit-scrollbar { width: 8px; }
  .custom-editor-container .ql-editor::-webkit-scrollbar-track { background: #0c0c0c; }
  .custom-editor-container .ql-editor::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 4px; }
  .custom-editor-container .ql-editor::-webkit-scrollbar-thumb:hover { background: #4a4a4a; }
`;

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction
  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],
  ['clean'], // remove formatting button
];

interface RichTextEditorProps {
  name: string;
  label?: string;
  description?: string;
  rules?: RegisterOptions;
  maxLength?: number;
  defaultValue?: string;
}

enum QuillState {
  NOT_INITIALIZED,
  INITIALIZING,
  INITIALIZED,
}

// Remove the Base64 image from the editor
const removeBase64Image = (quill: any, range: any) => {
  quill.deleteText(range.index - 1, 1);
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  label,
  description,
  rules,
  maxLength,
  defaultValue,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillInstanceRef = useRef<any>(null);
  const quillStateRef = useRef<any>(QuillState.NOT_INITIALIZED);
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const [charCount, setCharCount] = useState(0);

  // Register the editor field with react-hook-form
  useEffect(() => {
    const initializeQuill = async () => {
      if (
        quillStateRef.current === QuillState.NOT_INITIALIZED &&
        editorRef.current
      ) {
        quillStateRef.current = QuillState.INITIALIZING;
        const { default: Quill } = await import('quill');

        const quillInstance = new Quill(editorRef.current, {
          modules: {
            toolbar: {
              container: toolbarOptions,
              handlers: {
                image: imageHandler,
              },
            },
          },
          theme: 'snow',
        });

        quillInstance.root.addEventListener(
          'paste',
          async (event: ClipboardEvent) => {
            event.preventDefault();
            const clipboardData = event.clipboardData;
            if (clipboardData) {
              const items = Array.from(clipboardData.items);
              for (const item of items) {
                if (item.type.startsWith('image/')) {
                  event.preventDefault(); // Prevent default paste behavior for images
                  const file = item.getAsFile();
                  if (file) {
                    try {
                      const imageIpfsHash = await uploadToIPFS(file);
                      if (imageIpfsHash) {
                        const imageUrl = handleImageUrl(imageIpfsHash);
                        const range = quillInstance.getSelection();
                        if (range) {
                          removeBase64Image(quillInstance, range);
                          quillInstance.insertEmbed(
                            range.index,
                            'image',
                            imageUrl,
                          );
                        }
                      }
                    } catch (error) {
                      console.error('Error uploading pasted image:', error);
                    }
                  }
                }
              }
            }
          },
        );
        quillInstanceRef.current = quillInstance;
        quillStateRef.current = QuillState.INITIALIZED;
        console.log('OUT');

        if (defaultValue) {
          console.log('INSIDE');
          quillInstance.clipboard.dangerouslyPasteHTML(defaultValue); // Set the default value as HTML content
        }

        quillInstance.on('text-change', () => {
          const text = quillInstance.getText().trim();
          setCharCount(text.length);
          setValue(name, quillInstance.root.innerHTML, {
            shouldValidate: true,
          });
        });
      }
    };

    // Initialize Quill only if it's not initialized already
    if (quillStateRef.current === QuillState.NOT_INITIALIZED) {
      initializeQuill();
    }

    return () => {
      quillInstanceRef.current = null; // Clean up the instance on unmount
    };
  }, [name, setValue]);

  useEffect(() => {
    if (quillStateRef.current === QuillState.INITIALIZED && defaultValue) {
      quillInstanceRef.current.clipboard.dangerouslyPasteHTML(defaultValue);
    }
  }, [defaultValue]);

  /* ------------------------------------------------------
   * Inject the custom CSS once when the component mounts
   * ---------------------------------------------------- */
  useEffect(() => {
    const STYLE_ID = 'rich-text-editor-custom-style';
    if (!document.getElementById(STYLE_ID)) {
      const styleTag = document.createElement('style');
      styleTag.id = STYLE_ID;
      styleTag.innerHTML = customStyles;
      document.head.appendChild(styleTag);
    }
    return () => {
      const styleTag = document.getElementById(STYLE_ID);
      if (styleTag) styleTag.remove();
    };
  }, []);

  // Image handler function
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && quillInstanceRef.current) {
        const range = quillInstanceRef.current.getSelection();
        if (range) {
          try {
            const imageIpfsHash = await uploadToIPFS(file);
            if (imageIpfsHash) {
              const imageUrl = handleImageUrl(imageIpfsHash);
              quillInstanceRef.current.insertEmbed(
                range.index,
                'image',
                imageUrl,
              );
            }
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }
      }
    };
  };

  return (
    <div>
      {label && (
        <label className='block text-sm font-medium text-neutral-300'>
          {label}
        </label>
      )}
      {/* Wrapper gets the custom class so all the rules apply */}
      <div className='custom-editor-container'>
        <div
          ref={editorRef}
          className='focus:ring-peach-400 focus:border-peach-400 outline-none'
          style={{ height: '400px' }}
        />
      </div>
      {description && (
        <p className='text-sm text-neutral-400 mt-1'>{description}</p>
      )}
      {/* {maxLength && (
        <div className='text-right text-sm text-gray-500 mt-1'>
          {charCount}/{maxLength} characters
        </div>
      )} */}
      {errors[name] && (
        <p className='text-red-500 text-xs mt-1'>
          {(errors[name]?.message as string) || 'Error'}
        </p>
      )}
    </div>
  );
};
