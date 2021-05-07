import React, { Component } from "react";
import Step from "./step.js";

interface State {
    step: string;
}

export default class Setup extends Component<{}, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            step: "0"
        };
    }

    public render() {
        return (
            <div className="vheight-100 align-center">
                <Step step={this.state.step} />
            </div>
        );
    }
}