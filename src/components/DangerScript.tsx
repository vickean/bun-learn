import { HtmlEscapedString } from 'hono/utils/html'

export const DangerScript: (props: {function: any;}) => HtmlEscapedString = (props: { function: () => void  }) => {
    return (
        <script dangerouslySetInnerHTML={{__html: props.function.toString() }}/>
    )
}