import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


export default function Infobox(data: any) {
    return (
        <Card sx={{minWidth: 250}}>
            <CardContent>
                <Typography align={"left"} variant="h5" component="div" sx={{fontSize: 18}} color="text.primary"
                            gutterBottom>
                    {data.data.title}
                </Typography>
                <Typography align={"left"} variant="h6" sx={{fontSize: 16}} color="text.secondary" component="div">
                    {data.data.subtitle}
                </Typography>
                <Typography variant="h4" align={"center"}>
                    {data.data.value}
                </Typography>
            </CardContent>
        </Card>
    );
}