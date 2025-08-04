import parse, { DOMNode, Element, domToReact } from "html-react-parser";
import Image from "next/image";

export const TailwindStyledContent = ({ content }: { content: string }) => {
  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode.type === "tag") {
        const el = domNode as Element;

        const props = { ...el.attribs };
        delete props.class;
        delete props.className;

        if (el.name !== "img" && el.name !== "iframe") {
          delete props.style;
        }

        const isEmptyElement = () => {
          if (
            el.name !== "p" &&
            el.name !== "h1" &&
            el.name !== "h2" &&
            el.name !== "h3"
          )
            return false;

          const children = el.children as DOMNode[];
          if (children.length === 0) return true;
          return children.every((child) => {
            if (child.type === "text") return !child.data.trim();

            if (child.type === "tag" && child.name === "br") return true;

            return false;
          });
        };

        // Handle each element type
        switch (el.name) {
          case "h1":
            if (isEmptyElement()) return <h1 className="hidden"></h1>;
            return (
              <h1 className="text-[40px] font-anton  mb-4" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </h1>
            );
          case "h2":
            if (isEmptyElement()) return <h2 className="mb-10"></h2>;
            return (
              <h2
                className="text-[40px] font-normal font-anton mb-3"
                {...props}
              >
                {domToReact(el.children as DOMNode[], options)}
              </h2>
            );
          case "h3":
            if (isEmptyElement()) return <h3 className="hidden"></h3>;
            return (
              <h3 className="text-xl mb-2" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </h3>
            );
          case "p":
            if (isEmptyElement()) return <p className="mb-8"></p>;

            return (
              <p className="text-base text-white/75 leading-6" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </p>
            );
          case "a":
            return (
              <a className="text-peach-400 hover:text-peach-400/80" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </a>
            );
          case "ul":
            return (
              <ul
                className="list-disc text-white/75 list-inside mb-4"
                {...props}
              >
                {domToReact(el.children as DOMNode[], options)}
              </ul>
            );
          case "ol":
            return (
              <ol
                className="list-decimal text-white/75 list-inside mb-4"
                {...props}
              >
                {domToReact(el.children as DOMNode[], options)}
              </ol>
            );
          case "li":
            return (
              <li className="mb-1 text-white/75" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </li>
            );
          case "code":
            return (
              <code
                className="bg-gray-800 rounded p-1 font-mono text-sm"
                {...props}
              >
                {domToReact(el.children as DOMNode[], options)}
              </code>
            );
          case "pre":
            return (
              <pre
                className="bg-[#27272a] w-full rounded p-4 mb-4 overflow-x-auto"
                {...props}
              >
                {domToReact(el.children as DOMNode[], options)}
              </pre>
            );
          case "strong":
            return (
              <strong className="font-bold" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </strong>
            );
          case "img":
            return (
              <Image
                src={el.attribs.src}
                alt={el.attribs.alt || ""}
                width={500}
                height={500}
                className="rounded-lg my-4 max-h-[700px] w-full"
              />
            );

          case "span":
            return (
              <span className="text-white/75" {...props}>
                {domToReact(el.children as DOMNode[], options)}
              </span>
            );

          case "iframe":
            return (
              <iframe
                src={el.attribs.src}
                width="100%"
                height="100%"
                className="rounded-lg my-8 h-[500px] w-full"
                allow="clipboard-write"
                allowFullScreen
              />
            );
          default:
            return;
        }
      }
    },
  };

  return <div className="prose-base max-w-none">{parse(content, options)}</div>;
};
