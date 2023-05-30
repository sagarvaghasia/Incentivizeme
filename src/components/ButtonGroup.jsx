import { ButtonGroup } from "@mui/material"
import { LoadingButton } from '@mui/lab';

export const StatusButtonGroup = ({onClick, loading, reverseLoading, variant, reverseVariant, style, reverseStyle,buttonsTitle}:any) => {
    return (
        <ButtonGroup
            variant='outlined'
            color='inherit'
            style={{ width: '100%' }}
        >
            <LoadingButton
                size='small'
                loading = { reverseLoading }
                variant = {reverseVariant} 
                style={{  ...reverseStyle, width: '100%', boxShadow: 'none' }}
                onClick={onClick}
            >
                {buttonsTitle.button1}
            </LoadingButton>
            <LoadingButton
                variant={variant}
                size='small'
                loading = { loading }
                style={{
                    ...style,
                    width: '100%',
                    boxShadow: 'none',
                }}
                onClick={onClick}
            >
                {buttonsTitle.button2}
            </LoadingButton>
        </ButtonGroup>
    )    
}