import React, { useRef } from 'react';
import { CSSTransition as OrigCSSTransition } from 'react-transition-group';

const CSSTransition = (props) => {
    const nodeRef = useRef(null);

    return (
        <OrigCSSTransition {...props} nodeRef={nodeRef}>
            <>
                {React.Children.map(props.children, (child) => {
                    // @ts-ignore
                    return React.cloneElement(child, { ref: nodeRef });
                })}
            </>
        </OrigCSSTransition>
    );
};

export default CSSTransition;
