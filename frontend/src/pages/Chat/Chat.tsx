import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  Add,
  Menu as MenuIcon,
  SmartToy,
  Person,
} from '@mui/icons-material';
import { chatService } from '@/services/chatService';
import { ChatSession, ChatMessage } from '@/types';

const drawerWidth = 300;

const Chat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await chatService.getSessions();
      setSessions(data);
      if (data.length > 0) {
        await selectSession(data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: ChatSession) => {
    try {
      setCurrentSession(session);
      const sessionMessages = await chatService.getSessionMessages(session.id);
      setMessages(sessionMessages);
      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load messages');
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await chatService.createSession('New Chat Session');
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create new session');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession || sending) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Add user message to UI immediately
      const tempUserMessage: ChatMessage = {
        id: 'temp-user',
        content: userMessage,
        role: 'USER',
        createdAt: new Date().toISOString(),
        sessionId: currentSession.id,
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Send message to backend
      const response = await chatService.sendMessage({
        content: userMessage,
        sessionId: currentSession.id,
      });

      // Replace temp message with real message and add AI response
      const updatedMessages = await chatService.getSessionMessages(currentSession.id);
      setMessages(updatedMessages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove the temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== 'temp-user'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageContent = (content: string) => {
    // Simple formatting for line breaks and basic structure
    return content.split('\n').map((line, index) => (
      <Box key={index} component="span">
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </Box>
    ));
  };

  const sessionDrawer = (
    <Box sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Add />}
          onClick={createNewSession}
        >
          New Chat
        </Button>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {sessions.map((session) => (
            <ListItemButton
              key={session.id}
              selected={currentSession?.id === session.id}
              onClick={() => selectSession(session)}
            >
              <ListItemText
                primary={session.title || 'Chat Session'}
                secondary={new Date(session.createdAt).toLocaleDateString()}
              />
            </ListItemButton>
          ))}
        </List>
        {sessions.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No chat sessions yet
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {sessionDrawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            position: 'relative',
            border: 'none',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {sessionDrawer}
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            {currentSession?.title || 'AI Geotechnical Assistant'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {!currentSession ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <SmartToy sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Welcome to AI Geotechnical Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start a new conversation to get expert geotechnical engineering guidance
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={createNewSession}>
                Start New Chat
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {/* Messages */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Start the conversation by asking a geotechnical engineering question
                  </Typography>
                </Box>
              ) : (
                messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      mb: 2,
                      flexDirection: message.role === 'USER' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: message.role === 'USER' ? 'primary.main' : 'secondary.main',
                        mx: 1,
                      }}
                    >
                      {message.role === 'USER' ? <Person /> : <SmartToy />}
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: message.role === 'USER' ? 'primary.light' : 'grey.100',
                        color: message.role === 'USER' ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body1">
                        {formatMessageContent(message.content)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              {sending && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mx: 1 }}>
                    <SmartToy />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        AI is thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about geotechnical engineering..."
                  variant="outlined"
                  disabled={sending}
                />
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  {sending ? <CircularProgress size={24} /> : <Send />}
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Chat;
