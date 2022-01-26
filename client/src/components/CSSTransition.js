import React, { useRef } from 'react';
import { CSSTransition as _CSSTransition } from 'react-transition-group';

const CSSTransition = (props) => {
    const nodeRef = useRef(null);

    return (
        <_CSSTransition {...props} nodeRef={nodeRef}>
            <>
                {React.Children.map(props.children, (child) => {
                    // @ts-ignore
                    return React.cloneElement(child, { ref: nodeRef });
                })}
            </>
        </_CSSTransition>
    );
};

export default CSSTransition;
