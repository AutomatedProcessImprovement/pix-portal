import { Button, Tooltip } from "@mui/material";

interface ButtonToolbarBaseProps {
    onClick: () => void
    labelName: string
    startIcon: React.ReactNode
    variant: "text" | "outlined"
    tooltipText?: string
}

const ButtonToolbarBase = (props: ButtonToolbarBaseProps) => {
    const { variant, startIcon, onClick, labelName, tooltipText } = props

    const getButtonBase = (): JSX.Element => {
        return (
            <Button
                variant={variant}
                startIcon={startIcon}
                onClick={onClick}
                size="small"
            >
                {labelName}
            </Button>
        )
    }

    return (
        (tooltipText !== undefined)
            ? <Tooltip title={tooltipText}>{getButtonBase()}</Tooltip>
            : getButtonBase()
    )
}

export default ButtonToolbarBase;
