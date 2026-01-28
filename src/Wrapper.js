export const Wrapper = ({ children,condition,wrapper}) => {
    return (
        condition ? wrapper(children) : children
    );
}


export const LinkIfURL = ({ children, text, ...props }) => {
    return (
        text.match(/https?:\/\/\S+/) ? <a href={text} {...props}>{children}</a> : children
    );
}
