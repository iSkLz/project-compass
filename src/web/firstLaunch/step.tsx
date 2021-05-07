import React, { Component } from "react";

interface Props {
    step: string;
}

export default class Step extends Component<Props, {}> {
    public render() {
        return (
            <div className="vcenter-self width-100"><StepHead step={this.props.step} /></div>
        );
    }
}

class StepHead extends Component<Props, {}> {
    public render() {
        return (<>
            <h4>HELLO ${this.props.step}</h4>
        </>);
    }
}