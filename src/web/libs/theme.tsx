import $ from "jquery";

const root = $(":root");

function p(prop: string) {
    return root.css(prop).trim();
}

export default function() {
    return {
        pagebg: p("--page-background"),
        compbg: p("--component-background"),
        text: p("--page-text"),
        textgray: p("--page-text-gray"),
        textbold: p("--page-text-bold"),
    }
};