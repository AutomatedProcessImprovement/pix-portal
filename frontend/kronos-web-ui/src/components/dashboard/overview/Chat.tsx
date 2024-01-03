import React, { useState } from 'react';
import { Card, TextField, Button, Typography, List, ListItem } from '@mui/material';

interface ChatProps {
    jobid: string;
}

export default function Chat({ jobid }: ChatProps) {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<string[]>([]);

    const handleSendMessage = () => {
        // Mock sending message to backend
        setChatHistory(prevHistory => [...prevHistory, message]);
        setMessage('');
    };

    return (
        <Card style={{ padding: '1rem', margin: 'auto' }}>
            <Typography variant="h6">
                Chat
            </Typography>
            <List>
                {chatHistory.map((message, index) => (
                    <ListItem key={index}>
                        {message}
                    </ListItem>
                ))}
            </List>
            <div style={{ display: 'flex', marginTop: '1rem' }}>
                <TextField
                    variant="outlined"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    fullWidth
                    placeholder="Type a message"
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                    style={{ marginLeft: '1rem' }}
                >
                    Send
                </Button>
            </div>
        </Card>
    );
}
