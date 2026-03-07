import "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    alt?: string;
                    ar?: boolean | string;
                    "ar-modes"?: string;
                    "camera-controls"?: boolean | string;
                    "auto-rotate"?: boolean | string;
                    "touch-action"?: string;
                    "shadow-intensity"?: string | number;
                    style?: React.CSSProperties;
                },
                HTMLElement
            >;
        }
    }
}
